# Prisme — audit SEO et plan du site

Octobre 2026. Ce document n'est pas servi par le site (`/docs/*` est masqué
dans `netlify.toml`). Les relevés bruts de la recherche (mots-clés,
concurrents) sont résumés ici ; les tableaux complets restent dans les notes
de travail.

> Mise à jour du 18/10/2026 : le chantier décrit ci-dessous est terminé dans
> la copie de travail locale. Elle contient 55 pages, dont 49 indexables, et
> passe `scripts/verifier.py` ainsi que `scripts/audit-seo.py` sans erreur.
> Rien n'a été publié : les observations « en ligne » restent donc distinctes
> de l'état local prêt à relire.

---

## 1. Audit du site existant

### 1.1 Ce qui est en ligne

- Le domaine public est **https://prisme-desktop.com**.
- Relevé du 18/10/2026 : la racine sert encore l'ancien accueil adulte,
  `/guides/` répond 404, et le sitemap public ne contient que cinq URL avec
  l'ancien domaine `www.prisme.app`.
- Cette copie de travail corrige ces points, mais n'est volontairement pas
  publiée. La mise en production devra faire l'objet d'une action séparée.

### 1.2 Le problème n° 1 : le nom de domaine

Ce problème subsiste uniquement sur la version actuellement publiée. Dans la
copie locale, toutes les balises `canonical`, `hreflang`, `og:image`, le
`sitemap.xml` et le `robots.txt` utilisent **`prisme-desktop.com`**. L'adresse
de contact unique est **`contact@prisme-desktop.com`**.

### 1.3 Le problème n° 2 : un site classé « adulte » face à des recherches grand public

> Les sections 1.3 à 1.5 décrivent l'audit initial qui a motivé la séparation
> des univers. Elles sont conservées comme historique ; les corrections sont
> résumées aux sections 3 et 4.

La racine du site (accueil, télécharger, TV, CGV…) est explicitement
pornographique : titre « … votre collection porno », `<meta name="rating"
content="adult">`, contrôle d'âge, `contentRating: adult` dans les données
structurées. C'est **correct pour les recherches adultes** (Google demande
précisément ce marquage), mais Google **n'affiche pas de pages classées
explicites sur une recherche qui ne l'est pas** (« logiciel pour trier ses
vidéos », « doublons vidéo »…), et SafeSearch les filtre.

La version **neutre** (`neutre/`) existe, bien écrite, mais elle est en
`noindex` et liée à la version adulte par le sélecteur « Neutre / Adulte ».

**Conséquence** : tel quel, le site ne peut pas se classer sur les requêtes
visées. Les nouvelles pages doivent être neutres, sans marquage adulte, et
mener vers la page produit neutre (voir décisions, § 4).

### 1.4 Page par page

| Page | Title | Description | H1 | Canonical / hreflang | OG / Twitter | Données structurées | Remarques |
|---|---|---|---|---|---|---|---|
| `/` | 66 car., ok (adulte) | 245 car., trop long (coupé à ~155) | 1, ok | vers prisme.app ✗ | OG complet, `og:url` et dimensions d'image absents ; Twitter sans titre propre | `SoftwareApplication` minimal, sans `url`, `image`, éditeur ; pas de `FAQPage` alors que la FAQ existe | H1 animé à l'entrée : **LCP 2,9 s** au lieu de ~0,7 s |
| `/telecharger.html` | ok | 92 car., court | 1 (+ H2 du contrôle d'âge avant) | vers prisme.app ✗ | **aucun** | aucune | page « accès anticipé » : 295 mots |
| `/tv.html` | ok | ok | 1 | vers prisme.app ✗ | **aucun** | aucune (`HowTo` possible) | adresse `prisme.app/tv.apk` fausse |
| `/cgv.html`, `/confidentialite.html`, `/mentions-legales.html` | ok | ok | 1 | vers prisme.app ✗ | aucun | — | passages `[à compléter]` |
| `/merci.html` | — | — | **4 H1** (états du paiement) | — | — | — | `noindex` par en-tête : sans effet SEO, laissé |
| `/404.html`, `/en/404.html` | ok | — | 1 | — | — | — | `noindex`, ok |
| `/neutre/` | ok, 70 car. | 186 car., un peu long | 1 | **aucune**, `noindex` | aucun | aucune | lien vers la version adulte dans l'en-tête |
| `/en/…` | jumelles anglaises | idem FR | idem | vers prisme.app ✗ | idem | idem | hreflang fr/en/x-default bien posés |

### 1.5 Technique transversal

- **robots.txt** : ouvert à tout, sitemap vers le mauvais domaine.
- **sitemap.xml** : 12 adresses, hreflang inclus (bien), mais mauvais domaine,
  pas de `lastmod`, `/neutre/` absent (normal tant qu'il est en noindex).
- **URLs** : en `.html` (`/telecharger.html`). Acceptable ; les nouvelles
  pages auront des adresses propres en dossier (`/reparer-video-corrompue/`).
- **Liens internes** : l'accueil ne lie que ses propres ancres et 5 pages ;
  aucune page ne parle d'un problème précis, donc rien à mailler.
- **Images** : légères (300 Ko pour tout l'accueil, logos en PNG 192 px
  affichés à 32 px). `alt` vides sur les logos décoratifs (correct), « Prisme »
  sur le lettrage (correct). Les vignettes sont des halos CSS : rien à décrire.
  L'en-tête `X-Robots-Tag: noimageindex` empêche Google Images d'indexer le
  site entier — voulu pour l'adulte.
- **Performance** (mesurée dans un navigateur sur la version en ligne) :
  premier octet 0,6 s, CLS 0, 10 ressources, 300 Ko. **Seul défaut : le LCP à
  2,9 s**, dû à l'animation d'entrée du grand titre (opacité 0 → 1 sur 1 s).
  Polices auto-hébergées et préchargées : très bien.
- **Mobile** : pas de défilement horizontal, menu repliable, `viewport` correct.
- **Accessibilité** : `lang`, lien d'évitement, `<main>`, libellés ARIA des
  maquettes et des boutons : bon niveau. Le contrôle d'âge est un H2 placé avant
  le H1 (mineur).
- **Données structurées** : FAQPage et HowTo n'apportent plus d'affichage
  enrichi dans Google depuis 2023 (réservés aux sites officiels / retirés),
  mais restent lus par Bing et par les moteurs à réponse (IA). Les étoiles de
  `SoftwareApplication` exigent de vraies notes : **ne jamais en inventer**.

---

## 2. Ce que cherchent les gens (synthèse de la recherche)

Méthode : ~230 requêtes de départ passées dans les suggestions de Google
(fr-FR), une quinzaine de recherches pour voir qui occupe les résultats, ~45
pages concurrentes relevées (balises, schema, plan du site). Aucun volume
chiffré n'est disponible sans outil payant : le poids est estimé au nombre de
suggestions et de variantes.

### 2.1 Les constats qui changent le plan

1. **« Gestionnaire de fichiers »** désigne l'Explorateur Windows et ses
   remplaçants (Total Commander, Files) : intention étrangère à Prisme et
   requête imprenable. « Gestionnaire de fichiers vidéo » n'a presque aucune
   demande ; « gestionnaire de médias » renvoie aux réseaux sociaux,
   « vidéothèque » aux catalogues de films et DVD. **On ne vise pas ces
   mots-là en titre** ; on les place dans le texte.
2. **Les gens cherchent pour leurs photos, pas pour leurs vidéos** : Google
   remplace « organiser / trier / ranger ses vidéos » par « photos » neuf fois
   sur dix. Les titres doivent dire « photos et vidéos ».
3. **Les vidéos ont une vraie demande sur trois sujets** : la réparation, les
   doublons, le NAS et la télé.
4. **Une pépite** : Synology a retiré Video Station (DSM 7.2.2, 2024).
   « Alternative à Video Station » n'a presque aucune réponse en français.
5. **Les anciens de Picasa** cherchent un outil local pour classer et
   regarder : exactement le public de Prisme.
6. **Personne ne tape** « au clavier », « mur de vidéos », « aperçu au survol »,
   « sans cloud » : ce sont des arguments, pas des mots-clés.
7. Le mot **« gratuit »** revient partout : on y répond par l'essai de 14 jours
   et en citant honnêtement les outils gratuits quand ils suffisent.

### 2.2 Les concurrents

- **Organiser / trier ses vidéos** : presque personne en face. Le plus proche,
  Fast Video Cataloger (local, recherche de scènes par IA), n'existe pas en
  français.
- **Doublons, réparation** : des « fermes » de comparatifs d'éditeurs
  (Tenorshare 4DDiG, Stellar, EaseUS, Cisdem) où l'éditeur se classe n° 1. Pages
  répétitives, souvent faibles ; EaseUS FR en 404, Repairit sans site FR.
- **NAS / TV** : uniquement des forums.
- **Plex** : hausse des prix et accès distant payant en 2025-2026, mais aucun
  éditeur n'en parle en français.
- Les gros (Jellyfin, XnView, digiKam, FastStone) ont un SEO technique pauvre.

### 2.3 Les angles que personne ne prend

Le tri au clavier « une touche = un dossier » ; la recherche de scène par IA
**sur le PC**, sans rien envoyer ; un seul logiciel pour trier, regarder,
dédoublonner et réparer ; le NAS sur la télé sans serveur Plex ; conçu en
français.

### 2.4 Ce que Prisme ne fait pas (on ne vise pas)

- **Renommer en masse** : Prisme renomme un fichier à la fois (F2). Pas de page.
- **Doublons de photos** : ajoutés au logiciel pendant ce travail ; la page doublons couvre vidéos et photos.
- **Reconnaissance des visages**, retouche photo, sauvegarde du téléphone,
  synchronisation cloud : rien de tout cela. Les pages « alternative à
  Picasa / Google Photos » le disent.
- **Chiffrement** : le code PIN et les dossiers masqués ne chiffrent rien. On
  ne vise pas « protéger un dossier par mot de passe ».
- **Corriger le son d'un fichier** : l'égalisation agit à la lecture, le
  fichier n'est pas modifié. La page le dit, et donne la méthode ffmpeg.

---

## 3. Architecture retenue (décidée le 17/10/2026)

**Deux référencements séparés sur un même domaine.** La version grand public
prend la racine ; toute la version adulte vit dans `/adulte/` (français) et
`/en/adult/` (anglais), marquée comme telle (`rating adult`, `contentRating`,
contrôle d'âge). C'est la séparation que Google demande pour un site qui mêle
les deux : sans elle, il filtre le domaine entier. Une page grand public ne
lie jamais la version adulte et n'en emploie pas le vocabulaire
(`scripts/verifier.py` y veille) ; l'inverse est permis.

```
/                                      accueil grand public (ex-neutre/)
/telecharger.html, /cgv.html…          téléchargement, pages légales (grand public)
/guides/                               sommaire des guides grand public
  /organiser-photos-videos-pc/         pilier
  /logiciel-tri-photos-videos/         page produit « logiciel pour trier »
  /trier-des-milliers-de-photos/
  /doublons-videos-photos/
  /reparer-video-corrompue/
  /egaliser-volume-videos/
  /lire-plusieurs-videos-en-meme-temps/
  /lecteur-video-toujours-au-premier-plan/
  /alternative-video-station-synology/
  /regarder-videos-pc-sur-tv/
  /plex-jellyfin-ou-prisme/
  /retrouver-une-video-par-son-contenu/
  /alternative-picasa/
  /trier-grand-dossier-videos/
  /organiser-videos-telechargees/

/adulte/                               accueil adulte (FR)      ⇄  /en/adult/
/adulte/telecharger.html, tv.html…     ses pages (FR)           ⇄  /en/adult/download.html…
/adulte/guides/                        sommaire des guides      ⇄  /en/adult/guides/
  logiciel-organiser-collection-porno/                          ⇄  best-porn-organizer-software/
  trier-videos-porno/                                           ⇄  sort-porn-videos/
  doublons-videos-porno/                                        ⇄  porn-duplicate-finder/
  lecteur-video-porno-apercus/                                  ⇄  porn-video-player-previews/
  mots-cles-recherche-ia-porno/                                 ⇄  auto-tag-porn-ai-search/
  cacher-videos-porno-pc/                                       ⇄  hide-porn-on-pc/
  organiser-collection-porno-nas/                               ⇄  organize-porn-collection-nas/
```

Les anciennes adresses (`/neutre/…`, `/merci.html`, `/en/…`, `/tv.html`)
redirigent (`netlify.toml`). La version grand public n'a pas encore de
traduction anglaise : `/en/…` mène pour l'instant à `/en/adult/…`.

### 3.1 Grand public : les pages et leurs mots-clés

| Adresse | Mot-clé principal | Secondaires | Intention |
|---|---|---|---|
| `/alternative-video-station-synology/` | alternative video station synology | remplacement video station, vidéos du NAS sur téléphone | comparatif |
| `/reparer-video-corrompue/` | réparer vidéo corrompue | fichier mp4 corrompu que faire, vidéo endommagée, réparer avec VLC, mkv, GoPro, 0xc00d36c4 | info → produit |
| `/doublons-videos-photos/` | logiciel doublons vidéo | supprimer vidéos en double sur PC, même vidéo en plusieurs résolutions, alternative dupeGuru | produit |
| `/organiser-photos-videos-pc/` | organiser ses photos et vidéos sur PC | classer, ranger, faire le tri, arborescence, gestionnaire de fichiers | info (pilier) |
| `/logiciel-tri-photos-videos/` | logiciel pour trier ses photos et vidéos | comparatif logiciel tri photo vidéo Windows | comparatif → produit |
| `/regarder-videos-pc-sur-tv/` | regarder les vidéos du PC sur la TV | film PC sur Fire TV sans Plex, Fire TV Stick NAS | info → produit |
| `/egaliser-volume-videos/` | égaliser le son de plusieurs vidéos | vidéo son trop faible, augmenter le son d'une vidéo MP4 | info → produit |
| `/plex-jellyfin-ou-prisme/` | plex ou jellyfin | alternative gratuite à Plex, Plex payant | comparatif |
| `/lire-plusieurs-videos-en-meme-temps/` | lire plusieurs vidéos en même temps | VLC plusieurs vidéos | info → produit |
| `/lecteur-video-toujours-au-premier-plan/` | lecteur vidéo toujours au premier plan | VLC toujours au-dessus, image dans l'image | info → produit |
| `/trier-des-milliers-de-photos/` | comment trier des milliers de photos | trier ses photos rapidement | info |
| `/alternative-picasa/` | alternative Picasa Windows 10 / 11 | équivalent Picasa, diaporama photo aléatoire | comparatif |
| `/retrouver-une-video-par-son-contenu/` | retrouver une vidéo par son contenu | recherche par image locale | info → produit |
| `/trier-grand-dossier-videos/` | trier un grand dossier de vidéos | trier des milliers de vidéos rapidement | méthode → produit |
| `/organiser-videos-telechargees/` | organiser ses vidéos téléchargées | classer vidéothèque locale Windows | méthode → produit |

### 3.2 Adulte : les pages et leurs mots-clés

Les termes explicites n'ont aucune suggestion dans les moteurs (filtrage) :
les volumes ne se mesurent pas, mais la concurrence est presque nulle,
surtout en français. Rédaction sobre, sans image ni description explicite :
« porno / porn » dans le titre, « vidéos pour adultes / adult » dans la
description.

| FR | EN | Mots-clés visés |
|---|---|---|
| `/adulte/` | `/en/adult/` | logiciel gestion vidéo porno, bibliothèque vidéo porno / adulte · porn organizer, porn collection manager windows |
| `logiciel-organiser-collection-porno/` | `best-porn-organizer-software/` | quel logiciel pour organiser sa collection porno · best software to organize porn |
| `trier-videos-porno/` | `sort-porn-videos/` | trier ses vidéos porno, classer · sort porn videos into folders |
| `doublons-videos-porno/` | `porn-duplicate-finder/` | doublons vidéos porno · porn duplicate finder, different resolution |
| `lecteur-video-porno-apercus/` | `porn-video-player-previews/` | lecteur avec aperçus, mur de vidéos · porn video player with previews |
| `mots-cles-recherche-ia-porno/` | `auto-tag-porn-ai-search/` | taguer ses vidéos · porn tagger, auto tag porn, AI scene search |
| `cacher-videos-porno-pc/` | `hide-porn-on-pc/` | cacher ses vidéos porno sur son PC, dossier secret · how to hide porn on pc |
| `organiser-collection-porno-nas/` | `organize-porn-collection-nas/` | organiser collection porno NAS · porn collection NAS |

### 3.3 Gabarit de chaque page

- **Title** 50–65 caractères, mot-clé d'abord, « | Prisme » à la fin ;
  **description** 140–165 caractères.
- **Un H1** qui reprend la question telle qu'on la tape ; « En bref » en tête :
  la réponse avant le détail.
- **Les solutions gratuites d'abord** quand elles existent (VLC, ffmpeg,
  Windows, dupeGuru, VeraCrypt…), puis **ce que fait Prisme**, puis **ce qu'il
  ne fait pas**, puis l'appel à l'essai.
- **FAQ** de 3 à 5 questions ; fil d'Ariane visible ; « À lire aussi ».
- Données structurées (écrites par `scripts/seo.py`) : Organization, WebSite,
  WebPage + FAQPage, BreadcrumbList, TechArticle ; SoftwareApplication sur les
  accueils et pages de téléchargement, **sans notes ni avis** ; HowTo sur les
  pages TV. FAQPage et HowTo n'ont plus d'affichage enrichi chez Google, mais
  restent lus par Bing et les moteurs à réponse.

### 3.4 Maillage interne

- Grand public : chaque guide lie le pilier ou la page produit, 3 voisins
  (« À lire aussi », `scripts/gabarit.py`) et le téléchargement ; `/guides/` est
  dans le menu et le pied de page de toutes les pages grand public, avec cinq
  guides en lien direct.
- Adulte : même logique, dans chaque langue ; « Guides » dans le menu et le
  pied de page de toutes les pages adultes.

---

## 4. Ce qui a été fait (18/10/2026)

1. **Séparation des deux versions** : neutre à la racine, adulte dans
   `/adulte/` et `/en/adult/` ; redirections des anciennes adresses ; bascule
   de langue (`langue.js`) et pages de retour de Stripe mises à jour.
2. **Technique** : `scripts/seo.py` écrit titre, description, canonical,
   hreflang, Open Graph, Twitter et données structurées de chaque page, plus
   `sitemap.xml` (avec `lastmod` et hreflang) et `robots.txt`, à partir d'une
   seule liste ; l'adresse du site est la constante `BASE` (aujourd'hui
   `https://prisme-desktop.com`). Le grand titre de l'accueil ne passe
   plus par l'animation d'entrée (LCP). Le `noindex` provisoire de la version
   neutre et son sélecteur « Adulte » sont retirés.
3. **Contenu** : 15 guides grand public + sommaire ; 7 guides adultes en
   français et leurs 7 équivalents anglais + sommaires (55 pages en tout,
   49 indexables). Le silo grand public possède une page-pilier qui compare les
   grandes familles d'outils, mais les pages de marque y restent limitées aux
   intentions déjà fortes (Picasa, Plex/Jellyfin et Video Station). Le silo
   adulte ne cite aucun concurrent : il démontre l'étendue de Prisme par les
   besoins couverts et renvoie vers les guides spécialisés, le NAS et Prisme TV.
4. **Contrôle** : `scripts/verifier.py` (liens et ancres, un H1, `alt`, JSON-LD
   lisible et types connus, séparation des versions, balises à jour) et
   `scripts/audit-seo.py` (canoniques, hreflang réciproques, sitemap, unicité,
   volume éditorial, maillage et pages orphelines). L'erreur d'encodage Windows
   qui pouvait masquer un échec du sous-processus a été neutralisée.
5. **Cohérence commerciale** : les pages de téléchargement adultes ne parlent
   plus d'un lancement à venir ; elles présentent le même essai de 14 jours que
   la version grand public. L'en-tête `noimageindex` est limité aux répertoires
   adultes au lieu de bloquer aussi les images grand public.

## 5. Ce qui reste

**De votre côté**

- **Mise en ligne** : volontairement non faite. Relire le diff, fusionner la
  copie locale dans le dépôt du site, lancer les deux audits, puis seulement
  déclencher le déploiement lors d'une action séparée.
- **Search Console** : ajouter ou vérifier la propriété du domaine, envoyer
  `sitemap.xml`, demander
  l'indexation des pages principales ; **Bing Webmaster Tools** (import depuis
  la Search Console). Vérifier dans « Pages » que les pages neutres ne sont pas
  classées explicites (SafeSearch) au bout de quelques semaines.
- **Liens externes** : fiches logiciel (Clubic, 01net Télécharger,
  Presse-Citron, Journal du Geek, AlternativeTo) ; réponses utiles sur les
  forums Synology, Dealabs, Reddit (r/synology, r/DataHoarder, r/selfhosted,
  r/stashapp pour la version adulte) ; proposition d'article à JustGeek ou
  Korben. Pour la version adulte : annuaires d'outils et fils Reddit dédiés.
- **Vérifier à la main**, depuis la France, en navigation privée, une dizaine
  de requêtes clés (avec et sans SafeSearch) : la recherche n'a vu qu'un index
  américain.
- **Avis** : dès les premières ventes, de vrais avis, qui pourront alors
  alimenter le balisage.

**À décider ou à vérifier dans le logiciel**

- **Prisme TV** : la page TV adulte promet une appli qui « trouve le PC toute
  seule » et que « Prisme demande d'autoriser » ; l'APK du site attend un
  appairage que le logiciel actuel (`master`) ne fait pas. À vérifier avant
  d'en faire une page de référencement (« regarder sa collection sur la télé »).
- **Doublons de photos** : ajoutés au logiciel le 17/10 (commit `d8dde05`) ;
  les pages doublons (grand public et adulte) en parlent.
- **Téléchargement multi-sites** (version adulte) : forte demande (« porn
  downloader »), mais risque juridique et vis-à-vis de Stripe ; pas de page
  sans votre accord.
- **Prix** : confirmer la grille unique affichée dans les trois univers :
  4,99 €/mois, 29 €/an ou 49 € à vie ; les guides n'en citent aucun.

**Prochaines pages possibles, après observation des requêtes réelles**

- Traduction anglaise de la version grand public (`/en/`) et de ses guides.
- Grand public : regarder ses vidéos du PC sur son téléphone ; longue traîne
  de la réparation (erreur 0xc00d36c4, MP4 sans son, miniatures absentes dans
  l'Explorateur). Une nouvelle page de marque ne sera créée que si la Search
  Console révèle une intention qualifiée et suffisante ; pas de série
  systématique de pages « alternative à ».
- Adulte : la télé (quand Prisme TV sera vérifiée) ; le téléchargement (si
  vous le décidez).
