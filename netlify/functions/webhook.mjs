// Reçoit les événements de Stripe : paiement réussi, abonnement renouvelé,
// échoué ou résilié.
//
// POST /api/webhook — l'adresse à déclarer dans Stripe (Développeurs › Webhooks),
// avec les événements listés dans WEBHOOK_EVENTS (netlify/lib/stripe.mjs).
//
// C'est ici, et seulement ici, qu'un achat doit être honoré : la page de
// remerciement peut ne jamais s'afficher (onglet fermé, réseau coupé), le
// webhook, lui, est rejoué par Stripe jusqu'à ce qu'il réponde 200.
import { licenceForSession, privateKey } from "../lib/licence.mjs";
import { json, stripeClient } from "../lib/stripe.mjs";

// Ce qu'il faut faire de chaque événement. Chacun est consigné dans le
// journal des fonctions Netlify ; un achat payé reçoit en plus sa clé de
// licence, gardée dans la fiche du client Stripe (champ « prisme_licence ») :
// c'est là que le support la retrouve si l'acheteur l'a perdue.
async function handle(event, stripe) {
  const o = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      if (o.payment_status === "unpaid") {
        console.log("paiement en attente", o.id, o.metadata?.plan);
      } else {
        console.log("achat", o.id, o.metadata?.plan, o.customer);
        const licence = await licenceForSession(stripe, o, privateKey());
        if (licence && o.customer) {
          await stripe.customers.update(o.customer, { metadata: { prisme_licence: licence } });
        }
      }
      break;
    case "checkout.session.async_payment_failed":
      console.log("paiement différé refusé", o.id, o.metadata?.plan);
      break;
    case "invoice.paid":
      console.log("facture payée", o.id, o.billing_reason, o.customer);
      break;
    case "invoice.payment_failed":
      console.log("échec de prélèvement", o.id, o.customer);
      break;
    case "customer.subscription.deleted":
      console.log("abonnement terminé", o.id, o.customer);
      break;
    default:
      break;
  }
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "method" });

  const stripe = stripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return json(503, { error: "not_configured" });

  // La signature porte sur le corps brut, octet pour octet : il ne doit
  // surtout pas être relu comme JSON avant la vérification.
  const body = await req.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, req.headers.get("stripe-signature") || "", secret);
  } catch (err) {
    console.warn("webhook refusé :", err.message);
    return json(400, { error: "signature" });
  }

  try {
    await handle(event, stripe);
  } catch (err) {
    // Une erreur rend 500 : Stripe rejouera l'événement plus tard.
    console.error("webhook", event.type, err.message);
    return json(500, { error: "handler" });
  }
  return json(200, { received: true });
};

export const config = { path: "/api/webhook" };
