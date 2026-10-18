// La table commune des paiements de tous les sites du fondateur (Prisme, ConchyPro, PixMedic…),
// dans le projet Supabase de ConchyPro (migration 0047_paiements_sites.sql du dépôt
// conchypro-dashboard). Chaque vente Prisme y est notée avec produit = "prisme".
//
// Réglages (variables Netlify) :
//   PAIEMENTS_URL       adresse du projet Supabase (https://….supabase.co)
//   PAIEMENTS_ANON_KEY  sa clé publique « anon »
//   PAIEMENTS_SECRET    le secret de Prisme : select valeur from private.config
//                       where cle = 'secret_paiements_prisme';
// Sans eux, rien n'est noté (le paiement et la clé fonctionnent quand même).
//
// La fonction paiement_noter() ignore un événement Stripe déjà noté : Stripe peut rejouer un
// événement sans créer de doublon.

export const PRODUIT = "prisme";

export function paiementsPrets() {
  return Boolean(process.env.PAIEMENTS_URL && process.env.PAIEMENTS_ANON_KEY && process.env.PAIEMENTS_SECRET);
}

/** Appelle une fonction de la base (rpc), avec le secret de Prisme. Lève une erreur si la base
 *  n'est pas branchée ou refuse. Utilisé aussi par /api/activation (deux ordinateurs par licence,
 *  migration 0048_prisme_activations.sql). */
export async function appelerBase(fonction, corps) {
  if (!paiementsPrets()) throw new Error("base non branchée (PAIEMENTS_URL, PAIEMENTS_ANON_KEY, PAIEMENTS_SECRET)");
  const base = process.env.PAIEMENTS_URL.replace(/\/+$/, "");
  const anon = process.env.PAIEMENTS_ANON_KEY;
  const res = await fetch(`${base}/rest/v1/rpc/${fonction}`, {
    method: "POST",
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_secret: process.env.PAIEMENTS_SECRET, ...corps }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${fonction} ${res.status} ${detail.slice(0, 200)}`);
  }
  return res.json();
}

/** Note un événement de paiement. Ne fait rien si la table n'est pas branchée ; lève une erreur
 *  si elle l'est mais refuse (le webhook répond alors 500 et Stripe rejouera l'événement). */
export async function noterPaiement(ligne) {
  if (!paiementsPrets()) return "absent";
  const base = process.env.PAIEMENTS_URL.replace(/\/+$/, "");
  const anon = process.env.PAIEMENTS_ANON_KEY;
  const corps = { p_secret: process.env.PAIEMENTS_SECRET, p_produit: PRODUIT };
  for (const [k, v] of Object.entries(ligne)) {
    if (v !== undefined && v !== null && v !== "") corps[`p_${k}`] = v;
  }
  const res = await fetch(`${base}/rest/v1/rpc/paiement_noter`, {
    method: "POST",
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
    body: JSON.stringify(corps),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`paiement_noter ${res.status} ${detail.slice(0, 200)}`);
  }
  return "note";
}

const FORMULE = { prisme_mensuel: "mensuel", prisme_annuel: "annuel", prisme_a_vie: "a_vie" };
export const formuleDe = (lookupKey) => FORMULE[lookupKey] || lookupKey || "";

const idDe = (v) => (typeof v === "string" ? v : v && typeof v === "object" && typeof v.id === "string" ? v.id : "");

/** Ce que la table retient d'un événement Stripe, ou null s'il ne s'y note pas. */
export function ligneDepuisEvenement(event, extra = {}) {
  const o = event.data.object;
  const base = { stripe_evenement: event.id, survenu_le: new Date(event.created * 1000).toISOString() };
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      if (o.payment_status === "unpaid") return null;
      return {
        ...base,
        evenement: "achat",
        email: o.customer_details?.email,
        formule: formuleDe(o.metadata?.plan),
        montant_centimes: o.amount_total,
        devise: o.currency,
        pays: o.customer_details?.address?.country,
        stripe_session: o.id,
        stripe_paiement: idDe(o.payment_intent),
        stripe_facture: idDe(o.invoice),
        stripe_abonnement: idDe(o.subscription),
        stripe_client: idDe(o.customer),
        details: { lang: o.metadata?.lang || "", tva_centimes: o.total_details?.amount_tax ?? null },
        ...extra,
      };
    case "invoice.paid":
      // Le premier paiement d'un abonnement est déjà noté par la session (« achat ») :
      // seuls les renouvellements comptent ici.
      if (o.billing_reason !== "subscription_cycle") return null;
      return {
        ...base,
        evenement: "renouvellement",
        email: o.customer_email,
        formule: formuleDe(o.parent?.subscription_details?.metadata?.plan || o.subscription_details?.metadata?.plan),
        montant_centimes: o.amount_paid,
        devise: o.currency,
        pays: o.customer_address?.country,
        stripe_facture: o.id,
        stripe_abonnement: idDe(o.subscription) || idDe(o.parent?.subscription_details?.subscription),
        stripe_client: idDe(o.customer),
        ...extra,
      };
    case "invoice.payment_failed":
      return {
        ...base,
        evenement: "echec",
        email: o.customer_email,
        montant_centimes: o.amount_due,
        devise: o.currency,
        stripe_facture: o.id,
        stripe_abonnement: idDe(o.subscription) || idDe(o.parent?.subscription_details?.subscription),
        stripe_client: idDe(o.customer),
        ...extra,
      };
    case "charge.refunded":
      return {
        ...base,
        evenement: "remboursement",
        email: o.billing_details?.email || o.receipt_email,
        montant_centimes: -Math.abs(o.amount_refunded || 0),
        devise: o.currency,
        pays: o.billing_details?.address?.country,
        stripe_paiement: idDe(o.payment_intent) || o.id,
        stripe_client: idDe(o.customer),
        ...extra,
      };
    case "customer.subscription.deleted":
      return {
        ...base,
        evenement: "fin_abonnement",
        formule: formuleDe(o.metadata?.plan || o.items?.data?.[0]?.price?.lookup_key),
        stripe_abonnement: o.id,
        stripe_client: idDe(o.customer),
        ...extra,
      };
    default:
      return null;
  }
}
