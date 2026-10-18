// L'e-mail qui remet sa clé de licence à l'acheteur, envoyé par Resend (https://resend.com).
//
// Réglages (variables Netlify) :
//   RESEND_API_KEY   clé d'API Resend (re_…) ; sans elle, rien n'est envoyé : la clé reste
//                    affichée sur la page de remerciement et gardée dans la fiche client Stripe
//   MAIL_FROM        expéditeur, d'un domaine vérifié chez Resend
//                    (par défaut « Prisme <licence@prisme-desktop.com> »)
//   MAIL_REPLY_TO    adresse de réponse (par défaut contact@prisme-desktop.com)
//
// Un même achat n'envoie qu'un e-mail : Stripe rejoue parfois un événement, et la clé
// d'idempotence (l'identifiant de la session de paiement) fait ignorer le doublon par Resend.
// Le webhook note aussi l'envoi dans la fiche client Stripe.

const PLANS = {
  fr: { mois: "abonnement mensuel", an: "abonnement annuel", vie: "licence à vie" },
  en: { mois: "monthly subscription", an: "yearly subscription", vie: "lifetime licence" },
};

const TEXTES = {
  fr: {
    sujet: "Votre clé de licence Prisme",
    titre: "Merci pour votre achat !",
    intro: (formule) => `Voici votre clé Prisme (${formule}). Gardez cet e-mail : il vous la redonnera si besoin.`,
    etapes: [
      "Ouvrez Prisme.",
      "Cliquez sur « Essai · … jours », en haut de la fenêtre (à la fin de l'essai, la fenêtre « Licence de Prisme » s'ouvre d'elle-même).",
      "Collez la clé ci-dessous, puis cliquez sur « Valider la clé ».",
    ],
    abonnement: "Votre clé se prolonge toute seule à chaque renouvellement, tant que l'abonnement court.",
    telecharger: "Pas encore installé ? Téléchargez Prisme :",
    compte: "Factures, carte bancaire et résiliation : votre espace client",
    fin: "Une question ? Répondez simplement à cet e-mail.",
  },
  en: {
    sujet: "Your Prisme licence key",
    titre: "Thank you for your purchase!",
    intro: (formule) => `Here is your Prisme key (${formule}). Keep this e-mail: it will give it back to you if needed.`,
    etapes: [
      "Open Prisme.",
      "Click “Essai · … jours” at the top of the window (when the trial ends, the “Licence de Prisme” window opens by itself).",
      "Paste the key below, then click “Valider la clé”.",
    ],
    abonnement: "Your key renews itself at each renewal, as long as the subscription runs.",
    telecharger: "Not installed yet? Download Prisme:",
    compte: "Invoices, card and cancellation: your customer area",
    fin: "Any question? Just reply to this e-mail.",
  },
};

export const LIEN_TELECHARGEMENT =
  "https://github.com/jbleclercperso/prisme-mises-a-jour/releases/latest/download/Prisme-installation.exe";
export const LIEN_ESPACE_CLIENT = "https://billing.stripe.com/p/login/8x25kD0cR5HRdd6c5t5os00";

const echapper = (t) =>
  String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Le contenu de l'e-mail (sujet, HTML, texte brut), dans la langue de l'achat. */
export function messageLicence({ licence, planCle, lang }) {
  const l = lang === "en" ? "en" : "fr";
  const t = TEXTES[l];
  const formule = PLANS[l][planCle] || PLANS[l].vie;
  const abonnement = planCle === "mois" || planCle === "an";
  const texte = [
    t.titre,
    "",
    t.intro(formule),
    "",
    ...t.etapes.map((e, i) => `${i + 1}. ${e}`),
    "",
    licence,
    "",
    ...(abonnement ? [t.abonnement, ""] : []),
    `${t.telecharger} ${LIEN_TELECHARGEMENT}`,
    `${t.compte} : ${LIEN_ESPACE_CLIENT}`,
    "",
    t.fin,
  ].join("\n");
  const html = `<!doctype html><html lang="${l}"><body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1b1d22">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px">
<h1 style="margin:0 0 12px;font-size:22px">${echapper(t.titre)}</h1>
<p style="margin:0 0 16px;line-height:1.5">${echapper(t.intro(formule))}</p>
<ol style="margin:0 0 16px;padding-left:20px;line-height:1.6">${t.etapes.map((e) => `<li>${echapper(e)}</li>`).join("")}</ol>
<div style="margin:0 0 16px;padding:14px;border-radius:8px;background:#f0f2f5;font-family:Consolas,Menlo,monospace;font-size:13px;word-break:break-all">${echapper(licence)}</div>
${abonnement ? `<p style="margin:0 0 16px;line-height:1.5">${echapper(t.abonnement)}</p>` : ""}
<p style="margin:0 0 8px;line-height:1.5">${echapper(t.telecharger)} <a href="${LIEN_TELECHARGEMENT}">Prisme-installation.exe</a></p>
<p style="margin:0 0 16px;line-height:1.5"><a href="${LIEN_ESPACE_CLIENT}">${echapper(t.compte)}</a></p>
<p style="margin:0;color:#5b616e;line-height:1.5">${echapper(t.fin)}</p>
</div></body></html>`;
  return { sujet: t.sujet, html, texte };
}

/** Envoie la clé. Renvoie "envoye", "absent" (pas de clé Resend) ou lève une erreur. */
export async function envoyerLicence({ email, licence, planCle, lang, idempotence }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return "absent";
  if (!email || !licence) return "absent";
  const m = messageLicence({ licence, planCle, lang });
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(idempotence ? { "Idempotency-Key": String(idempotence).slice(0, 256) } : {}),
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Prisme <licence@prisme-desktop.com>",
      to: [email],
      reply_to: process.env.MAIL_REPLY_TO || "contact@prisme-desktop.com",
      subject: m.sujet,
      html: m.html,
      text: m.texte,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status} ${detail.slice(0, 200)}`);
  }
  return "envoye";
}
