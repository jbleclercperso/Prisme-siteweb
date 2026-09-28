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
    // Liens de paiement (Paddle, Lemon Squeezy, FastSpring, Stripe Checkout…)
    subscribe: "",
    lifetime: "",
    // Espace client (gestion de l'abonnement, factures, licence)
    account: "",
    // Adresse de contact
    contact: "mailto:contact@prisme.app"
  },
  // Adresse de repli quand on refuse le contrôle d'âge
  exitUrl: "https://www.google.fr/"
};
