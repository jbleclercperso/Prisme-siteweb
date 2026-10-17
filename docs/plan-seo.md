# Prisme — audit SEO et plan du site

Octobre 2026. Ce document n'est pas servi par le site (`/docs/*` est masqué
dans `netlify.toml`). Les relevés bruts de la recherche (mots-clés,
concurrents) sont résumés ici ; les tableaux complets restent dans les notes
de travail.

---

## 1. Audit du site existant

### 1.1 Ce qui est en ligne

- Netlify, projet `prisme-website`, adresse **https://prisme-website.netlify.app**.
- Branche de production : `claude/jolly-turing-14mvit`. La dernière mise en
  ligne date du 03/10 (commit `8c04025`) : les trois commits suivants
  (version neutre, anglais à jour, format des clés) sont sur la branche mais
  **pas en ligne**. `/neutre/` répond 404 en production.
- La branche par défaut du dépôt est `claude/stoic-lovelace-0b80zy`, au même
  commit que `jolly-turing`. `main` est quasi vide.

### 1.2 Le problème n° 1 : le nom de domaine

Toutes les balises `canonical`, `hreflang`, `og:image`, le `sitemap.xml`, le
`robots.txt` et les adresses `contact@` pointent vers **`www.prisme.app`**, qui
**n'appartient pas au site** : il répond « erreur 530 » (Cloudflare, origine
introuvable). Conséquences :

- Google reçoit sur chaque page l'ordre « la vraie page est ailleurs », vers
  une adresse morte. Au mieux il l'ignore, au pire il n'indexe rien.
- Le sitemap déclaré est introuvable ; la Search Console ne peut pas être
  reliée à un domaine qu'on ne possède pas.
- **Bug visible des clients** : `tv.html` dit de taper `prisme.app/tv.apk`
  dans Downloader. Sur la télé, cette adresse mène chez quelqu'un d'autre.
- Les e-mails `contact@prisme.app` n'arrivent nulle part.

### 1.3 Le problème n° 2 : un site classé « adulte » face à des recherches grand public

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
- **Reconnaissance des visages**, retouche photo, sauvegarde du téléphone,
  synchronisation cloud : rien de tout cela. Les pages « alternative à
  Picasa / Google Photos » le disent.
- **Chiffrement** : le code PIN et les dossiers masqués ne chiffrent rien. On
  ne vise pas « protéger un dossier par mot de passe ».
- **Corriger le son d'un fichier** : l'égalisation agit à la lecture, le
  fichier n'est pas modifié. La page le dit, et donne la méthode ffmpeg.

---

## 3. Architecture cible

Toutes les nouvelles pages sont **neutres** (aucun mot, aucune image adulte,
pas de `rating adult`, pas de contrôle d'âge), en français, avec des
adresses en dossier. Elles mènent vers la **page produit neutre** et vers le
téléchargement. Elles ne lient pas la version adulte.

```
/                          accueil (version adulte, inchangée sur le fond)
/neutre/                   page produit grand public  ← devient indexable (décision A)
/guides/                   le sommaire : tous les problèmes, par thème
│
├─ Trier et organiser
│  ├─ /organiser-photos-videos-pc/        guide de fond (pilier)
│  ├─ /logiciel-tri-photos-videos/        page produit « logiciel pour trier »
│  └─ /trier-des-milliers-de-photos/      méthode pas à pas
├─ Doublons
│  └─ /doublons-videos-photos/            trouver et supprimer, même réencodés
├─ Réparer
│  └─ /reparer-video-corrompue/           MP4, MOV, MKV abîmés : gratuit d'abord, puis Prisme
├─ Regarder
│  ├─ /lire-plusieurs-videos-en-meme-temps/   le Mur
│  ├─ /lecteur-video-toujours-au-premier-plan/ le lecteur flottant
│  └─ /egaliser-volume-videos/            son trop bas, volume inégal
├─ NAS, télé, téléphone
│  ├─ /alternative-video-station-synology/
│  ├─ /regarder-videos-pc-sur-tv/         Fire TV, Android TV, sans Plex
│  └─ /plex-jellyfin-ou-prisme/           comparatif honnête
├─ Retrouver
│  └─ /retrouver-une-video-par-son-contenu/   recherche par description (bêta)
└─ Alternatives
   └─ /alternative-picasa/                visionneuse et tri local, Windows 10/11
```

### 3.1 Les pages, leurs mots-clés, leur priorité

Priorité : **P1** = cette session, fort potentiel et concurrence faible ;
**P2** = cette session si le temps le permet, sinon prochaine vague ;
**P3** = plus tard.

| # | Adresse | Mot-clé principal | Secondaires | Intention | Prio |
|---|---|---|---|---|---|
| 1 | `/alternative-video-station-synology/` | alternative video station synology | remplacement video station, regarder vidéos NAS Synology sur TV / téléphone | comparatif | P1 |
| 2 | `/reparer-video-corrompue/` | réparer vidéo corrompue | fichier mp4 corrompu que faire, vidéo endommagée, réparer avec VLC, mkv corrompu, vidéo GoPro illisible, sans l'envoyer en ligne | info → produit | P1 |
| 3 | `/doublons-videos-photos/` | logiciel doublons vidéo | supprimer photos et vidéos en double sur PC, même vidéo en plusieurs résolutions, alternative dupeGuru | produit | P1 |
| 4 | `/organiser-photos-videos-pc/` | organiser ses photos et vidéos sur PC | classer, ranger, faire le tri, arborescence, gestionnaire de photos et vidéos | info (pilier) | P1 |
| 5 | `/logiciel-tri-photos-videos/` | logiciel pour trier ses photos et vidéos | logiciel tri photo Windows, trier ses vidéos, trier rapidement | produit | P1 |
| 6 | `/regarder-videos-pc-sur-tv/` | regarder les vidéos du PC sur la TV | film PC sur Fire TV sans Plex, Fire TV Stick NAS, Android TV | info → produit | P1 |
| 7 | `/egaliser-volume-videos/` | égaliser le son de plusieurs vidéos | vidéo son trop faible, augmenter le son d'une vidéo MP4 | info → produit | P1 |
| 8 | `/plex-jellyfin-ou-prisme/` | plex ou jellyfin | alternative gratuite à Plex, Plex payant 2026 | comparatif | P1 |
| 9 | `/lire-plusieurs-videos-en-meme-temps/` | lire plusieurs vidéos en même temps | regarder plusieurs vidéos à la fois, VLC plusieurs vidéos | info → produit | P2 |
| 10 | `/lecteur-video-toujours-au-premier-plan/` | lecteur vidéo toujours au premier plan | VLC picture in picture Windows, lecteur flottant | info → produit | P2 |
| 11 | `/trier-des-milliers-de-photos/` | comment trier des milliers de photos | trier ses photos rapidement, tri photo au clavier | info | P2 |
| 12 | `/alternative-picasa/` | alternative Picasa Windows 10 / 11 | équivalent Picasa, alternative visionneuse photo Windows 11, diaporama photo aléatoire | comparatif | P2 |
| 13 | `/retrouver-une-video-par-son-contenu/` | retrouver une vidéo par son contenu | rechercher dans ses vidéos, recherche par image locale | info → produit | P2 |
| 14 | `/guides/` | guides photos et vidéos | — | sommaire | P1 |
| — | `/regarder-ses-videos-sur-son-telephone/` | regarder ses vidéos du PC sur son téléphone | sans cloud, à distance | info | P3 |
| — | Longue traîne réparation : erreur 0xc00d36c4, MP4 sans son, miniatures absentes dans l'Explorateur | | | info | P3 |
| — | Alternatives : Google Photos (local), Adobe Bridge, Duplicate Video Search | | | comparatif | P3 |
| — | Versions anglaises des pages | | | | P3 |

### 3.2 Gabarit de chaque page

- **Title** 50–65 caractères, mot-clé d'abord, « | Prisme » à la fin.
- **Description** 140–160 caractères : le problème, la réponse, « Windows »,
  « 100 % local » ou « essai gratuit » selon la page.
- **Un H1** qui reprend la question telle qu'on la tape ; H2 = les sous-questions.
- **La réponse d'abord**, en deux ou trois phrases (bloc « En bref »), puis le
  détail. Les solutions gratuites quand elles existent (VLC, ffmpeg, Windows) :
  c'est ce qui rend la page crédible et ce que Google récompense.
- **Ce que fait Prisme**, sans exagération, puis **ses limites** (« ce qu'il ne
  fait pas »), puis l'appel à l'essai.
- **FAQ** de 3 à 5 questions issues des « Autres questions posées ».
- Fil d'Ariane visible (Accueil › Guides › Page) + `BreadcrumbList`.
- Données structurées : `Article` (ou `TechArticle`) avec auteur = Prisme
  (organisation), `dateModified` ; `FAQPage` ; `SoftwareApplication` sur les
  pages produit, **sans notes**.
- Open Graph et Twitter complets, `canonical` sur elle-même.
- Bloc « À lire aussi » : 3 liens vers les pages voisines.

### 3.3 Maillage interne

- **Le pilier** (`/organiser-photos-videos-pc/`) lie toutes les pages du thème
  « trier » et chaque problème (doublons, réparation, TV) au bon paragraphe.
- **Chaque page** lie : le pilier, la page produit neutre, 2 à 3 voisines
  (« À lire aussi »), le téléchargement.
- **`/guides/`** lie tout, par thème ; il est lié depuis l'en-tête et le pied de
  page de chaque page neutre, et depuis le pied de page de la page produit.
- Liens croisés obligatoires : réparation ↔ doublons (« libérer de la place ») ;
  Video Station ↔ TV ↔ Plex/Jellyfin ; Mur ↔ lecteur flottant ↔ volume ;
  Picasa ↔ trier des milliers de photos.
- Ancres descriptives (« trouver les vidéos en double »), jamais « cliquez ici ».

---

## 4. Décisions à prendre (avant l'exécution)

**A. Où mènent les pages grand public ?**
Recommandé : vers **`/neutre/`, rendu indexable** (canonical, retrait du
`noindex`, sélecteur « Adulte » retiré de ses en-têtes), la version adulte
restant à la racine avec son marquage. À terme, l'idéal est **deux domaines**
(ou le grand public à la racine et l'adulte dans un sous-dossier), car un site
majoritairement explicite peut être filtré en bloc. Attention : les deux
versions n'affichent pas le même prix (29 € à vie côté neutre ; 4,99 €/mois,
49,90 €/an, 99 € à vie côté adulte). Les nouvelles pages ne citeront **aucun
prix**, seulement « essai gratuit de 14 jours ».

**B. Quelle adresse dans les balises ?**
Recommandé, en attendant un vrai domaine : **`https://prisme-website.netlify.app`**
partout (canonical, sitemap, robots, OG, page TV), via une seule constante
facile à remplacer. Le jour où un domaine est acheté et branché dans Netlify,
l'ancienne adresse y redirige d'elle-même ; on remplace la constante et on
renvoie le sitemap.

**C. Mise en ligne** : le site de production suit `claude/jolly-turing-14mvit`,
et ses trois derniers commits ne sont pas en ligne. Je pousse sur la branche par
défaut **et** sur `jolly-turing` (elles sont identiques) ; il faudra regarder
dans Netlify pourquoi les derniers déploiements ne sont pas publiés.

---

## 5. Exécution prévue

1. **Technique sur l'existant** : adresse unique (décision B) dans toutes les
   balises, le sitemap, le robots, la page TV ; titre de l'accueil visible dès
   l'affichage (LCP) ; descriptions raccourcies ; OG et Twitter complets sur
   toutes les pages indexables ; `SoftwareApplication` complété + `Organization`
   + `WebSite` + `FAQPage` sur l'accueil (FR et EN) ; `HowTo` sur la page TV ;
   `/neutre/` indexable si décision A ; `/docs/` masqué.
2. **Gabarit** : en-tête, pied de page et style d'article communs aux pages
   neutres (`assets/css/guide.css`), réutilisant l'identité du site.
3. **Pages P1** (8 pages + sommaire), puis **P2** (5 pages).
4. **Sitemap** avec `lastmod`, maillage, liens depuis les pieds de page.
5. **Vérification** : rendu bureau et téléphone, liens internes (script),
   validité du JSON-LD (analyse + règles schema.org), puis commit et push.

## 6. Ce qui restera à faire de votre côté

- Acheter un nom de domaine, le brancher dans Netlify, puis me laisser changer
  la constante d'adresse.
- Search Console : ajouter la propriété, envoyer le sitemap, demander
  l'indexation des pages P1 ; Bing Webmaster Tools (import depuis la Search
  Console en un clic).
- Netlify : vérifier pourquoi les derniers commits ne sont pas en ligne.
- Liens externes : fiches logiciel (Clubic, 01net Télécharger, Presse-Citron,
  Journal du Geek), réponses utiles sur les forums Synology, Dealabs, Reddit
  r/synology et r/france, proposition d'article à JustGeek ou Korben.
- Dès les premières ventes : de vrais avis, qui pourront alors alimenter le
  balisage.
