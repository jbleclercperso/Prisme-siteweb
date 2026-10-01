/*
 * Réglages du site Prisme — le seul fichier à modifier pour brancher la vente.
 *
 * Chaque bouton du site porte un attribut data-link="…". Quand la valeur
 * correspondante ci-dessous est renseignée, le bouton pointe vers elle ;
 * laissée vide, il garde son lien par défaut (la page de téléchargement,
 * qui propose pour l'instant l'accès anticipé).
 */
window.PRISME_CONFIG = {
  links: {
    // Page ou fichier de l'essai gratuit (ex. « https://…/Prisme-Setup.exe »)
    trial: "",
    // Liens de paiement, si l'on n'utilise pas le paiement Stripe intégré
    // ci-dessous (Paddle, Lemon Squeezy, lien de paiement Stripe…)
    subscribe: "",
    lifetime: "",
    // Espace client : l'adresse de connexion au portail client Stripe
    // (« https://billing.stripe.com/p/login/… », donnée par
    // `npm run stripe:setup`) — factures, carte, résiliation.
    account: "",
    // Adresse de contact
    contact: "mailto:contact@prisme.app"
  },
  // Paiement Stripe intégré : passer à true une fois les clés posées dans
  // Netlify (voir le README). Les boutons de tarifs ouvrent alors la page de
  // paiement Stripe ; à false, ils mènent à la page d'accès anticipé.
  checkout: false,
  // Adresse de repli quand on refuse le contrôle d'âge, selon la langue de la page
  exitUrl: { fr: "https://www.google.fr/", en: "https://www.google.com/" }
};
