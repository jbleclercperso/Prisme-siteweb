"""L'habillage commun des pages grand public :  python scripts/gabarit.py

Les pages grand public (accueil, téléchargement, pages légales, guides) sont
des fichiers HTML complets, qu'on modifie directement. Seuls quelques blocs
communs sont écrits par ce script, entre leurs marques :

  <!-- en-tete --> … <!-- /en-tete -->   l'en-tête (pas sur l'accueil, qui a le sien)
  <!-- pied --> … <!-- /pied -->         le pied de page, avec les guides
  <!-- voisins --> … <!-- /voisins -->   « À lire aussi », d'après VOISINS
  <!-- sommaire --> … <!-- /sommaire --> la liste des guides, sur /guides/

Ajouter un guide : sa fiche dans GUIDES (et dans scripts/seo.py), ses voisins
dans VOISINS, puis relancer ce script et scripts/seo.py.
"""
from __future__ import annotations

import html
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Les guides : adresse → (titre court, accroche, thème). L'ordre est celui du sommaire.
THEMES = ["Trier et organiser", "Doublons et place disque", "Réparer", "Regarder",
          "NAS, télé et téléphone", "Retrouver", "Alternatives"]
GUIDES = {
    "/organiser-photos-videos-pc/": (
        "Organiser ses photos et vidéos sur PC",
        "La méthode complète : arborescence, noms, tri, doublons, sauvegarde.", "Trier et organiser"),
    "/logiciel-tri-photos-videos/": (
        "Un logiciel pour trier ses photos et vidéos",
        "Une touche par décision, la suivante s'affiche : trier des milliers de fichiers en une soirée.",
        "Trier et organiser"),
    "/trier-des-milliers-de-photos/": (
        "Trier des milliers de photos",
        "Une méthode en trois passes pour venir à bout d'années de photos en retard.", "Trier et organiser"),
    "/doublons-videos-photos/": (
        "Trouver les vidéos et photos en double",
        "Copies exactes, mais aussi la même vidéo réencodée, la même photo convertie ou réduite.",
        "Doublons et place disque"),
    "/reparer-video-corrompue/": (
        "Réparer une vidéo corrompue",
        "MP4, MOV ou MKV illisible, image qui se fige, pavés de couleur : que faire, dans l'ordre.",
        "Réparer"),
    "/egaliser-volume-videos/": (
        "Égaliser le son de plusieurs vidéos",
        "Des vidéos trop basses, d'autres trop fortes : les remonter à la lecture ou pour de bon.",
        "Regarder"),
    "/lire-plusieurs-videos-en-meme-temps/": (
        "Lire plusieurs vidéos en même temps",
        "De 2 à 10 vidéos à l'écran, chacune son lecteur : passer en revue des dizaines de plans.",
        "Regarder"),
    "/lecteur-video-toujours-au-premier-plan/": (
        "Un lecteur vidéo toujours au premier plan",
        "Garder la vidéo à l'écran pendant qu'on travaille dans une autre fenêtre.", "Regarder"),
    "/alternative-video-station-synology/": (
        "Remplacer Video Station sur un NAS Synology",
        "Video Station a disparu de DSM : les solutions pour regarder ses vidéos du NAS.",
        "NAS, télé et téléphone"),
    "/regarder-videos-pc-sur-tv/": (
        "Regarder les vidéos du PC sur la télé",
        "Câble, partage réseau, Fire TV, Android TV : les solutions, du plus simple au plus complet.",
        "NAS, télé et téléphone"),
    "/plex-jellyfin-ou-prisme/": (
        "Plex, Jellyfin ou Prisme ?",
        "Un serveur de films ou un outil de tri : lequel choisir, et quand les combiner.",
        "NAS, télé et téléphone"),
    "/retrouver-une-video-par-son-contenu/": (
        "Retrouver une vidéo par ce qu'elle montre",
        "Décrire la scène et laisser l'ordinateur chercher, sans rien envoyer sur Internet.", "Retrouver"),
    "/alternative-picasa/": (
        "Une alternative à Picasa sur Windows 10 et 11",
        "Classer et regarder ses photos en local, sans compte ni cloud.", "Alternatives"),
}

VOISINS = {
    "/organiser-photos-videos-pc/": ["/logiciel-tri-photos-videos/", "/doublons-videos-photos/", "/trier-des-milliers-de-photos/"],
    "/logiciel-tri-photos-videos/": ["/organiser-photos-videos-pc/", "/doublons-videos-photos/", "/lire-plusieurs-videos-en-meme-temps/"],
    "/trier-des-milliers-de-photos/": ["/organiser-photos-videos-pc/", "/alternative-picasa/", "/doublons-videos-photos/"],
    "/doublons-videos-photos/": ["/reparer-video-corrompue/", "/organiser-photos-videos-pc/", "/logiciel-tri-photos-videos/"],
    "/reparer-video-corrompue/": ["/doublons-videos-photos/", "/egaliser-volume-videos/", "/organiser-photos-videos-pc/"],
    "/egaliser-volume-videos/": ["/lire-plusieurs-videos-en-meme-temps/", "/lecteur-video-toujours-au-premier-plan/", "/reparer-video-corrompue/"],
    "/lire-plusieurs-videos-en-meme-temps/": ["/lecteur-video-toujours-au-premier-plan/", "/logiciel-tri-photos-videos/", "/egaliser-volume-videos/"],
    "/lecteur-video-toujours-au-premier-plan/": ["/lire-plusieurs-videos-en-meme-temps/", "/egaliser-volume-videos/", "/logiciel-tri-photos-videos/"],
    "/alternative-video-station-synology/": ["/regarder-videos-pc-sur-tv/", "/plex-jellyfin-ou-prisme/", "/organiser-photos-videos-pc/"],
    "/regarder-videos-pc-sur-tv/": ["/alternative-video-station-synology/", "/plex-jellyfin-ou-prisme/", "/egaliser-volume-videos/"],
    "/plex-jellyfin-ou-prisme/": ["/alternative-video-station-synology/", "/regarder-videos-pc-sur-tv/", "/logiciel-tri-photos-videos/"],
    "/retrouver-une-video-par-son-contenu/": ["/organiser-photos-videos-pc/", "/doublons-videos-photos/", "/logiciel-tri-photos-videos/"],
    "/alternative-picasa/": ["/trier-des-milliers-de-photos/", "/organiser-photos-videos-pc/", "/doublons-videos-photos/"],
}

# La version adulte a ses propres guides, en français et en anglais : chaque
# sujet a sa page dans les deux langues, reliées par hreflang (scripts/seo.py).
# Ils ne sont jamais liés depuis la version grand public.
# (slug français, slug anglais), (titre, accroche) en français, puis en anglais.
ADULTE = {"fr": "/adulte/", "en": "/en/adult/"}
GUIDES_ADULTES = [
    (("logiciel-organiser-collection-porno", "best-porn-organizer-software"),
     ("Quel logiciel pour organiser sa collection porno ?", "Stash, Plex, Jellyfin ou Prisme : ce que chacun fait, pour qui."),
     ("The best software to organize porn", "Stash, Plex, Jellyfin or Prisme: what each one does, and who it suits.")),
    (("alternative-stash", "stash-alternative"),
     ("Une alternative à Stash pour Windows", "Sans serveur ni navigateur : quand choisir Prisme, quand garder Stash."),
     ("A Stash alternative for Windows", "No server, no browser: when to pick Prisme, when to keep Stash.")),
    (("trier-videos-porno", "sort-porn-videos"),
     ("Trier ses vidéos porno au clavier", "Une touche par catégorie, la suivante aussitôt : la méthode."),
     ("Sort porn videos with the keyboard", "One key per category, the next video instantly: the method.")),
    (("doublons-videos-porno", "porn-duplicate-finder"),
     ("Doublons de vidéos porno", "La même scène, même dans une autre résolution : garder la meilleure."),
     ("Porn duplicate finder", "The same scene, even at another resolution: keep the best one.")),
    (("lecteur-video-porno-apercus", "porn-video-player-previews"),
     ("Un lecteur avec aperçus et Mur de vidéos", "Voir le contenu sans ouvrir, dix vidéos à la fois, le lecteur flottant."),
     ("A player with previews and a video Wall", "See inside without opening, ten videos at once, the floating player.")),
    (("mots-cles-recherche-ia-porno", "auto-tag-porn-ai-search"),
     ("Mots-clés automatiques et recherche par IA", "Des catégories tirées des noms, une scène retrouvée par sa description."),
     ("Auto-tagging and AI scene search", "Categories from file names, a scene found from its description.")),
    (("cacher-videos-porno-pc", "hide-porn-on-pc"),
     ("Cacher ses vidéos porno sur son PC", "Ce qui protège vraiment, et l'écran de repli instantané."),
     ("How to hide porn on your PC", "What actually protects it, and the instant cover screen.")),
    (("plex-jellyfin-porno", "plex-jellyfin-porn"),
     ("Plex ou Jellyfin pour le porno", "Ce qui marche, les limites, et les réglages pour rester privé."),
     ("Plex or Jellyfin for porn", "What works, the limits, and the settings to stay private.")),
]
VOISINS_ADULTES = {  # par slug français ; le jumeau anglais suit
    "logiciel-organiser-collection-porno": ["alternative-stash", "trier-videos-porno", "plex-jellyfin-porno"],
    "alternative-stash": ["logiciel-organiser-collection-porno", "trier-videos-porno", "mots-cles-recherche-ia-porno"],
    "trier-videos-porno": ["lecteur-video-porno-apercus", "doublons-videos-porno", "mots-cles-recherche-ia-porno"],
    "doublons-videos-porno": ["trier-videos-porno", "logiciel-organiser-collection-porno", "lecteur-video-porno-apercus"],
    "lecteur-video-porno-apercus": ["trier-videos-porno", "cacher-videos-porno-pc", "doublons-videos-porno"],
    "mots-cles-recherche-ia-porno": ["trier-videos-porno", "alternative-stash", "lecteur-video-porno-apercus"],
    "cacher-videos-porno-pc": ["lecteur-video-porno-apercus", "plex-jellyfin-porno", "logiciel-organiser-collection-porno"],
    "plex-jellyfin-porno": ["cacher-videos-porno-pc", "logiciel-organiser-collection-porno", "alternative-stash"],
}
TEXTES = {"fr": {"voisins": "À lire aussi"}, "en": {"voisins": "Read next"}}


def guides_adultes(lang):
    """Les guides adultes d'une langue : adresse → (titre, accroche)."""
    i = 0 if lang == "fr" else 1
    return {ADULTE[lang] + slugs[i] + "/": (fr if lang == "fr" else en) for slugs, fr, en in GUIDES_ADULTES}


def url_adulte(slug_fr, lang):
    for slugs, _, _ in GUIDES_ADULTES:
        if slugs[0] == slug_fr:
            return ADULTE[lang] + slugs[0 if lang == "fr" else 1] + "/"
    raise KeyError(slug_fr)


# Les guides cités dans le pied de page de toutes les pages grand public.
AU_PIED = ["/organiser-photos-videos-pc/", "/doublons-videos-photos/", "/reparer-video-corrompue/",
           "/alternative-video-station-synology/", "/regarder-videos-pc-sur-tv/"]

# Les pages grand public qui reçoivent l'habillage (l'accueil garde son en-tête).
PAGES = ["index.html", "telecharger.html", "cgv.html", "confidentialite.html", "mentions-legales.html",
         "404.html", "guides/index.html"] + [u.strip("/") + "/index.html" for u in GUIDES]
SANS_EN_TETE = {"index.html"}

LOGO = ('<img src="/assets/img/prisme.png" alt="" width="32" height="32">'
        '<img class="brand-word" src="/assets/img/prisme-lettrage.png" alt="Prisme" width="115" height="15">')

EN_TETE = f"""<!-- en-tete : écrit par scripts/gabarit.py -->
<a class="skip-link" href="#contenu">Aller au contenu</a>

<header class="nav is-scrolled" id="nav">
  <div class="container nav-inner">
    <a class="brand" href="/" aria-label="Prisme, accueil">
      {LOGO}
    </a>
    <ul class="nav-links">
      <li><a href="/#fonctionnalites">Fonctionnalités</a></li>
      <li><a href="/#mur">Le Mur</a></li>
      <li><a href="/guides/">Guides</a></li>
      <li><a href="/#tarifs">Tarif</a></li>
      <li><a href="/#faq">FAQ</a></li>
    </ul>
    <div class="nav-cta">
      <a class="btn btn-primary btn-sm" href="/telecharger.html" data-link="trial">Essai gratuit</a>
    </div>
    <button class="nav-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
  </div>
</header>
<!-- /en-tete -->"""


def pied():
    guides = "\n".join(f'          <li><a href="{u}">{html.escape(GUIDES[u][0])}</a></li>' for u in AU_PIED)
    return f"""<!-- pied : écrit par scripts/gabarit.py -->
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="/">{LOGO}</a>
        <p>Le logiciel Windows pour trier, ranger et regarder vos vidéos et vos photos, au clavier. 100 % local.</p>
      </div>
      <div>
        <h4>Produit</h4>
        <ul>
          <li><a href="/#fonctionnalites">Fonctionnalités</a></li>
          <li><a href="/#mur">Le Mur</a></li>
          <li><a href="/#confiance">Confiance</a></li>
          <li><a href="/#tarifs">Tarif</a></li>
          <li><a href="/telecharger.html" data-link="trial">Télécharger</a></li>
        </ul>
      </div>
      <div>
        <h4>Guides</h4>
        <ul>
{guides}
          <li><a href="/guides/">Tous les guides</a></li>
        </ul>
      </div>
      <div>
        <h4>Aide</h4>
        <ul>
          <li><a href="/#faq">Questions fréquentes</a></li>
          <li><a href="mailto:contact@prisme-desktop.com" data-link="contact">Contact</a></li>
          <li><a href="/#tarifs" data-link="account">Mon compte</a></li>
          <li><a href="/mentions-legales.html">Mentions légales</a></li>
          <li><a href="/cgv.html">Conditions de vente</a></li>
          <li><a href="/confidentialite.html">Confidentialité</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>Prisme est un logiciel : il n'héberge ni ne fournit aucun contenu.</span>
      <span>© <span data-year>2026</span> Prisme. Tous droits réservés.</span>
    </div>
  </div>
</footer>
<!-- /pied -->"""


def carte(u, cls="", fiches=None):
    titre, accroche = (fiches or GUIDES)[u][:2]
    c = f' class="{cls}"' if cls else ""
    return f'<a{c} href="{u}"><b>{html.escape(titre)}</b><span>{html.escape(accroche)}</span></a>'


def voisins(u, liste=None, fiches=None, lang="fr"):
    cartes = "\n          ".join(carte(v, fiches=fiches) for v in (liste or VOISINS[u]))
    titre = TEXTES[lang]["voisins"]
    return f"""<!-- voisins : écrit par scripts/gabarit.py -->
      <nav class="voisins" aria-label="{titre}">
        <h2>{titre}</h2>
        <div class="voisins-grille">
          {cartes}
        </div>
      </nav>
      <!-- /voisins -->"""


def sommaire():
    blocs = []
    for theme in THEMES:
        us = [u for u, g in GUIDES.items() if g[2] == theme]
        if not us:
            continue
        cartes = "\n          ".join(carte(u, cls="carte-guide") for u in us)
        blocs.append(f"""      <section class="guides-theme">
        <h2>{html.escape(theme)}</h2>
        <div class="guides-grille">
          {cartes}
        </div>
      </section>""")
    return "<!-- sommaire : écrit par scripts/gabarit.py -->\n" + "\n".join(blocs) + "\n      <!-- /sommaire -->"


def sommaire_adulte(lang):
    fiches = guides_adultes(lang)
    cartes = "\n          ".join(carte(u, cls="carte-guide", fiches=fiches) for u in fiches)
    return ("<!-- sommaire : écrit par scripts/gabarit.py -->\n      <section class=\"guides-theme\">\n"
            "        <div class=\"guides-grille\">\n          " + cartes +
            "\n        </div>\n      </section>\n      <!-- /sommaire -->")


def adultes():
    """Les pages des guides adultes : (fichier, langue, slug français, ou None pour le sommaire)."""
    for lang in ("fr", "en"):
        yield ADULTE[lang].strip("/") + "/guides/index.html", lang, None
        for slugs, _, _ in GUIDES_ADULTES:
            yield ADULTE[lang].strip("/") + "/" + slugs[0 if lang == "fr" else 1] + "/index.html", lang, slugs[0]


def poser(texte, nom, contenu, defaut=None):
    """Remplace le bloc entre les marques ; à défaut, remplace `defaut` (une expression)."""
    motif = re.compile(rf"<!-- {nom}\b.*?<!-- /{nom} -->", re.S)
    if motif.search(texte):
        return motif.sub(lambda m: contenu, texte, count=1)
    if defaut:
        nouveau, n = re.subn(defaut, lambda m: contenu, texte, count=1, flags=re.S)
        if n:
            return nouveau
    return texte


def main():
    changes = []
    for rel in PAGES:
        f = ROOT / rel
        if not f.exists():
            print("absente :", rel)
            continue
        t = f.read_text(encoding="utf-8")
        avant = t
        if rel not in SANS_EN_TETE:
            t = poser(t, "en-tete", EN_TETE,
                      r'<a class="skip-link".*?</header>')
        t = poser(t, "pied", pied(), r"<footer class=\"footer\">.*?</footer>")
        url = "/" + rel[: -len("index.html")] if rel.endswith("index.html") else None
        if url in VOISINS:
            t = poser(t, "voisins", voisins(url))
        if rel == "guides/index.html":
            t = poser(t, "sommaire", sommaire())
        if t != avant:
            f.write_text(t, encoding="utf-8", newline="\n")
            changes.append(rel)
    for rel, lang, slug in adultes():
        f = ROOT / rel
        if not f.exists():
            print("absente :", rel)
            continue
        t = f.read_text(encoding="utf-8")
        avant = t
        if slug is None:
            t = poser(t, "sommaire", sommaire_adulte(lang))
        else:
            liste = [url_adulte(v, lang) for v in VOISINS_ADULTES[slug]]
            t = poser(t, "voisins", voisins(None, liste, guides_adultes(lang), lang))
        if t != avant:
            f.write_text(t, encoding="utf-8", newline="\n")
            changes.append(rel)
    print(f"{len(changes)} page(s) habillée(s)" + (" : " + ", ".join(changes) if changes else ""))


if __name__ == "__main__":
    main()
