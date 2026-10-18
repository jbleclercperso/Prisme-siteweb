// Dit à la page de remerciement où en est un paiement.
//
// GET /api/session?session_id=cs_…
//   → 200 { "status": "paid" | "pending" | "open", "plan": "…", "email": "j•••@exemple.fr",
//           "licence": "PRISME1-…" (une fois payé) }
// L'identifiant de session, long et aléatoire, n'est connu que de l'acheteur :
// on ne rend pourtant que le strict nécessaire, et l'adresse masquée.
import { licenceForSession, privateKey } from "../lib/licence.mjs";
import { PLANS, json, stripeClient } from "../lib/stripe.mjs";

function mask(email) {
  if (!email || !email.includes("@")) return "";
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}•••@${domain}`;
}

export default async (req) => {
  const stripe = stripeClient();
  if (!stripe) return json(503, { error: "not_configured" });

  const id = new URL(req.url).searchParams.get("session_id") || "";
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return json(400, { error: "session_id" });

  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    const known = Object.entries(PLANS).find(([, p]) => p.lookupKey === session.metadata?.plan);
    let status = "open";
    if (session.status === "complete") {
      status = session.payment_status === "unpaid" ? "pending" : "paid";
    }
    const licence = status === "paid" ? await licenceForSession(stripe, session, privateKey()) : null;
    return json(200, {
      status,
      plan: known ? known[0] : "",
      email: mask(session.customer_details?.email),
      licence: licence || "",
    });
  } catch (err) {
    if (err.statusCode === 404) return json(404, { error: "unknown" });
    console.error("session", err.type || "", err.message);
    return json(502, { error: "stripe" });
  }
};

export const config = { path: "/api/session" };
