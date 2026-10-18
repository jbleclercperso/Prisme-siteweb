// Reçoit les événements de Stripe : paiement réussi, abonnement renouvelé,
// échoué ou résilié.
//
// POST /api/webhook — l'adresse à déclarer dans Stripe (Développeurs › Webhooks),
// avec les événements listés dans WEBHOOK_EVENTS (netlify/lib/stripe.mjs).
//
// C'est ici, et seulement ici, qu'un achat doit être honoré : la page de
// remerciement peut ne jamais s'afficher (onglet fermé, réseau coupé), le
// webhook, lui, est rejoué par Stripe jusqu'à ce qu'il réponde 200.
import { envoyerLicence } from "../lib/courriel.mjs";
import { KEY_PLAN, PLAN_OF_LOOKUP, licenceForSession, privateKey } from "../lib/licence.mjs";
import { ligneDepuisEvenement, noterPaiement } from "../lib/paiements.mjs";
import { json, stripeClient } from "../lib/stripe.mjs";

// Ce qu'il faut faire de chaque événement. Chacun est consigné dans le
// journal des fonctions Netlify et noté dans la table commune des paiements
// (lib/paiements.mjs) ; un achat payé reçoit en plus sa clé de licence,
// gardée dans la fiche du client Stripe (champ « prisme_licence ») — c'est là
// que le support la retrouve si l'acheteur l'a perdue — et envoyée par
// e-mail à l'acheteur (lib/courriel.mjs).
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
          // L'e-mail de la clé, une seule fois par achat (Stripe peut rejouer l'événement).
          const client = await stripe.customers.retrieve(o.customer);
          if (client.metadata?.prisme_licence_envoyee !== o.id) {
            // Un e-mail qui échoue (domaine pas encore vérifié chez Resend, panne) ne doit
            // bloquer ni la vente ni sa trace : la clé reste affichée sur la page Merci et
            // dans la fiche client Stripe, d'où le support la renvoie.
            let envoi = "echec";
            try {
              envoi = await envoyerLicence({
                email: o.customer_details?.email,
                licence,
                planCle: KEY_PLAN[PLAN_OF_LOOKUP[o.metadata?.plan]],
                lang: o.metadata?.lang === "en" ? "en" : "fr",
                idempotence: `licence-${o.id}`,
              });
            } catch (err) {
              console.error("e-mail de la clé en échec", o.id, err.message);
            }
            console.log("e-mail de la clé :", envoi, o.id);
            if (envoi === "envoye") {
              await stripe.customers.update(o.customer, { metadata: { prisme_licence_envoyee: o.id } });
            }
          }
        }
        await noterPaiement(ligneDepuisEvenement(event, { cle_licence: licence || "" }));
      }
      break;
    case "checkout.session.async_payment_failed":
      console.log("paiement différé refusé", o.id, o.metadata?.plan);
      break;
    case "invoice.paid":
    case "invoice.payment_failed":
    case "customer.subscription.deleted":
    case "charge.refunded": {
      console.log(event.type, o.id, o.customer);
      const ligne = ligneDepuisEvenement(event);
      if (ligne) await noterPaiement(ligne);
      break;
    }
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
