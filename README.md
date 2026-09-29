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
| `404.html` | Page introuvable |

## Voir le site en local

```bash
python -m http.server 8000
# puis http://localhost:8000
```

## Mettre en ligne

**Netlify** (recommandé) : relier ce dépôt, sans commande de build, dossier publié `.`.
`netlify.toml` fixe les en-têtes de sécurité et le cache. Le formulaire d'accès
anticipé utilise Netlify Forms : les inscriptions apparaissent dans
*Site → Forms → acces-anticipe*, sans aucun serveur à écrire.

GitHub Pages fonctionne aussi, mais sans le formulaire (il faudra alors brancher
un service d'e-mailing).

## Brancher la vente

Tout se règle dans **`assets/js/config.js`** :

- `trial` : lien de téléchargement de l'essai (`.exe` ou page de téléchargement).
  Dès qu'il est renseigné, la page Télécharger affiche le bouton de téléchargement.
- `subscribe`, `lifetime` : liens de paiement (Paddle, Lemon Squeezy, FastSpring…).
- `account` : espace client ; `contact` : adresse de contact.

Laissés vides, les boutons mènent à la page d'accès anticipé.

## À valider avant l'ouverture

Certains éléments sont des propositions commerciales, à confirmer ou corriger :

- [ ] **Prix** : 7,90 €/mois, 79 €/an, 149 € à vie (`index.html`, section `#tarifs`)
- [ ] **Promesses** : essai 14 jours sans carte, 2 ordinateurs par licence,
      satisfait ou remboursé 14 jours, libellé bancaire discret, support prioritaire
- [ ] **Nom de domaine** : `prisme.app` est utilisé partout en attendant
      (`index.html` balises `canonical`/`og:*`, `robots.txt`, `sitemap.xml`,
      adresses `contact@prisme.app`)
- [ ] **Pages légales** : compléter les passages `[entre crochets]` et faire relire
- [ ] **Prestataire de paiement** : vérifier qu'il accepte un logiciel destiné aux
      contenus adultes — beaucoup (Stripe, Paddle…) ont des règles restrictives

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
  js/site.js        contrôle d'âge, navigation, démo, mode discret, formulaire
  fonts/            Inter, Instrument Serif, JetBrains Mono (licence OFL)
  img/              logo, icônes, image de partage
```
