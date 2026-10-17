/*
 * Réglages de la version grand public du site (à la racine).
 *
 * Chaque bouton porte un attribut data-link="…". Quand la valeur
 * correspondante ci-dessous est renseignée, le bouton pointe vers elle ;
 * laissée vide, il garde son lien par défaut.
 *
 * Le paiement passe par le paiement Stripe intégré (checkout: true) : les
 * boutons de tarifs data-checkout="monthly" | "yearly" | "lifetime" ouvrent
 * la page de paiement Stripe, et le retour se fait sur /merci.html.
 */
window.PRISME_CONFIG = {
  links: {
    // L'installateur de la version vendue (essai de 14 jours, puis clé de
    // licence), publié par prisme-logiciel/construire.py --edition vendue
    trial: "https://github.com/jbleclercperso/prisme-mises-a-jour/releases/latest/download/Prisme-installation.exe",
    // Espace client Stripe : factures, carte, résiliation (connexion par e-mail)
    account: "https://billing.stripe.com/p/login/8x25kD0cR5HRdd6c5t5os00",
    // Adresse de contact
    contact: "mailto:contact@prisme.app"
  },
  checkout: true
};
