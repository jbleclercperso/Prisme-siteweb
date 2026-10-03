/*
 * Réglages de la version neutre du site (dossier /neutre/).
 *
 * Chaque bouton porte un attribut data-link="…". Quand la valeur
 * correspondante ci-dessous est renseignée, le bouton pointe vers elle ;
 * laissée vide, il garde son lien par défaut (telecharger.html, qui propose
 * pour l'instant l'accès anticipé).
 *
 * À FAIRE avant d'ouvrir la vente : la licence à vie à 29 € et la licence à
 * offrir n'ont pas encore de produit de paiement. Ne réutilisez pas le prix
 * Stripe « à vie » de la page principale (99 €) : créez-leur leurs propres
 * produits, puis collez ici leurs liens de paiement.
 */
window.PRISME_CONFIG = {
  links: {
    // Page ou fichier de l'essai gratuit (ex. « https://…/Prisme-Setup.exe »)
    trial: "",
    // Lien de paiement de la licence à vie (29 €)
    lifetime: "",
    // Lien de paiement de la licence à offrir (carte cadeau, 29 €)
    gift: "",
    // Espace client (factures, licence)
    account: "",
    // Adresse de contact
    contact: "mailto:contact@prisme.app"
  }
};
