// Les clés de licence de Prism : fabriquées et signées ici, vérifiées par
// Prism seul, sans connexion (videosorter/licence.py).
//
//   PRISME1-<contenu en base64url>.<signature Ed25519 en base64url>
//
// Le contenu : { v: 1, p: formule, e: e-mail, c: client Stripe,
//                s: abonnement Stripe, i: émise le, x: vaut jusqu'au }
// (dates en secondes ; pas de x pour la licence à vie).
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
  const body = Buffer.from(JSON.stringify({ v: 1, ...payload })).toString("base64url");
  const signature = crypto.sign(null, Buffer.from(body, "ascii"), key).toString("base64url");
  return `${PREFIX}${body}.${signature}`;
}

// Le contenu d'une clé signée par nous, ou null.
export function readKey(text, key) {
  text = String(text || "").replace(/\s+/g, "");
  if (!text.startsWith(PREFIX)) return null;
  const [body, signature, extra] = text.slice(PREFIX.length).split(".");
  if (!body || !signature || extra !== undefined) return null;
  try {
    const ok = crypto.verify(null, Buffer.from(body, "ascii"), crypto.createPublicKey(key),
      Buffer.from(signature, "base64url"));
    if (!ok) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload && payload.v === 1 ? payload : null;
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
    x: periodEnd(subscription) + GRACE,
  };
}

// La clé d'un achat payé. Déterministe : le webhook et la page de
// remerciement, s'ils la fabriquent chacun de leur côté, obtiennent la même.
export async function licenceForSession(stripe, session, key) {
  const plan = PLAN_OF_LOOKUP[session.metadata?.plan];
  if (!plan || !key || session.status !== "complete" || session.payment_status === "unpaid") return null;
  const payload = {
    p: plan,
    e: session.customer_details?.email || "",
    c: typeof session.customer === "string" ? session.customer : session.customer?.id || "",
    i: session.created,
  };
  if (plan !== "lifetime") {
    const id = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (!id) return null;
    const subscription = await stripe.subscriptions.retrieve(id);
    payload.s = id;
    payload.x = subscriptionKeyFields(subscription).x;
  }
  return makeKey(payload, key);
}
