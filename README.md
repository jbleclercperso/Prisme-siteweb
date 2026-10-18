# Prisme — site web

Site vitrine et de vente de **Prisme**, le logiciel Windows pour trier, organiser
et regarder une collection adulte, vidéos et photos (dépôt du logiciel :
`jbleclercperso/Prisme`, dont le dossier de données s'appelle encore `VideoSorter`).

Site statique : HTML, CSS et JavaScript sans framework ni étape de construction.
Aucun cookie ni traceur publicitaire ; seule ressource tierce : la mesure d'audience
anonyme et sans cookie Umami (`scripts/umami.py`). Polices et icônes sont hébergées ici.

## Deux sites en un

Le même logiciel se présente à deux publics, chacun avec son référencement :

- **la version grand public**, à la racine : trier, ranger et regarder ses
  vidéos et ses photos. Elle ne lie jamais la version adulte et n'en emploie
  pas le vocabulaire (`scripts/verifier.py` y veille) ;
- **la version adulte**, dans `/adulte/` (français) et `/en/adult/` (anglais) :
  contrôle d'âge, `<meta name="rating" content="adult">`, `contentRating:
  adult`. Google demande précisément de regrouper ainsi le contenu explicite à
  part, faute de quoi il filtre le domaine entier.

Les adresses d'avant ce partage (octobre 2026 : `/neutre/…`, `/merci.html`,
`/en/…`) redirigent vers leur nouvelle place (`netlify.toml`).

## Pages

| Fichier | Rôle |
|---|---|
| `index.html` | Grand public : démo interactive, fonctionnalités, Mur, photos, doublons, accès à distance, tarif, FAQ |
| `telecharger.html` | Grand public : téléchargement et essai gratuit de 14 jours |
| `cgv.html`, `confidentialite.html`, `mentions-legales.html` | Grand public : pages légales (modèles à compléter) |
| `guides/…`, `<sujet>/index.html` | Grand public : une page par problème (doublons, réparation, NAS, télé…), voir `docs/plan-seo.md` |
| `adulte/guides/…`, `adulte/<sujet>/`, `en/adult/guides/…`, `en/adult/<sujet>/` | Adulte : les guides, en français et en anglais (`scripts/gabarit.py`, `GUIDES_ADULTES`) |
| `404.html` | Page introuvable (grand public) |
| `adulte/index.html` | Adulte : démo, fonctionnalités, discrétion, tarifs, FAQ |
| `adulte/telecharger.html`, `adulte/tv.html`, `adulte/merci.html`, `adulte/cgv.html`… | Adulte : essai, Prisme TV, retour de Stripe, pages légales |
| `en/adult/…` | Adulte, en anglais (voir Langues) |

## Référencement

**Les balises de référencement ne s'écrivent pas à la main.** Chaque page a sa
fiche dans `scripts/seo.py` (adresse, langue, titre, description, version,
nature) ; le script en tire, dans le `<head>`, entre les marques `seo` : titre,
description, canonical, hreflang, Open Graph, Twitter, marquage adulte, données
structurées schema.org (Organization, WebSite, WebPage, SoftwareApplication,
FAQPage tirée de la FAQ de la page, BreadcrumbList, TechArticle, HowTo), et il
écrit `sitemap.xml` et `robots.txt`.

```bash
python scripts/contenu-seo-2026.py  # régénère les huit guides ajoutés en octobre 2026
python scripts/gabarit.py            # en-tête, pied, maillage et sommaires
python scripts/seo.py                # métadonnées, JSON-LD, sitemap et robots
python scripts/verifier.py           # liens, H1, JSON-LD et séparation des versions
python scripts/audit-seo.py          # canoniques, hreflang, sitemap, unicité et orphelins
```

**Ajouter un guide** : copier un guide existant de la même version et de la
même langue, réécrire le contenu de `<div class="container prose">` (fil
d'Ariane, H1, « En bref », texte, FAQ en `<div class="faq">`), puis lui donner
sa fiche dans `scripts/gabarit.py` (`GUIDES` et `VOISINS`, ou
`GUIDES_ADULTES` et `VOISINS_ADULTES`) et dans `scripts/seo.py` (`guide(…)` ou
`aguide(…)`), et lancer les trois scripts. Pour un guide adulte, ajouter aussi
la paire à `PAGES` dans `netlify/edge-functions/langue.js`.

**Nom de domaine** : la constante `BASE` de `scripts/seo.py` (aujourd'hui
`https://prisme-desktop.com`, domaine acheté chez IONOS en octobre 2026). La
changer, relancer le script : tout suit. Le plan du référencement, les
mots-clés visés et le maillage sont dans `docs/plan-seo.md` (non servi).

## Langues

La version adulte existe en français (`/adulte/`) et en anglais (`/en/adult/`),
chaque page ayant sa jumelle :

| Français | Anglais |
|---|---|
| `/adulte/` | `/en/adult/` |
| `/adulte/telecharger.html` | `/en/adult/download.html` |
| `/adulte/tv.html` | `/en/adult/tv.html` |
| `/adulte/merci.html` | `/en/adult/thanks.html` |
| `/adulte/cgv.html` | `/en/adult/terms.html` |
| `/adulte/confidentialite.html` | `/en/adult/privacy.html` |
| `/adulte/mentions-legales.html` | `/en/adult/legal-notice.html` |

La version grand public est en français ; sa traduction anglaise ira dans
`/en/` (les adresses `/en/…` redirigent pour l'instant vers `/en/adult/…`).

**La bascule est automatique** : la fonction `netlify/edge-functions/langue.js`
regarde la langue du navigateur avant d'envoyer la page. Français → pages
françaises ; toute autre langue → pages anglaises (redirection 302 vers la même
page, ancre et paramètres compris), quand la page a une jumelle anglaise. Le
lien **FR / EN** de l'en-tête fixe le choix pour un an (cookie `prisme-lang`),
qui passe alors avant le navigateur. Les robots (Google, aperçus de liens) ne
sont jamais redirigés : chaque version est indexée à sa propre adresse, et les
balises `hreflang` des pages et du `sitemap.xml` les relient.

**Une modification se fait dans les deux langues** : le texte change dans la
page française et dans sa jumelle anglaise. Les textes écrits par le script
(démo, mode discret, paiement) sont dans `assets/js/site.js`, objet `TEXT`.

**Ajouter une langue** (allemand, espagnol…) : copier `en/adult/` vers `de/…` et
traduire ; ajouter la colonne `de` au tableau `PAGES` de `langue.js`, un bloc
`de` à `TEXT` dans `site.js` et à `LOCALES` dans `netlify/lib/stripe.mjs`, et
les fiches des pages dans `scripts/seo.py`.

**Prix** : toujours en euros sur les pages françaises. Sur les pages anglaises,
en euros pour un visiteur de la zone euro (un Allemand, un Espagnol…) et en
dollars ailleurs, au même montant : la page demande la monnaie à
`/api/currency`, qui la déduit du pays (Netlify le connaît par l'adresse IP),
et la page de paiement Stripe reprend la monnaie affichée. La liste des pays
qui paient en euros est dans `netlify/lib/monnaie.mjs`. Les deux monnaies sont
portées par les mêmes prix Stripe (voir plus bas).

## Voir le site en local

```bash
python -m http.server 8000
# puis http://localhost:8000
```

## Mettre en ligne

**Netlify** (recommandé) : relier ce dépôt, sans commande de build, dossier publié `.`.
**Branche publiée : `main`** (projet Netlify `prisme-website`, domaine prisme-desktop.com, réglé le
18/10/2026). Un travail fait sur une autre branche n'est en ligne qu'une fois fusionné dans `main`.
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

Laissés vides, les boutons conservent leur lien vers la page de téléchargement.

### Paiement Stripe

Le paiement passe par **Stripe Checkout** : le site ne voit jamais une carte
bancaire. Des fonctions Netlify, dans `netlify/functions/`, font le lien :

| Adresse | Rôle |
|---|---|
| `POST /api/checkout` | ouvre la page de paiement Stripe pour `monthly`, `yearly` ou `lifetime` |
| `GET /api/session` | dit à `merci.html` si le paiement est passé (payé, en attente, inconnu) |
| `GET /api/currency` | dit aux pages anglaises s'il faut afficher les prix en euros ou en dollars |
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
   STRIPE_SECRET_KEY=sk_test_… SITE_URL=https://prisme-desktop.com npm run stripe:setup
   ```
   Le script crée le produit et ses trois prix (4,99 €/mois, 29 €/an, 49 € une
   fois, TTC, et le même montant en dollars pour les pages anglaises, retrouvés
   par leur *lookup key* `prisme_mensuel`, `prisme_annuel`, `prisme_a_vie`),
   active l'espace client et déclare le webhook. Sur un compte déjà préparé
   avant la version anglaise, le relancer ajoute les montants en dollars.
   Il affiche l'adresse de l'espace client et le secret du webhook. On peut le
   relancer sans risque : il ne crée que ce qui manque. Pour changer un prix,
   modifier le montant dans `scripts/stripe-setup.mjs` et relancer le script :
   un nouveau prix reprend la *lookup key*, l'ancien est désactivé, et les
   abonnements déjà en cours gardent leur prix.
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

**Le format est celui du logiciel** (`videosorter/licence.py`), et il ne doit
changer qu'en même temps des deux côtés : `PRISME1-<contenu>.<signature>`, les
deux en base64 « url » sans remplissage ; le contenu est un JSON
`{ plan: "mois" | "an" | "vie", expires: <secondes, 0 à vie>, email, issued,
customer, subscription }`, et la signature Ed25519 porte sur **ses octets**,
tels quels. Le logiciel lit `plan`, `expires` et `email` ; `customer` et
`subscription` servent au site pour prolonger un abonnement.

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

## Prisme TV

`telechargements/Prisme-TV.apk` est l'application pour la télé, servie aussi à
l'adresse courte **`/tv.apk`**, celle qu'on tape dans Downloader sur la télé.
Elle est construite par GitHub dans le dépôt de l'application (dossier `tv/`),
qui la dépose seule sur sa branche `apk`. Pour mettre à jour celle du site :

```bash
git -C ../videosorter fetch origin +apk:refs/remotes/origin/apk
git -C ../videosorter show origin/apk:Prisme-TV.apk > telechargements/Prisme-TV.apk
```

Toutes les versions portent la même signature : elles s'installent par-dessus
la précédente, la télé reste appairée.

## À valider avant l'ouverture

Certains éléments sont des propositions commerciales, à confirmer ou corriger :

- [ ] **Prix** : confirmer 4,99 €/mois, 29 €/an et 49 € à vie, avec les mêmes
      montants en dollars (`index.html`, les deux accueils adultes et
      `scripts/stripe-setup.mjs`).
- [ ] **Logiciel en anglais** (prévu avant le lancement) : les pages anglaises citent les
      menus de Prisme et de Prisme TV en anglais (« Trial », ⋯ › Help › License…, Remote
      sharing…). Vérifier qu'ils portent ces noms dans les applications traduites, sinon
      corriger `en/thanks.html` et `en/tv.html`.
- [ ] **Promesses** : essai 14 jours sans carte, 2 ordinateurs par licence,
      satisfait ou remboursé 14 jours, libellé bancaire discret, support par e-mail
- [x] **Nom de domaine et contact** : `prisme-desktop.com` dans les canoniques,
      le sitemap et le robots.txt ; `contact@prisme-desktop.com` partout.
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
  mosaïque, repérage des plans, Rafale, doublons, recherche sur le web, accès à distance,
  publication sur le NAS, application Prisme TV, mode discret,
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
  js/site.js        contrôle d'âge, navigation, démo, mode discret, formulaire, paiement,
                    et leurs textes en français et en anglais
  fonts/            Inter, Instrument Serif, JetBrains Mono (licence OFL)
  img/              logo, icônes, image de partage
en/                 les pages en anglais
netlify/
  edge-functions/   langue.js : chaque visiteur vers les pages de sa langue
  functions/        checkout, session, currency, webhook, licence : paiement et licences
  lib/stripe.mjs    formules, pages de retour par langue, client Stripe, événements suivis
  lib/monnaie.mjs   euros ou dollars, selon la langue et le pays
  lib/licence.mjs   fabrication et lecture des clés de licence
scripts/
  stripe-setup.mjs  prépare le compte Stripe (produit, prix, espace client, webhook)
  licence-keys.mjs  paire de clés des licences, et licence émise à la main
```
