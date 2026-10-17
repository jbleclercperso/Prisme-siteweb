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
        "Trouver les vidéos en double",
        "Copies exactes, mais aussi la même vidéo réencodée dans une autre qualité.",
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
          <li><a href="mailto:contact@prisme.app" data-link="contact">Contact</a></li>
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


def carte(u, tag="a", cls=""):
    titre, accroche, _ = GUIDES[u]
    c = f' class="{cls}"' if cls else ""
    return f'<a{c} href="{u}"><b>{html.escape(titre)}</b><span>{html.escape(accroche)}</span></a>'


def voisins(u):
    cartes = "\n          ".join(carte(v) for v in VOISINS[u])
    return f"""<!-- voisins : écrit par scripts/gabarit.py -->
      <nav class="voisins" aria-label="À lire aussi">
        <h2>À lire aussi</h2>
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
    print(f"{len(changes)} page(s) habillée(s)" + (" : " + ", ".join(changes) if changes else ""))


if __name__ == "__main__":
    main()
