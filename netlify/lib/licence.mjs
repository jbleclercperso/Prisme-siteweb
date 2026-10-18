// Les clés de licence de Prisme : fabriquées et signées ici, vérifiées par
// Prisme seul, sans connexion (videosorter/licence.py, dans le logiciel).
//
//   PRISME1-<contenu>.<signature>
//
// <contenu> et <signature> en base64 « url » sans remplissage. Le contenu est
// un petit JSON, et la signature Ed25519 porte sur ses octets, tels quels :
//   { plan: "mois" | "an" | "vie", expires: <secondes, 0 à vie>, email,
//     issued: <émise le, secondes>, customer: <client Stripe>,
//     subscription: <abonnement Stripe, pour les seuls abonnements> }
// Le logiciel lit plan, expires et email ; customer et subscription servent
// au site, pour prolonger un abonnement. C'est le format du logiciel : s'il
// change là-bas, il change ici.
//
// La clé privée vit dans la variable PRISME_LICENCE_PRIVATE de Netlify
// (`npm run licence:keys` la fabrique). Sans elle, aucune clé n'est émise :
// le paiement fonctionne, la page de remerciement dit d'attendre l'e-mail.
import crypto from "node:crypto";

export const PREFIX = "PRISME1-";
// Une clé d'abonnement court sept jours au-delà de la période payée : un
// prélèvement refusé, ou un PC resté éteint, laisse le temps de régulariser.
export const GRACE = 7 * 86400;
// Formule du site ↔ lookup key du prix Stripe.
export const PLAN_OF_LOOKUP = { prisme_mensuel: "monthly", prisme_annuel: "yearly", prisme_a_vie: "lifetime" };
// Formule du site ↔ formule écrite dans la clé, celle que lit le logiciel.
export const KEY_PLAN = { monthly: "mois", yearly: "an", lifetime: "vie" };
const LIVE = new Set(["active", "trialing", "past_due"]);

export function privateKey() {
  const raw = process.env.PRISME_LICENCE_PRIVATE;
  if (!raw) return null;
  return crypto.createPrivateKey({ key: Buffer.from(raw, "base64"), format: "der", type: "pkcs8" });
}

export function publicKeyBase64(key) {
  return crypto.createPublicKey(key).export({ format: "der", type: "spki" }).subarray(-32).toString("base64");
}

export function makeKey(payload, key) {
  const bytes = Buffer.from(JSON.stringify(payload), "utf8");
  const signature = crypto.sign(null, bytes, key).toString("base64url");
  return `${PREFIX}${bytes.toString("base64url")}.${signature}`;
}

// Le contenu d'une clé signée par nous, ou null.
export function readKey(text, key) {
  text = String(text || "").replace(/\s+/g, "");
  if (!text.toUpperCase().startsWith(PREFIX)) return null;
  const [body, signature, extra] = text.slice(PREFIX.length).split(".");
  if (!body || !signature || extra !== undefined) return null;
  try {
    const bytes = Buffer.from(body, "base64url");
    const ok = crypto.verify(null, bytes, crypto.createPublicKey(key), Buffer.from(signature, "base64url"));
    if (!ok) return null;
    const payload = JSON.parse(bytes.toString("utf8"));
    if (!payload || !["mois", "an", "vie"].includes(payload.plan)) return null;
    payload.expires = Number(payload.expires) || 0;
    return payload;
  } catch {
    return null;
  }
}

// Fin de la période payée d'un abonnement. Selon la version de l'API Stripe,
// elle est portée par l'abonnement ou par sa ligne.
export function periodEnd(subscription) {
  return subscription.current_period_end ?? subscription.items?.data?.[0]?.current_period_end ?? 0;
}

export function subscriptionKeyFields(subscription) {
  return {
    live: LIVE.has(subscription.status),
    ending: Boolean(subscription.cancel_at_period_end),
    expires: periodEnd(subscription) + GRACE,
  };
}

// La clé d'un achat payé. Déterministe : le webhook et la page de
// remerciement, s'ils la fabriquent chacun de leur côté, obtiennent la même.
export async function licenceForSession(stripe, session, key) {
  const plan = PLAN_OF_LOOKUP[session.metadata?.plan];
  if (!plan || !key || session.status !== "complete" || session.payment_status === "unpaid") return null;
  const payload = {
    plan: KEY_PLAN[plan],
    expires: 0,
    email: session.customer_details?.email || "",
    issued: session.created,
    customer: typeof session.customer === "string" ? session.customer : session.customer?.id || "",
  };
  if (plan !== "lifetime") {
    const id = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (!id) return null;
    const subscription = await stripe.subscriptions.retrieve(id);
    payload.subscription = id;
    payload.expires = subscriptionKeyFields(subscription).expires;
  }
  return makeKey(payload, key);
}
