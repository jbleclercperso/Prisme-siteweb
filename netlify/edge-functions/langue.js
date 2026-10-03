// Accueille chaque visiteur dans sa langue, avant même que la page parte.
//
// Un navigateur réglé en français arrive sur les pages françaises, tous les
// autres sur les pages anglaises : une redirection 302 vers la même page,
// dans l'autre langue, en gardant les paramètres (?session_id=…) et l'ancre.
// Le lien FR / EN du site ajoute ?lang=… : ce choix est retenu dans le cookie
// « prisme-lang », et passe ensuite avant la langue du navigateur.
//
// Les robots (Google, aperçus de liens) ne sont jamais redirigés : chaque
// version reste indexée à sa propre adresse, reliée à l'autre par les
// balises hreflang des pages.
//
// Ajouter une langue (de, es…) : sa colonne dans PAGES, et c'est tout.

// Chaque page du site, dans chaque langue.
const PAGES = [
  { fr: "/", en: "/en/" },
  { fr: "/telecharger.html", en: "/en/download.html" },
  { fr: "/tv.html", en: "/en/tv.html" },
  { fr: "/merci.html", en: "/en/thanks.html" },
  { fr: "/cgv.html", en: "/en/terms.html" },
  { fr: "/confidentialite.html", en: "/en/privacy.html" },
  { fr: "/mentions-legales.html", en: "/en/legal-notice.html" },
];
const LANGS = Object.keys(PAGES[0]);
// La langue de ceux dont la langue n'a pas (encore) sa version.
const FALLBACK = "en";
const COOKIE = "prisme-lang";
const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|headless/i;

// « /index.html », « /en », « /telecharger » : les autres façons d'écrire
// l'adresse d'une page, que Netlify sert aussi.
function normalize(path) {
  if (path.endsWith("/index.html")) path = path.slice(0, -"index.html".length);
  if (LANGS.includes(path.slice(1))) return path + "/";
  if (!path.endsWith("/") && !path.endsWith(".html")) path += ".html";
  return path;
}

function locate(path) {
  for (const page of PAGES) {
    for (const lang of LANGS) if (page[lang] === path) return { page, lang };
  }
  return null;
}

function fromCookie(header) {
  const match = (header || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-z]{2})`));
  return match && LANGS.includes(match[1]) ? match[1] : null;
}

// La langue préférée du navigateur : « de-CH,fr;q=0.8,en;q=0.5 » donne de,
// qui n'a pas de version, donc FALLBACK. Sans en-tête, rien : pas de bascule.
function fromBrowser(header) {
  if (!header) return null;
  let best = null;
  header.split(",").forEach((part, i) => {
    const [tag, ...params] = part.trim().toLowerCase().split(";");
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    const weight = q ? Number(q.slice(2)) || 0 : 1;
    const lang = tag.split("-")[0];
    if (!lang || lang === "*" || weight <= 0) return;
    if (!best || weight > best.weight) best = { lang, weight, i };
  });
  if (!best) return null;
  return LANGS.includes(best.lang) ? best.lang : FALLBACK;
}

function redirect(location, cookie) {
  const headers = { Location: location, "Cache-Control": "private, no-store", Vary: "Accept-Language, Cookie" };
  if (cookie) headers["Set-Cookie"] = cookie;
  return new Response(null, { status: 302, headers });
}

export default async (req) => {
  const url = new URL(req.url);
  const found = locate(normalize(url.pathname));
  if (!found) return;
  const { page, lang } = found;

  // Un choix fait sur le site : on le retient, puis on retire ?lang de l'adresse.
  const chosen = url.searchParams.get("lang");
  if (chosen !== null) {
    url.searchParams.delete("lang");
    if (!LANGS.includes(chosen)) return redirect(page[lang] + url.search);
    const cookie = `${COOKIE}=${chosen}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
    return redirect(page[chosen] + url.search, cookie);
  }

  if (BOTS.test(req.headers.get("user-agent") || "")) return;
  const wanted = fromCookie(req.headers.get("cookie")) || fromBrowser(req.headers.get("accept-language"));
  if (!wanted || wanted === lang) return;
  return redirect(page[wanted] + url.search);
};

export const config = {
  path: "/*",
  excludedPath: ["/assets/*", "/api/*", "/telechargements/*", "/tv.apk", "/favicon.ico", "/robots.txt", "/sitemap.xml"],
  method: ["GET", "HEAD"],
};
