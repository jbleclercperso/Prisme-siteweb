# Prisme — site web

Site vitrine et de vente de **Prisme**, le logiciel Windows pour trier, organiser
et regarder une collection adulte, vidéos et photos (dépôt du logiciel :
`jbleclercperso/Prisme`, dont le dossier de données s'appelle encore `VideoSorter`).

Site statique : HTML, CSS et JavaScript sans framework ni étape de construction.
Aucun traceur, aucune ressource tierce — polices et icônes sont hébergées ici,
ce qui tient la promesse « rien n'est envoyé » jusque sur le site.

## Pages

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil : démo interactive, fonctionnalités, discrétion, tarifs, FAQ |
| `telecharger.html` | Essai gratuit — pour l'instant formulaire d'accès anticipé |
| `cgv.html`, `confidentialite.html`, `mentions-legales.html` | Pages légales (modèles à compléter) |
| `merci.html` | Retour de Stripe après un paiement |
| `404.html` | Page introuvable |

## Voir le site en local

```bash
python -m http.server 8000
# puis http://localhost:8000
```

## Mettre en ligne

**Netlify** (recommandé) : relier ce dépôt, sans commande de build, dossier publié `.`.
Netlify installe tout seul la seule dépendance (`stripe`, pour les fonctions de
paiement). `netlify.toml` fixe les en-têtes de sécurité, le cache, et masque ce qui
n'est pas une page (`node_modules`, `netlify/`, `scripts/`). Le formulaire d'accès
anticipé utilise Netlify Forms : les inscriptions apparaissent dans
*Site → Forms → acces-anticipe*, sans aucun serveur à écrire.

GitHub Pages fonctionne aussi, mais sans le formulaire ni le paiement Stripe
intégré, qui ont besoin de Netlify.

## Brancher la vente

Les liens se règlent dans **`assets/js/config.js`** :

- `trial` : lien de téléchargement de l'essai (`.exe` ou page de téléchargement).
  Dès qu'il est renseigné, la page Télécharger affiche le bouton de téléchargement.
- `checkout` : `true` pour le paiement Stripe intégré (ci-dessous).
- `subscribe`, `lifetime` : liens de paiement externes, si l'on n'utilise pas
  Stripe intégré (Paddle, Lemon Squeezy, lien de paiement Stripe…).
- `account` : espace client ; `contact` : adresse de contact.

Laissés vides, les boutons mènent à la page d'accès anticipé.

### Paiement Stripe

Le paiement passe par **Stripe Checkout** : le site ne voit jamais une carte
bancaire. Trois fonctions Netlify, dans `netlify/functions/`, font le lien :

| Adresse | Rôle |
|---|---|
| `POST /api/checkout` | ouvre la page de paiement Stripe pour `monthly`, `yearly` ou `lifetime` |
| `GET /api/session` | dit à `merci.html` si le paiement est passé (payé, en attente, inconnu) |
| `POST /api/webhook` | reçoit les événements de Stripe, signature vérifiée : c'est là qu'un achat s'honore |
| `POST /api/licence` | prolonge la clé d'un abonnement en cours (voir Licences) |

L'espace client (« Mon compte ») est le **portail client de Stripe** : l'acheteur
entre son e-mail, reçoit un lien, et y trouve factures, carte et résiliation.

**Mise en route, en mode test d'abord :**

1. Créer le compte Stripe, puis dans *Paramètres* : le **libellé de relevé**
   (neutre, par exemple `PRISME SOFTWARE`), les informations publiques et l'adresse
   des conditions de vente (`/cgv.html`).
2. Préparer le compte, depuis ce dossier :
   ```bash
   npm install
   STRIPE_SECRET_KEY=sk_test_… SITE_URL=https://www.prisme.app npm run stripe:setup
   ```
   Le script crée le produit et ses trois prix (7,90 €/mois, 79 €/an, 149 € une
   fois, TTC, retrouvés par leur *lookup key* `prisme_mensuel`, `prisme_annuel`,
   `prisme_a_vie`), active l'espace client et déclare le webhook. Il affiche
   l'adresse de l'espace client et le secret du webhook. On peut le relancer sans
   risque : il ne crée que ce qui manque. Pour changer un prix, en créer un
   nouveau dans Stripe et lui reporter la *lookup key*.
3. Dans Netlify, *Site › Configuration › Environment variables* :
   `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` (et `STRIPE_AUTOMATIC_TAX=on`
   si Stripe Tax calcule la TVA).
4. Dans `assets/js/config.js` : `checkout: true`, et l'adresse de l'espace client
   dans `links.account`.
5. Essayer un achat avec la carte `4242 4242 4242 4242`, puis refaire les étapes
   2 à 4 avec la clé `sk_live_…`.

Les événements reçus s'affichent dans le journal des fonctions Netlify
(*Logs › Functions › webhook*).

### Licences

Prisme s'essaie 14 jours, puis demande une **clé de licence** : un petit texte
signé par le site (Ed25519), que Prisme vérifie seul, sans connexion. Personne
ne peut en fabriquer sans la clé privée, qui ne vit que dans Netlify.

- **Après l'achat**, la clé s'affiche sur `merci.html` (bouton « Copier ») et
  se range dans la fiche du client Stripe, champ `prisme_licence` : c'est là
  que le support la retrouve si elle est perdue.
- **Un abonnement** reçoit une clé valable jusqu'à la fin de la période payée,
  plus 7 jours. Dans ses derniers jours, Prisme demande à `POST /api/licence`
  une clé prolongée, en n'envoyant que la clé ; une fois l'abonnement arrêté,
  la réponse est « terminé ». **Une licence à vie ne se connecte jamais.**

**Mise en route, une seule fois :**

1. `npm run licence:keys` : affiche la clé privée et la clé publique.
2. La clé privée dans Netlify, variable `PRISME_LICENCE_PRIVATE`, et une copie
   dans un gestionnaire de mots de passe. **Ne jamais en changer** : toutes les
   licences vendues deviendraient invalides.
3. La clé publique dans Prisme : `videosorter/licence.py`, ligne `PUBLIC_KEY`.

Pour vous-même, un testeur ou un geste commercial, une licence à vie s'émet à
la main : `PRISME_LICENCE_PRIVATE=… npm run licence:issue -- --email vous@exemple.fr`.

La limite de deux ordinateurs par licence n'est pas contrôlée : elle relève de
la confiance, et des conditions de vente.

## À valider avant l'ouverture

Certains éléments sont des propositions commerciales, à confirmer ou corriger :

- [ ] **Prix** : 7,90 €/mois, 79 €/an, 149 € à vie (`index.html`, section `#tarifs`)
- [ ] **Promesses** : essai 14 jours sans carte, 2 ordinateurs par licence,
      satisfait ou remboursé 14 jours, libellé bancaire discret, support prioritaire
- [ ] **Nom de domaine** : `prisme.app` est utilisé partout en attendant
      (`index.html` balises `canonical`/`og:*`, `robots.txt`, `sitemap.xml`,
      adresses `contact@prisme.app`)
- [ ] **Pages légales** : compléter les passages `[entre crochets]` et faire relire
- [ ] **Prestataire de paiement** : Stripe est branché, mais ses conditions
      excluent les contenus pour adultes. Un logiciel qui organise des fichiers
      n'en vend pas, mais le site en parle ouvertement : **faire valider l'activité
      par Stripe avant d'ouvrir les ventes**, sous peine de voir le compte gelé.
- [ ] **TVA** : avec Stripe, c'est l'Éditeur qui vend, donc qui déclare la TVA des
      clients européens (guichet OSS). Stripe Tax peut la calculer ; Paddle ou
      Lemon Squeezy, revendeurs, s'en chargeraient eux-mêmes
- [ ] **Licences** : poser la paire de clés (voir Licences) avant la première vente

## Choix de conception

- **Aucune image explicite** : les vignettes des maquettes sont des halos de lumière
  animés en CSS. Le site reste présentable, indexable et acceptable par les
  hébergeurs et prestataires, tout en assumant clairement son public.
- **Contrôle d'âge** à l'entrée (déclaratif, mémorisé dans le navigateur) et
  balise `<meta name="rating" content="adult">` pour les filtres parentaux.
- **Identité** reprise de l'application : graphite (`#0e1116`), bleu d'action
  (`#4c8dff`), et le spectre rouge / jaune / bleu de l'icône du prisme.
- **Toutes les fonctionnalités citées existent dans le code** de Prisme
  (tri au clavier, favoris, 10 aperçus, Mur de 2 à 10 vidéos, mode photo et diaporama, lecteur flottant,
  « À trier » et « Orphelins », mots-clés automatiques, menu radial, zoom ×6,
  mosaïque, repérage des plans, Rafale, doublons, recherche sur le web, accès à distance, mode discret,
  dossiers masqués, corbeille de séance…), et chaque affirmation a été
  confrontée au code : diaporama à 6 s, 9 destinations dans le menu radial,
  jusqu'à 200 annulations, accès distant par tunnel Cloudflare ou Tailscale
  (HTTPS, PC allumé et Prisme ouvert), effacement définitif à la fermeture sur NAS.
  Le site en parle par ce qu'elles apportent, sans le détail des raccourcis. Les chiffres de performance (0,07 s contre 33 s) viennent des
  mesures du README du logiciel.
- La démo interactive reproduit la fiche de l'application ; `Ctrl+K` masque
  aussi le site derrière une page neutre, comme dans le logiciel.

## Structure

```
assets/
  css/site.css      toute la mise en forme
  js/config.js      liens de vente et de contact
  js/site.js        contrôle d'âge, navigation, démo, mode discret, formulaire, paiement
  fonts/            Inter, Instrument Serif, JetBrains Mono (licence OFL)
  img/              logo, icônes, image de partage
netlify/
  functions/        checkout, session, webhook, licence : paiement et licences
  lib/stripe.mjs    formules, client Stripe, événements suivis
  lib/licence.mjs   fabrication et lecture des clés de licence
scripts/
  stripe-setup.mjs  prépare le compte Stripe (produit, prix, espace client, webhook)
  licence-keys.mjs  paire de clés des licences, et licence émise à la main
```
