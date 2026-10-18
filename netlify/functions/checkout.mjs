// Ouvre une page de paiement Stripe Checkout pour l'une des trois formules.
//
// POST /api/checkout  { "plan": "monthly" | "yearly" | "lifetime", "lang": "neutre" | "fr" | "en",
//                       "currency": "eur" | "usd" }
// La monnaie est celle que la page a affichée ; à défaut, celle du pays.
//   → 200 { "url": "https://checkout.stripe.com/…" }
import { CURRENCIES, currencyFor } from "../lib/monnaie.mjs";
import { LOCALES, PLANS, json, siteOrigin, stripeClient } from "../lib/stripe.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "method" });

  const stripe = stripeClient();
  if (!stripe) return json(503, { error: "not_configured" });

  let plan, site, currency, lang;
  try {
    const body = await req.json();
    lang = LOCALES[body.lang] ? body.lang : "fr";
    plan = PLANS[body.plan];
    site = LOCALES[lang];
    currency = CURRENCIES[lang].includes(body.currency) ? body.currency : currencyFor(lang, context.geo?.country?.code);
  } catch {
    plan = undefined;
  }
  if (!plan) return json(400, { error: "plan" });

  try {
    const prices = await stripe.prices.list({ lookup_keys: [plan.lookupKey], active: true, limit: 1 });
    const price = prices.data[0];
    if (!price) return json(503, { error: "price_missing", lookupKey: plan.lookupKey });

    const origin = siteOrigin(req);
    const params = {
      mode: plan.mode,
      line_items: [{ price: price.id, quantity: 1 }],
      currency,
      locale: site.locale,
      success_url: `${origin}${site.success}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${site.cancel}`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      custom_text: {
        submit: {
          message: site.submit,
        },
      },
      // lang : la langue de l'e-mail qui envoie la clé (lib/courriel.mjs).
      metadata: { plan: plan.lookupKey, lang },
    };
    if (plan.mode === "payment") {
      // Un achat unique ne crée ni client ni facture par défaut : sans eux,
      // la licence à vie n'aurait pas d'espace client ni de facture.
      params.customer_creation = "always";
      params.invoice_creation = { enabled: true, invoice_data: { metadata: { plan: plan.lookupKey } } };
      params.payment_intent_data = { metadata: { plan: plan.lookupKey } };
    } else {
      params.subscription_data = { metadata: { plan: plan.lookupKey } };
    }
    if (process.env.STRIPE_AUTOMATIC_TAX === "on") {
      params.automatic_tax = { enabled: true };
    } else if (currency === "eur" && process.env.STRIPE_TAX_RATE_ID) {
      // Paiement en euros (France et zone euro) : la TVA française de 20 %, COMPRISE dans le prix
      // affiché, apparaît sur le reçu. En dollars (hors Europe), pas de TVA. Un taux mal réglé
      // chez Stripe (non inclus, autre pourcentage, archivé) ferait payer un autre montant que
      // celui affiché : on refuse plutôt d'ouvrir le paiement.
      const rate = await stripe.taxRates.retrieve(process.env.STRIPE_TAX_RATE_ID);
      if (!rate.active || !rate.inclusive || Number(rate.percentage) !== 20) {
        console.error("taux de TVA à revoir", rate.id, rate.percentage, rate.inclusive, rate.active);
        return json(503, { error: "tax_rate" });
      }
      params.line_items[0].tax_rates = [rate.id];
    }

    const session = await stripe.checkout.sessions.create(params);
    return json(200, { url: session.url });
  } catch (err) {
    console.error("checkout", err.type || "", err.message);
    return json(502, { error: "stripe" });
  }
};

export const config = { path: "/api/checkout" };
