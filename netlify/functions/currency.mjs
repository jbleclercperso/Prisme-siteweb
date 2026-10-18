// Dit à une page anglaise dans quelle monnaie afficher les tarifs : euros
// dans la zone euro, dollars ailleurs (netlify/lib/monnaie.mjs).
//
// GET /api/currency  → 200 { "currency": "eur" | "usd" }
import { currencyFor } from "../lib/monnaie.mjs";

export default async (req, context) => {
  const currency = currencyFor("en", context.geo?.country?.code);
  return new Response(JSON.stringify({ currency }), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store" },
  });
};

export const config = { path: "/api/currency" };
