"""Les balises de référencement de tout le site, écrites depuis une seule liste.

    python scripts/seo.py            réécrit les balises de chaque page,
                                     le sitemap.xml et le robots.txt
    python scripts/seo.py --verifier ne touche à rien, dit ce qui manque

Chaque page a sa fiche dans PAGES : son adresse, sa langue, son titre, sa
description, sa version (neutre ou adulte) et ce qu'elle est (accueil, guide,
page légale…). Le script en tire, entre les marques « seo » de son <head> :
le titre, la description, l'adresse canonique, les versions dans les autres
langues (hreflang), l'aperçu des réseaux (Open Graph, Twitter), le marquage
adulte, et les données structurées schema.org. Il écrit aussi sitemap.xml et
robots.txt. On ne retouche donc jamais ces balises à la main : on corrige la
fiche, et l'on relance le script.

Deux sites en un, chacun son référencement : la version grand public à la
racine, la version adulte dans /adulte/ et /en/adult/, marquée comme telle
(<meta name="rating" content="adult">, contentRating), comme Google le
demande pour un site qui mêle les deux. Une page neutre ne pointe jamais vers
la version adulte.

Changer de nom de domaine : modifier BASE ci-dessous, relancer le script.
"""
from __future__ import annotations

import datetime
import html
import json
import pathlib
import re
import subprocess
import sys

# L'adresse du site. Provisoire : celle de Netlify, en attendant le nom de
# domaine. Le jour où il est branché dans Netlify, l'ancienne adresse y
# redirige d'elle-même ; il suffit de changer cette ligne et de relancer.
BASE = "https://prisme-website.netlify.app"

ROOT = pathlib.Path(__file__).resolve().parent.parent
OG_IMAGE = "/assets/img/og.png"  # 1200 × 630
LOGO = "/assets/img/prisme-icon-512.png"
LOCALES = {"fr": "fr_FR", "en": "en_US"}
TODAY = datetime.date.today().isoformat()

ORGANISATION = {
    "@type": "Organization",
    "@id": BASE + "/#organisation",
    "name": "Prisme",
    "url": BASE + "/",
    "logo": {"@type": "ImageObject", "url": BASE + LOGO, "width": 512, "height": 512},
}

# Le logiciel, tel que le décrit chaque version du site.
LOGICIEL = {
    "neutre": {
        "fr": "Logiciel Windows pour trier, ranger, retrouver et regarder ses vidéos et ses photos, "
              "au clavier : aperçus au survol, Mur de vidéos, doublons, réparation des vidéos abîmées, "
              "accès depuis le téléphone et la télé. 100 % local.",
        "en": "Windows software to sort, organize, find and watch your videos and photos with the "
              "keyboard: previews on hover, video Wall, duplicates, repair of damaged videos, access "
              "from your phone and TV. 100% local.",
        "offres": {"fr": {"@type": "Offer", "price": "29", "priceCurrency": "EUR",
                          "description": "Licence à vie, après un essai gratuit de 14 jours"},
                   "en": {"@type": "Offer", "price": "29", "priceCurrency": "EUR",
                          "description": "Lifetime licence, after a 14-day free trial"}},
    },
    "adulte": {
        "fr": "Logiciel Windows pour trier, organiser et regarder une collection de vidéos et de "
              "photos pornographiques. 100 % local.",
        "en": "Windows software to sort, organize and watch a collection of pornographic videos "
              "and photos. 100% local.",
        "offres": {"fr": {"@type": "AggregateOffer", "lowPrice": "4.99", "highPrice": "99",
                          "priceCurrency": "EUR", "offerCount": "3"},
                   "en": {"@type": "AggregateOffer", "lowPrice": "4.99", "highPrice": "99",
                          "priceCurrency": "USD", "offerCount": "3"}},
    },
}

# Prisme TV, en quatre gestes (pages TV : données « HowTo »).
TV_ETAPES = {
    "fr": [
        ("Installer Downloader", "Installez l'application gratuite Downloader depuis le magasin d'applications de la télé."),
        ("Autoriser l'installation", "Dans les paramètres de la télé, autorisez Downloader à installer des applications inconnues."),
        ("Installer Prisme TV", "Dans Downloader, tapez l'adresse du site suivie de /tv.apk, puis choisissez « Installer »."),
        ("Autoriser la télé", "Ouvrez Prisme TV : elle trouve le PC toute seule, et Prisme demande sur le PC d'autoriser la télé."),
    ],
    "en": [
        ("Install Downloader", "Install the free Downloader app from your TV's app store."),
        ("Allow installs", "In the TV settings, allow Downloader to install unknown apps."),
        ("Install Prisme TV", "In Downloader, type the site's address followed by /tv.apk, then choose “Install”."),
        ("Allow the TV", "Open Prisme TV: it finds your PC on its own, and Prisme asks on the PC to allow the TV."),
    ],
}

# Fil d'Ariane des guides.
GUIDES = {"fr": ("Guides", "/guides/"), "en": ("Guides", "/en/guides/")}
ACCUEIL = {"neutre": {"fr": "/", "en": "/en/"}, "adulte": {"fr": "/adulte/", "en": "/en/adult/"}}


def page(file, url, lang, title, description, *, version="neutre", kind="page", group=None,
         index=True, og_title=None, published=None, crumb=None):
    return dict(file=file, url=url, lang=lang, title=title, description=description, version=version,
                kind=kind, group=group, index=index, og_title=og_title, published=published, crumb=crumb)


def guide(slug, title, description, crumb, published="2026-10-17"):
    return page(f"{slug}/index.html", f"/{slug}/", "fr", title, description, kind="guide",
                crumb=crumb, published=published)


PAGES = [
    # ------------------------------------------------------------ Grand public, français
    page("index.html", "/", "fr",
         "Prisme — Trier, ranger et regarder vos vidéos et photos sur PC",
         "Le logiciel Windows pour trier vos vidéos et photos au clavier : aperçus au survol, doublons, "
         "réparation, NAS et télé. 100 % local. Essai gratuit 14 jours.",
         kind="home", group="accueil",
         og_title="Prisme — Toutes vos vidéos et photos. Une touche pour trier."),
    page("telecharger.html", "/telecharger.html", "fr",
         "Télécharger Prisme pour Windows — essai gratuit de 14 jours",
         "Téléchargez Prisme, le logiciel Windows pour trier et regarder vos vidéos et vos photos. "
         "Essai gratuit de 14 jours, toutes les fonctions, sans carte bancaire.",
         kind="download", group="telecharger"),
    page("cgv.html", "/cgv.html", "fr", "Conditions générales de vente — Prisme",
         "Conditions générales de vente du logiciel Prisme : licence, essai gratuit, paiement, "
         "remboursement.", kind="legal", group="cgv"),
    page("confidentialite.html", "/confidentialite.html", "fr", "Confidentialité — Prisme",
         "Politique de confidentialité du logiciel Prisme et de son site : 100 % local, aucune "
         "télémétrie.", kind="legal", group="confidentialite"),
    page("mentions-legales.html", "/mentions-legales.html", "fr", "Mentions légales — Prisme",
         "Mentions légales du site Prisme.", kind="legal", group="mentions"),
    page("404.html", "/404.html", "fr", "Page introuvable — Prisme", "Cette page n'existe pas.",
         kind="404", index=False),

    # ------------------------------------------------------------ Grand public, guides
    # Une page par problème : voir docs/plan-seo.md (mots-clés visés) et
    # scripts/gabarit.py (sommaire, « À lire aussi »).
    page("guides/index.html", "/guides/", "fr",
         "Guides photos et vidéos : trier, réparer, NAS, télé | Prisme",
         "Doublons, vidéos abîmées, son trop bas, NAS Synology, télé : des guides concrets pour trier, "
         "ranger, réparer et regarder vos vidéos et vos photos sur PC.",
         kind="guides", crumb="Guides"),
    guide("organiser-photos-videos-pc", "Organiser ses photos et vidéos sur PC : la méthode | Prisme",
          "Rassembler, choisir une arborescence, trier en trois passes, supprimer les doublons, "
          "sauvegarder : la méthode complète pour ranger photos et vidéos sur PC.",
          "Organiser ses photos et vidéos"),
    guide("logiciel-tri-photos-videos", "Logiciel pour trier ses photos et vidéos (Windows) | Prisme",
          "Prisme trie vos photos et vidéos au clavier : une touche range le fichier, le suivant "
          "s'affiche. Aperçus des vidéos, doublons, NAS. 100 % local, essai gratuit.",
          "Logiciel de tri"),
    guide("doublons-videos-photos", "Trouver et supprimer les vidéos en double sur PC | Prisme",
          "Copies exactes, mais aussi la même vidéo réencodée dans une autre qualité : comment "
          "retrouver tous les doublons, lesquels garder, et les outils gratuits.",
          "Vidéos en double"),
    guide("reparer-video-corrompue", "Réparer une vidéo corrompue (MP4, MOV, MKV) | Prisme",
          "Vidéo illisible, pavés de couleur, image figée : les solutions gratuites (VLC, ffmpeg), "
          "puis la réparation sans perte de Prisme, sur votre PC.",
          "Réparer une vidéo"),
    guide("egaliser-volume-videos", "Égaliser le son de plusieurs vidéos (volume trop bas) | Prisme",
          "Des vidéos qu'on n'entend pas, d'autres trop fortes : égaliser le volume à la lecture "
          "(VLC, Windows, Prisme) ou pour de bon avec ffmpeg, par lot.",
          "Égaliser le son"),
    guide("alternative-video-station-synology", "Alternative à Video Station : vidéos du NAS Synology | Prisme",
          "Video Station a disparu de DSM 7.2.2 : Plex, Jellyfin, Synology Photos ou Prisme, les "
          "solutions pour regarder les vidéos de votre NAS, comparées.",
          "Remplacer Video Station"),
    guide("regarder-videos-pc-sur-tv", "Regarder les vidéos du PC sur la TV, sans Plex | Prisme",
          "Câble HDMI, DLNA, VLC sur Fire TV ou Android TV, Plex ou Jellyfin : comment regarder les "
          "vidéos et films du PC ou du NAS sur la télé, et comment choisir.",
          "Vidéos du PC sur la télé"),
    guide("plex-jellyfin-ou-prisme", "Plex ou Jellyfin ? Comparatif, et quand choisir Prisme",
          "Plex ou Jellyfin : prix, accès à distance, applications télé, vie privée. Et pour des vidéos "
          "personnelles à trier, pourquoi les combiner avec Prisme.",
          "Plex, Jellyfin ou Prisme"),

    guide("lire-plusieurs-videos-en-meme-temps", "Lire plusieurs vidéos en même temps sur un écran | Prisme",
          "Ouvrir plusieurs vidéos à la fois avec VLC, ou les regarder ensemble dans le Mur de Prisme : "
          "de 2 à 10 vidéos, verticales et horizontales, chacune son lecteur.",
          "Plusieurs vidéos à la fois"),
    guide("lecteur-video-toujours-au-premier-plan", "Lecteur vidéo toujours au premier plan (Windows) | Prisme",
          "Garder une vidéo par-dessus les autres fenêtres : VLC, mpv, PowerToys, image dans l'image, "
          "et le lecteur flottant de Prisme, sans cadre et qui reprend à l'instant.",
          "Lecteur toujours au premier plan"),
    guide("trier-des-milliers-de-photos", "Trier des milliers de photos rapidement : la méthode | Prisme",
          "Trois passes rapides, une décision par photo, au clavier : la méthode pour venir à bout de "
          "milliers de photos et de vidéos en retard, et les outils pour aller vite.",
          "Trier des milliers de photos"),
    guide("retrouver-une-video-par-son-contenu", "Retrouver une vidéo par son contenu, sans cloud | Prisme",
          "Décrire la scène et retrouver la vidéo : comment marche la recherche par le contenu, les outils "
          "existants, et la recherche locale de Prisme, sans rien envoyer.",
          "Retrouver une vidéo par son contenu"),
    guide("alternative-picasa", "Alternative à Picasa pour Windows 10 et 11 | Prisme",
          "Picasa est arrêté depuis 2016 : digiKam, XnView MP, FastStone, Photos de Windows ou Prisme, "
          "les alternatives locales pour classer et regarder vos photos, comparées.",
          "Alternative à Picasa"),

    # ------------------------------------------------------------ Adulte, français
    page("adulte/index.html", "/adulte/", "fr",
         "Prisme — Le logiciel pour trier et regarder votre collection porno",
         "Prisme, le logiciel Windows pour gérer votre collection porno : aperçus au survol, une touche "
         "pour ranger, doublons, mode discret. 100 % local, essai gratuit.",
         version="adulte", kind="home", group="adulte-accueil",
         og_title="Prisme — Des milliers de vidéos. Une touche pour décider."),
    page("adulte/telecharger.html", "/adulte/telecharger.html", "fr",
         "Télécharger Prisme — Essai gratuit de 14 jours",
         "Téléchargez Prisme pour Windows et essayez-le gratuitement pendant 14 jours, sans carte "
         "bancaire : le logiciel pour trier et regarder votre collection porno.",
         version="adulte", kind="download", group="adulte-telecharger"),
    page("adulte/tv.html", "/adulte/tv.html", "fr", "Prisme TV — Votre bibliothèque sur la télé",
         "Installez Prisme TV sur Fire TV, Android TV ou Google TV : votre bibliothèque Prisme sur "
         "grand écran, à la télécommande.", version="adulte", kind="tv", group="adulte-tv"),
    page("adulte/cgv.html", "/adulte/cgv.html", "fr", "Conditions générales de vente — Prisme",
         "Conditions générales de vente du logiciel Prisme.", version="adulte", kind="legal",
         group="adulte-cgv"),
    page("adulte/confidentialite.html", "/adulte/confidentialite.html", "fr", "Confidentialité — Prisme",
         "Politique de confidentialité de Prisme : le logiciel fonctionne 100 % en local.",
         version="adulte", kind="legal", group="adulte-confidentialite"),
    page("adulte/mentions-legales.html", "/adulte/mentions-legales.html", "fr", "Mentions légales — Prisme",
         "Mentions légales du site Prisme.", version="adulte", kind="legal", group="adulte-mentions"),
    page("adulte/merci.html", "/adulte/merci.html", "fr", "Merci — Prisme", "Votre commande Prisme.",
         version="adulte", kind="merci", index=False),
    page("adulte/404.html", "/adulte/404.html", "fr", "Page introuvable — Prisme", "Cette page n'existe pas.",
         version="adulte", kind="404", index=False),

    # ------------------------------------------------------------ Adulte, anglais
    page("en/adult/index.html", "/en/adult/", "en",
         "Prisme — The software to sort and watch your porn collection",
         "Prisme is the Windows software to manage your porn collection: previews on hover, one key to "
         "file, duplicates, discreet mode. 100% local, free trial.",
         version="adulte", kind="home", group="adulte-accueil",
         og_title="Prisme — Thousands of videos. One key to decide."),
    page("en/adult/download.html", "/en/adult/download.html", "en", "Download Prisme — 14-day free trial",
         "Download Prisme for Windows and try it free for 14 days, no credit card required: the "
         "software to sort and watch your porn collection.",
         version="adulte", kind="download", group="adulte-telecharger"),
    page("en/adult/tv.html", "/en/adult/tv.html", "en", "Prisme TV — Your library on the TV",
         "Install Prisme TV on Fire TV, Android TV or Google TV: your Prisme library on the big screen, "
         "with the remote.", version="adulte", kind="tv", group="adulte-tv"),
    page("en/adult/terms.html", "/en/adult/terms.html", "en", "Terms of sale — Prisme",
         "Terms of sale for the Prisme software.", version="adulte", kind="legal", group="adulte-cgv"),
    page("en/adult/privacy.html", "/en/adult/privacy.html", "en", "Privacy — Prisme",
         "Prisme's privacy policy: the software runs 100% locally.", version="adulte", kind="legal",
         group="adulte-confidentialite"),
    page("en/adult/legal-notice.html", "/en/adult/legal-notice.html", "en", "Legal notice — Prisme",
         "Legal notice for the Prisme website.", version="adulte", kind="legal", group="adulte-mentions"),
    page("en/adult/thanks.html", "/en/adult/thanks.html", "en", "Thank you — Prisme", "Your Prisme order.",
         version="adulte", kind="merci", index=False),
    page("en/adult/404.html", "/en/adult/404.html", "en", "Page not found — Prisme", "This page doesn't exist.",
         version="adulte", kind="404", index=False),
]


# ---------------------------------------------------------------- lecture des pages

def esc(s):
    return html.escape(s, quote=True)


def lire(p):
    return (ROOT / p["file"]).read_text(encoding="utf-8")


def texte(fragment):
    """Le texte d'un morceau de HTML, espaces resserrés."""
    t = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", html.unescape(t)).strip()


def faq(source):
    """Les questions de la FAQ de la page (<div class="faq"> <details> <summary>)."""
    bloc = re.search(r'<div class="faq[ "].*?(?=</section>)', source, re.S)
    if not bloc:
        return []
    out = []
    for q, a in re.findall(r"<summary>(.*?)</summary>\s*<div class=\"answer-body\">(.*?)</div>\s*</details>",
                           bloc.group(0), re.S):
        out.append((texte(q), texte(a)))
    return out


def h1(source):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", source, re.S)
    return texte(m.group(1)) if m else ""


def modifie(p):
    """Date du dernier commit qui a touché la page ; aujourd'hui si elle a changé depuis."""
    f = ROOT / p["file"]
    try:
        dirty = subprocess.run(["git", "status", "--porcelain", "--", str(f)], cwd=ROOT,
                               capture_output=True, text=True).stdout.strip()
        if dirty:
            return TODAY
        d = subprocess.run(["git", "log", "-1", "--format=%cs", "--", str(f)], cwd=ROOT,
                           capture_output=True, text=True).stdout.strip()
        return d or TODAY
    except OSError:
        return TODAY


def jumelles(p):
    """Les versions de la page dans chaque langue (elle comprise)."""
    if not p["group"]:
        return {}
    return {q["lang"]: q for q in PAGES if q["group"] == p["group"] and (ROOT / q["file"]).exists()}


# ---------------------------------------------------------------- données structurées

def donnees(p, source):
    url = BASE + p["url"]
    lang = p["lang"]
    adulte = p["version"] == "adulte"
    accueil = BASE + ACCUEIL[p["version"]][lang] if (ROOT / file_of(ACCUEIL[p["version"]][lang])).exists() \
        else BASE + ACCUEIL[p["version"]]["fr"]
    graph = [ORGANISATION]
    site_id = accueil + "#site"
    graph.append({"@type": "WebSite", "@id": site_id, "url": accueil, "name": "Prisme",
                  "inLanguage": lang, "publisher": {"@id": ORGANISATION["@id"]}})

    logiciel_id = accueil + "#logiciel"
    if p["kind"] in ("home", "download", "tv"):
        info = LOGICIEL[p["version"]]
        app = {"@type": "SoftwareApplication", "@id": logiciel_id, "name": "Prisme",
               "url": accueil, "image": BASE + OG_IMAGE,
               "operatingSystem": "Windows 10, Windows 11",
               "applicationCategory": "MultimediaApplication",
               "inLanguage": ["fr", "en"],
               "description": info[lang], "offers": info["offres"][lang],
               "publisher": {"@id": ORGANISATION["@id"]}}
        if adulte:
            app["contentRating"] = "adult"
        graph.append(app)

    webpage = {"@type": "WebPage", "@id": url + "#page", "url": url, "name": p["title"],
               "description": p["description"], "inLanguage": lang,
               "isPartOf": {"@id": site_id}}
    if p["kind"] == "home":
        webpage["about"] = {"@id": logiciel_id}
    if p["kind"] == "guides":
        webpage["@type"] = "CollectionPage"

    ariane = []
    if p["kind"] in ("guide", "guides"):
        ariane = [("Prisme", accueil)]
        if p["kind"] == "guide":
            ariane.append((GUIDES[lang][0], BASE + GUIDES[lang][1]))
        ariane.append((p["crumb"] or h1(source), url))
    elif p["kind"] in ("download", "tv", "legal"):
        ariane = [("Prisme", accueil), (p["crumb"] or p["title"].split(" — ")[0], url)]
    if ariane:
        webpage["breadcrumb"] = {"@id": url + "#ariane"}
        graph.append({"@type": "BreadcrumbList", "@id": url + "#ariane", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(ariane)]})

    if p["kind"] == "guide":
        graph.append({"@type": "TechArticle", "@id": url + "#article", "headline": h1(source)[:110],
                      "description": p["description"], "inLanguage": lang,
                      "image": BASE + OG_IMAGE, "mainEntityOfPage": {"@id": url + "#page"},
                      "datePublished": p["published"] or modifie(p), "dateModified": modifie(p),
                      "author": {"@id": ORGANISATION["@id"]}, "publisher": {"@id": ORGANISATION["@id"]},
                      "about": {"@id": BASE + ACCUEIL["neutre"]["fr"] + "#logiciel"}})
        webpage["primaryImageOfPage"] = {"@type": "ImageObject", "url": BASE + OG_IMAGE}

    if p["kind"] == "tv":
        graph.append({"@type": "HowTo", "@id": url + "#installer", "inLanguage": lang,
                      "name": "Installer Prisme TV sur la télé" if lang == "fr" else "Install Prisme TV on the TV",
                      "totalTime": "PT5M",
                      "step": [{"@type": "HowToStep", "position": i + 1, "name": n, "text": t}
                               for i, (n, t) in enumerate(TV_ETAPES[lang])]})

    questions = faq(source)
    if questions:
        webpage["@type"] = ["WebPage", "FAQPage"]
        webpage["mainEntity"] = [{"@type": "Question", "name": q,
                                  "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in questions]
    graph.append(webpage)
    return {"@context": "https://schema.org", "@graph": graph}


def file_of(url):
    """Le fichier qui sert une adresse du site."""
    path = url.lstrip("/")
    return path + "index.html" if path == "" or path.endswith("/") else path


# ---------------------------------------------------------------- les balises

def bloc(p, source):
    lines = ["<!-- seo : écrit par scripts/seo.py — corriger la fiche de la page là-bas, pas ici -->",
             f"<title>{esc(p['title'])}</title>",
             f'<meta name="description" content="{esc(p["description"])}">']
    if not p["index"]:
        lines.append('<meta name="robots" content="noindex">')
    if p["version"] == "adulte":
        lines.append('<meta name="rating" content="adult">')
    if p["index"]:
        url = BASE + p["url"]
        lines.append(f'<link rel="canonical" href="{url}">')
        alt = jumelles(p)
        if len(alt) > 1:
            for lang in sorted(alt):
                lines.append(f'<link rel="alternate" hreflang="{lang}" href="{BASE + alt[lang]["url"]}">')
            defaut = alt.get("en") or alt.get("fr")
            lines.append(f'<link rel="alternate" hreflang="x-default" href="{BASE + defaut["url"]}">')
        lines += [
            f'<meta property="og:type" content="{"article" if p["kind"] == "guide" else "website"}">',
            f'<meta property="og:locale" content="{LOCALES[p["lang"]]}">',
        ]
        for lang in sorted(alt):
            if lang != p["lang"]:
                lines.append(f'<meta property="og:locale:alternate" content="{LOCALES[lang]}">')
        titre_og = p["og_title"] or p["title"]
        lines += [
            '<meta property="og:site_name" content="Prisme">',
            f'<meta property="og:title" content="{esc(titre_og)}">',
            f'<meta property="og:description" content="{esc(p["description"])}">',
            f'<meta property="og:url" content="{url}">',
            f'<meta property="og:image" content="{BASE + OG_IMAGE}">',
            '<meta property="og:image:width" content="1200">',
            '<meta property="og:image:height" content="630">',
            '<meta property="og:image:alt" content="Prisme, le logiciel de tri pour vos vidéos et vos photos">'
            if p["lang"] == "fr" else
            '<meta property="og:image:alt" content="Prisme, the sorting software for your videos and photos">',
            '<meta name="twitter:card" content="summary_large_image">',
            f'<meta name="twitter:title" content="{esc(titre_og)}">',
            f'<meta name="twitter:description" content="{esc(p["description"])}">',
        ]
        data = json.dumps(donnees(p, source), ensure_ascii=False, indent=1)
        lines.append('<script type="application/ld+json">\n' + data.replace("</", "<\\/") + "\n</script>")
    lines.append("<!-- /seo -->")
    return "\n  ".join(lines)


ANCIENNES = [
    r"\s*<!-- seo :.*?<!-- /seo -->",
    r"\s*<title>.*?</title>",
    r'\s*<meta name="(?:description|rating|robots)"[^>]*>',
    r'\s*<link rel="(?:canonical|alternate)"[^>]*>',
    r'\s*<meta (?:property="og:|name="twitter:)[^>]*>',
    r'\s*<script type="application/ld\+json">.*?</script>',
    r"\s*<!-- PROVISOIRE : (?:la )?version neutre.*?-->",
]


def ecrire(p, verifier=False):
    f = ROOT / p["file"]
    source = f.read_text(encoding="utf-8")
    head_end = source.index("</head>")
    head, rest = source[:head_end], source[head_end:]
    for motif in ANCIENNES:
        head = re.sub(motif, "", head, flags=re.S)
    viewport = re.search(r'<meta name="viewport"[^>]*>', head)
    head = head[:viewport.end()] + "\n  " + bloc(p, source) + head[viewport.end():]
    # L'adresse de Prisme TV, écrite en clair sur les pages TV
    rest = re.sub(r"(<span data-tv-host>)[^<]*(</span>)",
                  lambda m: m.group(1) + BASE.split("://")[1].removeprefix("www.") + m.group(2), rest)
    nouveau = head + rest
    if verifier:
        return nouveau != source
    if nouveau != source:
        f.write_text(nouveau, encoding="utf-8", newline="\n")
    return nouveau != source


def sitemap():
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
             'xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for p in PAGES:
        if not p["index"] or not (ROOT / p["file"]).exists():
            continue
        lines.append(f"  <url><loc>{BASE + p['url']}</loc><lastmod>{modifie(p)}</lastmod>")
        alt = jumelles(p)
        if len(alt) > 1:
            for lang in sorted(alt):
                lines.append(f'    <xhtml:link rel="alternate" hreflang="{lang}" href="{BASE + alt[lang]["url"]}"/>')
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def robots():
    return ("User-agent: *\nAllow: /\nDisallow: /api/\n\n"
            f"Sitemap: {BASE}/sitemap.xml\n")


def main():
    verifier = "--verifier" in sys.argv
    manque = [p["file"] for p in PAGES if not (ROOT / p["file"]).exists()]
    for f in manque:
        print("absente :", f)
    changes = [p["file"] for p in PAGES if p["file"] not in manque and ecrire(p, verifier)]
    for nom, contenu in (("sitemap.xml", sitemap()), ("robots.txt", robots())):
        f = ROOT / nom
        if f.read_text(encoding="utf-8") != contenu:
            changes.append(nom)
            if not verifier:
                f.write_text(contenu, encoding="utf-8", newline="\n")
    longs = [(p["file"], len(p["title"]), len(p["description"])) for p in PAGES
             if p["index"] and (len(p["title"]) > 65 or not 70 <= len(p["description"]) <= 165)]
    for f, t, d in longs:
        print(f"longueur à revoir : {f} (titre {t}, description {d})")
    if verifier:
        print("à jour" if not changes else "à régénérer : " + ", ".join(changes))
        sys.exit(1 if changes or manque else 0)
    print(f"{len(changes)} fichier(s) réécrit(s)" + (" : " + ", ".join(changes) if changes else ""))


if __name__ == "__main__":
    main()
