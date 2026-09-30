// Prépare le compte Stripe pour Prisme, en une commande :
//
//   npm install
//   STRIPE_SECRET_KEY=sk_test_… SITE_URL=https://www.prisme.app npm run stripe:setup
//
// Crée ce qui manque, et laisse tel quel ce qui existe déjà : on peut le
// relancer sans risque, en mode test puis en mode réel (sk_live_…).
//   1. le produit « Prisme » et ses trois prix, retrouvés ensuite par leur
//      lookup key (7,90 €/mois, 79 €/an, 149 € une fois, TTC) ;
//   2. l'espace client (portail Stripe) : factures, carte, résiliation, et
//      son adresse de connexion par e-mail, à reporter dans config.js ;
//   3. avec SITE_URL, le webhook /api/webhook et son secret, à reporter
//      dans les variables d'environnement de Netlify.
import Stripe from "stripe";
import { PLANS, WEBHOOK_EVENTS } from "../netlify/lib/stripe.mjs";

const PRICES = {
  [PLANS.monthly.lookupKey]: { unit_amount: 790, recurring: { interval: "month" }, nickname: "Prisme mensuel" },
  [PLANS.yearly.lookupKey]: { unit_amount: 7900, recurring: { interval: "year" }, nickname: "Prisme annuel" },
  [PLANS.lifetime.lookupKey]: { unit_amount: 14900, nickname: "Prisme à vie" },
};

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Il manque STRIPE_SECRET_KEY (Stripe › Développeurs › Clés API).");
  process.exit(1);
}
const site = (process.env.SITE_URL || "").replace(/\/+$/, "");
const stripe = new Stripe(key);
const live = key.startsWith("sk_live_");
console.log(`Compte Stripe en mode ${live ? "RÉEL" : "test"}.\n`);

// 1. Produit et prix
const existing = await stripe.prices.list({ lookup_keys: Object.keys(PRICES), active: true, limit: 10 });
const found = new Map(existing.data.map((p) => [p.lookup_key, p]));
let product = existing.data[0]?.product;
if (!product) {
  const products = await stripe.products.search({ query: "metadata['app']:'prisme'" });
  product = products.data[0]?.id;
}
if (!product) {
  product = (await stripe.products.create({
    name: "Prisme",
    description: "Logiciel Windows pour trier, organiser et regarder une collection de vidéos et de photos.",
    metadata: { app: "prisme" },
  })).id;
  console.log("Produit créé :", product);
}
for (const [lookupKey, spec] of Object.entries(PRICES)) {
  if (found.has(lookupKey)) {
    console.log(`Prix ${lookupKey} : déjà là (${found.get(lookupKey).id})`);
    continue;
  }
  const price = await stripe.prices.create({
    product,
    currency: "eur",
    tax_behavior: "inclusive",
    lookup_key: lookupKey,
    ...spec,
  });
  console.log(`Prix ${lookupKey} : créé (${price.id})`);
}

// 2. Espace client
const configs = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
const portalSettings = {
  business_profile: {
    headline: "Prisme — votre abonnement, vos factures",
    ...(site && { privacy_policy_url: `${site}/confidentialite.html`, terms_of_service_url: `${site}/cgv.html` }),
  },
  features: {
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    customer_update: { enabled: true, allowed_updates: ["email", "address"] },
    subscription_cancel: { enabled: true, mode: "at_period_end" },
  },
  login_page: { enabled: true },
};
const portal = configs.data[0]
  ? await stripe.billingPortal.configurations.update(configs.data[0].id, portalSettings)
  : await stripe.billingPortal.configurations.create(portalSettings);
console.log("\nEspace client prêt. Adresse à mettre dans assets/js/config.js, links.account :");
console.log("  " + portal.login_page.url);

// 3. Webhook
if (!site) {
  console.log("\nSans SITE_URL, le webhook n'est pas créé. Relancez avec SITE_URL=https://… une fois le site en ligne.");
} else {
  const url = `${site}/api/webhook`;
  const hooks = await stripe.webhookEndpoints.list({ limit: 100 });
  const hook = hooks.data.find((h) => h.url === url);
  if (hook) {
    await stripe.webhookEndpoints.update(hook.id, { enabled_events: WEBHOOK_EVENTS });
    console.log(`\nWebhook déjà déclaré (${url}), événements mis à jour. Son secret reste celui d'origine.`);
  } else {
    const created = await stripe.webhookEndpoints.create({ url, enabled_events: WEBHOOK_EVENTS });
    console.log(`\nWebhook créé : ${url}`);
    console.log("Secret à mettre dans Netlify, variable STRIPE_WEBHOOK_SECRET :");
    console.log("  " + created.secret);
  }
}
console.log("\nTerminé.");
