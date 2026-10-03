// La monnaie d'un visiteur : l'euro sur les pages françaises et, sur les
// autres, pour qui se trouve dans la zone euro ; le dollar pour les autres.
// Le pays vient de Netlify (context.geo, d'après l'adresse IP).

// Les pays qui paient en euros : la zone euro (Bulgarie comprise depuis
// 2026), les pays qui utilisent l'euro sans en être membres, et les
// territoires d'outre-mer français qui ont leur propre code pays.
const EURO = new Set([
  "AT", "BE", "BG", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT",
  "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
  "AD", "MC", "SM", "VA", "ME", "XK",
  "GP", "MQ", "GF", "RE", "YT", "PM", "BL", "MF",
]);

export const CURRENCIES = { fr: ["eur"], en: ["usd", "eur"] };

export function currencyFor(lang, country) {
  if (lang === "fr") return "eur";
  return EURO.has(String(country || "").toUpperCase()) ? "eur" : "usd";
}
