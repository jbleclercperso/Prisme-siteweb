"""Vérifie tout le site avant un envoi :  python scripts/verifier.py

- chaque lien interne mène à un fichier qui existe (ou à une redirection
  déclarée dans netlify.toml), ancres comprises ;
- chaque page a un titre, une description, un seul H1, des images avec alt ;
- les données structurées (JSON-LD) se lisent, et leurs types sont connus ;
- une page de la version neutre ne lie jamais la version adulte, et n'en
  emploie pas le vocabulaire ;
- les balises de scripts/seo.py sont à jour ;
- chaque page porte la mesure d'audience (scripts/umami.py).

Rend 1 et liste les problèmes s'il y en a ; 0 sinon.
"""
from __future__ import annotations

import html
import json
import pathlib
import re
import subprocess
import sys
import tomllib
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
ADULTE = ("adulte/", "en/adult/")
# Les mots qu'une page grand public ne doit pas porter.
MOTS_ADULTES = re.compile(r"\b(porn\w*|x{2,3}|sexe?|sexy|nsfw|érotique|adultes?|adult)\b", re.I)
TYPES = {"Organization", "WebSite", "WebPage", "FAQPage", "SoftwareApplication", "BreadcrumbList",
         "ListItem", "TechArticle", "Article", "HowTo", "HowToStep", "Question", "Answer", "Offer",
         "AggregateOffer", "ImageObject", "CollectionPage", "ItemList"}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.ids, self.imgs, self.h1 = [], set(), [], 0
        self.ld, self._ld, self._in_ld = [], [], False
        self.text, self._skip = [], 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])
        if tag in ("link", "script", "img", "form") and (a.get("href") or a.get("src") or a.get("action")):
            if tag == "link" and a.get("rel") in ("canonical", "alternate"):
                pass
            else:
                self.links.append(a.get("href") or a.get("src") or a.get("action"))
        if tag == "img":
            self.imgs.append(a)
        if tag == "h1":
            self.h1 += 1
        if tag == "script" and a.get("type") == "application/ld+json":
            self._in_ld, self._ld = True, []
        if tag in ("script", "style", "svg"):
            self._skip += 1

    def handle_endtag(self, tag):
        if tag == "script" and self._in_ld:
            self.ld.append("".join(self._ld))
            self._in_ld = False
        if tag in ("script", "style", "svg") and self._skip:
            self._skip -= 1

    def handle_data(self, data):
        if self._in_ld:
            self._ld.append(data)
        elif not self._skip:
            self.text.append(data)


def redirections():
    conf = tomllib.loads((ROOT / "netlify.toml").read_text(encoding="utf-8"))
    return [(r["from"], r.get("status", 301)) for r in conf.get("redirects", [])]


def existe(chemin, redirs):
    """Le fichier qui sert cette adresse existe-t-il ?"""
    if chemin.endswith("/"):
        cible = ROOT / chemin.lstrip("/") / "index.html"
    else:
        cible = ROOT / chemin.lstrip("/")
    if cible.is_file():
        return cible
    if (ROOT / (chemin.lstrip("/") + ".html")).is_file():
        return ROOT / (chemin.lstrip("/") + ".html")
    if (ROOT / chemin.lstrip("/") / "index.html").is_file():
        return ROOT / chemin.lstrip("/") / "index.html"
    for frm, status in redirs:
        if status != 404 and (frm == chemin or (frm.endswith("*") and chemin.startswith(frm[:-1]))):
            return True
    return None


def types(node, out):
    if isinstance(node, dict):
        t = node.get("@type")
        for x in (t if isinstance(t, list) else [t] if t else []):
            out.add(x)
        for v in node.values():
            types(v, out)
    elif isinstance(node, list):
        for v in node:
            types(v, out)


def main():
    redirs = redirections()
    pages = sorted(p for p in ROOT.rglob("*.html")
                   if not any(part in ("node_modules", ".git", "docs") for part in p.parts))
    problemes = []
    analyses = {}
    for f in pages:
        rel = f.relative_to(ROOT).as_posix()
        src = f.read_text(encoding="utf-8")
        p = Page()
        p.feed(src)
        analyses[rel] = (p, src)

    for rel, (p, src) in analyses.items():
        dossier = "/" + rel.rsplit("/", 1)[0] + "/" if "/" in rel else "/"
        neutre = not rel.startswith(ADULTE)
        noindex = 'name="robots" content="noindex"' in src
        if not re.search(r"<title>[^<]+</title>", src):
            problemes.append(f"{rel} : pas de titre")
        if 'name="description"' not in src:
            problemes.append(f"{rel} : pas de description")
        if "cloud.umami.is/script.js" not in src:
            problemes.append(f"{rel} : pas de mesure d'audience (python scripts/umami.py)")
        # merci.html montre un H1 par état du paiement (un seul visible) : page non indexée.
        if p.h1 != 1 and not noindex:
            problemes.append(f"{rel} : {p.h1} H1")
        for img in p.imgs:
            if "alt" not in img:
                problemes.append(f"{rel} : image sans alt ({img.get('src')})")
        for brut in p.ld:
            try:
                data = json.loads(brut)
            except json.JSONDecodeError as e:
                problemes.append(f"{rel} : JSON-LD illisible ({e})")
                continue
            vus = set()
            types(data, vus)
            for t in vus - TYPES:
                problemes.append(f"{rel} : type schema.org inattendu « {t} »")
        for lien in p.links:
            if re.match(r"^(https?:|mailto:|tel:|data:|javascript:)", lien):
                continue
            chemin, _, ancre = lien.partition("#")
            chemin = chemin.split("?")[0]
            if not chemin:
                if ancre and ancre not in p.ids and ancre != "top":
                    problemes.append(f"{rel} : ancre #{ancre} absente")
                continue
            absolu = chemin if chemin.startswith("/") else dossier + chemin
            absolu = re.sub(r"/\./", "/", absolu)
            while "/../" in absolu:
                absolu = re.sub(r"/[^/]+/\.\./", "/", absolu, count=1)
            cible = existe(absolu, redirs)
            if not cible:
                problemes.append(f"{rel} : lien mort {lien}")
                continue
            if neutre and absolu.startswith(("/adulte/", "/en/adult/")):
                problemes.append(f"{rel} : la page neutre lie la version adulte ({lien})")
            if ancre and isinstance(cible, pathlib.Path):
                autre = analyses.get(cible.relative_to(ROOT).as_posix())
                if autre and ancre not in autre[0].ids and ancre != "top":
                    problemes.append(f"{rel} : ancre #{ancre} absente de {cible.relative_to(ROOT).as_posix()}")
        if neutre:
            texte = html.unescape(" ".join(p.text))
            for m in set(MOTS_ADULTES.findall(texte)):
                problemes.append(f"{rel} : mot de la version adulte dans une page neutre « {m} »")
            if 'content="adult"' in src:
                problemes.append(f"{rel} : marquage adulte sur une page neutre")

    seo = subprocess.run([sys.executable, str(ROOT / "scripts" / "seo.py"), "--verifier"],
                         capture_output=True, text=True, encoding="utf-8", errors="replace")
    if seo.returncode:
        details = (seo.stdout + "\n" + seo.stderr).strip().splitlines()
        problemes.append("scripts/seo.py : " + (details[-1] if details else "échec sans message"))

    for x in problemes:
        print(x)
    print(f"{len(analyses)} pages vérifiées, {len(problemes)} problème(s)")
    sys.exit(1 if problemes else 0)


if __name__ == "__main__":
    main()
