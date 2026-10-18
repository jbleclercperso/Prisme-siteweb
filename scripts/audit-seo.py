"""Audit SEO éditorial et structurel du site statique.

Contrairement à ``seo.py --verifier``, ce contrôle ne régénère rien. Il relit
les fichiers servis et vérifie les relations entre pages : canonique,
hreflang, sitemap, unicité, profondeur des guides et maillage des trois
univers (grand public, adulte FR, adulte EN).
"""
from __future__ import annotations

import html
import importlib.util
import pathlib
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, deque
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://prisme-desktop.com"


def load_manifest():
    spec = importlib.util.spec_from_file_location("prisme_seo", ROOT / "scripts" / "seo.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module.PAGES


class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.attrs = []
        self.links = []
        self.headings = []
        self.ids = []
        self.text = []
        self.title = []
        self._capture_title = False
        self._heading = None
        self._heading_text = []
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        self.attrs.append((tag, values))
        if values.get("id"):
            self.ids.append(values["id"])
        if tag == "a" and values.get("href"):
            self.links.append(values["href"])
        if tag == "title":
            self._capture_title = True
        if re.fullmatch(r"h[1-6]", tag):
            self._heading = tag
            self._heading_text = []
        if tag in ("script", "style", "svg"):
            self._skip += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self._capture_title = False
        if tag == self._heading:
            value = re.sub(r"\s+", " ", "".join(self._heading_text)).strip()
            self.headings.append((tag, value))
            self._heading = None
            self._heading_text = []
        if tag in ("script", "style", "svg") and self._skip:
            self._skip -= 1

    def handle_data(self, data):
        if self._capture_title:
            self.title.append(data)
        if self._heading:
            self._heading_text.append(data)
        if not self._skip:
            self.text.append(data)

    def one(self, tag, **wanted):
        matches = []
        for current, attrs in self.attrs:
            if current != tag:
                continue
            if all(attrs.get(key) == value for key, value in wanted.items()):
                matches.append(attrs)
        return matches


def path_for_url(url):
    path = urlsplit(url).path
    if path == "/":
        return "index.html"
    if path.endswith("/"):
        return path.lstrip("/") + "index.html"
    return path.lstrip("/")


def internal_url(href, current):
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    parts = urlsplit(href)
    if parts.scheme in ("http", "https"):
        if parts.netloc not in ("prisme-desktop.com", "www.prisme-desktop.com"):
            return None
        path = parts.path
    elif parts.scheme or parts.netloc:
        return None
    else:
        path = urlsplit(urljoin(BASE + current, href)).path
    if path == "/index.html":
        path = "/"
    if path.endswith("index.html"):
        path = path[:-10]
    return re.sub(r"//+", "/", path) or "/"


def main():
    manifest = load_manifest()
    problems = []
    docs = {}
    expected = {p["url"]: p for p in manifest if p["index"]}

    for page in manifest:
        target = ROOT / page["file"]
        if not target.is_file():
            problems.append(f"manifeste : fichier absent {page['file']}")
            continue
        source = target.read_text(encoding="utf-8")
        parsed = Document()
        parsed.feed(source)
        docs[page["url"]] = (page, parsed, source)

        if not page["index"]:
            if not parsed.one("meta", name="robots", content="noindex"):
                problems.append(f"{page['file']} : page non indexable sans noindex")
            continue

        titles = " ".join(parsed.title).strip()
        descriptions = parsed.one("meta", name="description")
        canonicals = parsed.one("link", rel="canonical")
        h1s = [text for level, text in parsed.headings if level == "h1"]
        if titles != page["title"]:
            problems.append(f"{page['file']} : title différent du manifeste")
        if not descriptions or descriptions[0].get("content") != page["description"]:
            problems.append(f"{page['file']} : description différente du manifeste")
        if len(canonicals) != 1 or canonicals[0].get("href") != BASE + page["url"]:
            problems.append(f"{page['file']} : canonique absent ou incorrect")
        if len(h1s) != 1:
            problems.append(f"{page['file']} : {len(h1s)} H1")
        if len(parsed.ids) != len(set(parsed.ids)):
            for name, count in Counter(parsed.ids).items():
                if count > 1:
                    problems.append(f"{page['file']} : id dupliqué #{name}")

        html_tag = parsed.one("html")
        if not html_tag or html_tag[0].get("lang") != page["lang"]:
            problems.append(f"{page['file']} : langue HTML incorrecte")

        robots = parsed.one("meta", name="robots")
        if robots and "noindex" in robots[0].get("content", "").lower():
            problems.append(f"{page['file']} : page du sitemap marquée noindex")

        if page["kind"] == "guide":
            main_match = re.search(r"<main\b.*?</main>", source, re.S)
            body = html.unescape(re.sub(r"<[^>]+>", " ", main_match.group(0) if main_match else ""))
            count = len(re.findall(r"\b[\wÀ-ÿ]+\b", body))
            if count < 550:
                problems.append(f"{page['file']} : guide trop court ({count} mots, minimum 550)")
            if not re.search(r'<section class="guide-faq">', source):
                problems.append(f"{page['file']} : guide sans FAQ visible")

        if page["version"] == "adulte":
            if not parsed.one("meta", name="rating", content="adult"):
                problems.append(f"{page['file']} : marquage adulte absent")
            group = [q for q in manifest if q.get("group") == page.get("group") and q["index"]]
            if len(group) > 1:
                alternates = {a.get("hreflang"): a.get("href") for a in parsed.one("link", rel="alternate")}
                for twin in group:
                    if alternates.get(twin["lang"]) != BASE + twin["url"]:
                        problems.append(f"{page['file']} : hreflang {twin['lang']} absent ou incorrect")
                if "x-default" not in alternates:
                    problems.append(f"{page['file']} : hreflang x-default absent")

    # Unicité des signaux principaux sur les pages indexables.
    for label, extractor in (
        ("title", lambda d: " ".join(d.title).strip()),
        ("H1", lambda d: next((text for level, text in d.headings if level == "h1"), "")),
    ):
        values = {}
        for url, (page, parsed, _) in docs.items():
            if page["index"] and page["kind"] not in ("legal", "404", "merci"):
                values.setdefault(extractor(parsed).casefold(), []).append(url)
        for value, urls in values.items():
            if value and len(urls) > 1:
                problems.append(f"{label} dupliqué : {', '.join(urls)}")

    # Sitemap : ni oubli, ni URL parasite, un lastmod ISO pour chaque entrée.
    tree = ET.parse(ROOT / "sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_urls = {}
    for node in tree.findall("s:url", ns):
        loc = node.findtext("s:loc", namespaces=ns)
        lastmod = node.findtext("s:lastmod", namespaces=ns)
        sitemap_urls[loc] = lastmod
        if not lastmod or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", lastmod):
            problems.append(f"sitemap : lastmod invalide pour {loc}")
    expected_sitemap = {BASE + url for url in expected}
    if set(sitemap_urls) != expected_sitemap:
        for url in sorted(expected_sitemap - set(sitemap_urls)):
            problems.append(f"sitemap : URL absente {url}")
        for url in sorted(set(sitemap_urls) - expected_sitemap):
            problems.append(f"sitemap : URL inattendue {url}")

    # Maillage : chaque page indexable doit être atteignable depuis l'accueil
    # de son univers sans franchir la séparation adulte / grand public.
    graphs = {}
    for url, (page, parsed, _) in docs.items():
        if not page["index"]:
            continue
        links = {internal_url(href, url) for href in parsed.links}
        graphs[url] = {link for link in links if link in expected}
    universes = [
        ("grand public", "/", lambda u: not u.startswith(("/adulte/", "/en/adult/"))),
        ("adulte FR", "/adulte/", lambda u: u.startswith("/adulte/")),
        ("adulte EN", "/en/adult/", lambda u: u.startswith("/en/adult/")),
    ]
    for label, start, belongs in universes:
        wanted = {url for url in expected if belongs(url)}
        reached = set()
        queue = deque([start])
        while queue:
            current = queue.popleft()
            if current in reached or current not in wanted:
                continue
            reached.add(current)
            queue.extend(graphs.get(current, set()) - reached)
        for url in sorted(wanted - reached):
            problems.append(f"maillage {label} : page orpheline {url}")

    all_source = "\n".join(source for _, _, source in docs.values())
    if "contact@prisme.app" in all_source:
        problems.append("contact : ancienne adresse contact@prisme.app encore présente")
    if "https://www.prisme.app" in all_source or "https://prisme.app" in all_source:
        problems.append("domaine : ancienne adresse prisme.app encore présente")

    for problem in problems:
        print(problem)
    print(f"Audit SEO : {len(expected)} pages indexables, {len(problems)} problème(s)")
    raise SystemExit(1 if problems else 0)


if __name__ == "__main__":
    main()
