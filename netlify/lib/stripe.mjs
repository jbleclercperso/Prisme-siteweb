// Réglages communs aux fonctions de paiement.
//
// Tout se règle dans les variables d'environnement de Netlify
// (Site › Configuration › Environment variables), jamais dans le code :
//   STRIPE_SECRET_KEY      clé secrète (sk_test_… pour essayer, sk_live_… en vrai)
//   STRIPE_WEBHOOK_SECRET  secret de signature du webhook (whsec_…)
//   STRIPE_TAX_RATE_ID     taux « TVA 20 % » INCLUS (txr_…), posé sur les paiements en euros
//   STRIPE_AUTOMATIC_TAX   « on » pour laisser Stripe Tax calculer la TVA (facultatif, remplace le taux)
//   RESEND_API_KEY         envoi de la clé de licence par e-mail (lib/courriel.mjs, facultatif)
//   PAIEMENTS_URL, PAIEMENTS_ANON_KEY, PAIEMENTS_SECRET
//                          table commune des paiements (lib/paiements.mjs, facultatif)
import Stripe from "stripe";

// Les prix sont retrouvés par leur « lookup key », posée par
// scripts/stripe-setup.mjs : changer un prix dans Stripe ne demande donc
// aucune modification du site, il suffit de reporter la clé sur le nouveau.
export const PLANS = {
  monthly: { lookupKey: "prisme_mensuel", mode: "subscription" },
  yearly: { lookupKey: "prisme_annuel", mode: "subscription" },
  lifetime: { lookupKey: "prisme_a_vie", mode: "payment" },
};

// Chaque langue du site a ses pages de retour et sa phrase sous le bouton
// de paiement. La monnaie, elle, dépend aussi du pays (lib/monnaie.mjs) : les
// prix en dollars sont des « options de monnaie » des mêmes prix Stripe
// (scripts/stripe-setup.mjs), sous la même lookup key.
export const LOCALES = {
  // La version grand public (à la racine du site) : en français, sans jamais
  // renvoyer vers la version adulte, ni au retour de Stripe.
  neutre: {
    locale: "fr",
    success: "/merci.html",
    cancel: "/#tarifs",
    submit: "En payant, vous acceptez les conditions de vente de Prisme et demandez l'accès immédiat au logiciel. Satisfait ou remboursé pendant 14 jours.",
  },
  fr: {
    locale: "fr",
    success: "/adulte/merci.html",
    cancel: "/adulte/#tarifs",
    submit: "En payant, vous acceptez les conditions de vente de Prisme et demandez l'accès immédiat au logiciel. Satisfait ou remboursé pendant 14 jours.",
  },
  en: {
    // « auto » : la page Stripe suit la langue du navigateur (un Allemand
    // la voit en allemand), le site n'ayant pas encore toutes les langues.
    locale: "auto",
    success: "/en/adult/thanks.html",
    cancel: "/en/adult/#tarifs",
    submit: "By paying, you accept Prisme's terms of sale and request immediate access to the software. 14-day money-back guarantee.",
  },
};

// Les événements que le webhook traite : scripts/stripe-setup.mjs les
// abonne, webhook.mjs les honore.
export const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.subscription.deleted",
  "charge.refunded",
];

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // fetch, natif dans les fonctions Netlify, plutôt que le module http de Node.
  return new Stripe(key, { maxNetworkRetries: 2, httpClient: Stripe.createFetchHttpClient() });
}

// L'adresse du site vient de Netlify (URL, ou DEPLOY_PRIME_URL sur un aperçu),
// jamais de l'en-tête Host de la requête, qui peut être falsifié.
export function siteOrigin(req) {
  const fromNetlify = process.env.CONTEXT === "production"
    ? process.env.URL
    : process.env.DEPLOY_PRIME_URL || process.env.URL;
  return (fromNetlify || new URL(req.url).origin).replace(/\/+$/, "");
}

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
