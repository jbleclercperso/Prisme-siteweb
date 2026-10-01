// Ouvre une page de paiement Stripe Checkout pour l'une des trois formules.
//
// POST /api/checkout  { "plan": "monthly" | "yearly" | "lifetime", "lang": "fr" | "en",
//                       "currency": "eur" | "usd" }
// La monnaie est celle que la page a affichée ; à défaut, celle du pays.
//   → 200 { "url": "https://checkout.stripe.com/…" }
import { CURRENCIES, currencyFor } from "../lib/monnaie.mjs";
import { LOCALES, PLANS, json, siteOrigin, stripeClient } from "../lib/stripe.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "method" });

  const stripe = stripeClient();
  if (!stripe) return json(503, { error: "not_configured" });

  let plan, site, currency;
  try {
    const body = await req.json();
    const lang = LOCALES[body.lang] ? body.lang : "fr";
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
      metadata: { plan: plan.lookupKey },
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
    if (process.env.STRIPE_AUTOMATIC_TAX === "on") params.automatic_tax = { enabled: true };

    const session = await stripe.checkout.sessions.create(params);
    return json(200, { url: session.url });
  } catch (err) {
    console.error("checkout", err.type || "", err.message);
    return json(502, { error: "stripe" });
  }
};

export const config = { path: "/api/checkout" };
