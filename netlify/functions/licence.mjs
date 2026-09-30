// Prolonge la clé d'un abonnement. Prism l'appelle de lui-même dans les
// derniers jours de sa clé, une fois par jour au plus, en n'envoyant que
// la clé : rien de la collection.
//
// POST /api/licence  { "key": "PRISME1-…" }
//   → 200 { "key": "PRISME1-…", "ending": false }   abonnement en cours
//   → 200 { "status": "ended" }                     abonnement terminé
//   → 400 clé illisible ou pas de nous
import { makeKey, privateKey, readKey, subscriptionKeyFields } from "../lib/licence.mjs";
import { json, stripeClient } from "../lib/stripe.mjs";

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "method" });
  const stripe = stripeClient();
  const key = privateKey();
  if (!stripe || !key) return json(503, { error: "not_configured" });

  let payload;
  try {
    payload = readKey((await req.json()).key, key);
  } catch {
    payload = null;
  }
  if (!payload) return json(400, { error: "key" });
  if (payload.p === "lifetime") return json(200, { key: makeKey(stripFields(payload), key), ending: false });
  if (!payload.s) return json(400, { error: "key" });

  try {
    const subscription = await stripe.subscriptions.retrieve(payload.s);
    const fields = subscriptionKeyFields(subscription);
    if (!fields.live) return json(200, { status: "ended" });
    const fresh = makeKey({ ...stripFields(payload), i: Math.floor(Date.now() / 1000), x: fields.x }, key);
    return json(200, { key: fresh, ending: fields.ending });
  } catch (err) {
    if (err.statusCode === 404) return json(200, { status: "ended" });
    console.error("licence", err.type || "", err.message);
    return json(502, { error: "stripe" });
  }
};

function stripFields({ v, ...rest }) {
  return rest;
}

export const config = { path: "/api/licence" };
