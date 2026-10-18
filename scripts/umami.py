"""Mesure d'audience Umami sur toutes les pages :  python scripts/umami.py

Umami Cloud, sans cookie et anonyme (pas de bandeau), sur le même compte que
conchypro.com : les visites sont comptées par Umami, le petit script qui suit
compte les clics sur les boutons, sous le texte du bouton. Ne compte que sur
prisme-desktop.com (pas les aperçus Netlify ni le PC). Pour ne pas se compter
soi-même : ouvrir une fois prisme-desktop.com/?pasmoi sur chaque appareil
(et ?moi pour annuler).

À relancer après avoir ajouté une page (scripts/verifier.py le rappelle).
Le Content-Security-Policy de netlify.toml autorise cloud.umami.is et
gateway.umami.is ; la page Confidentialité le dit.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MARQUE = 'data-website-id="fa7edb23-d767-44d3-a035-756fc46c8453"'
BLOC = (
    '<script defer src="https://cloud.umami.is/script.js" ' + MARQUE
    + ' data-domains="prisme-desktop.com,www.prisme-desktop.com"></script>\n  '
    '<script>(function(){try{var q=location.search;'
    'if(/[?&]pasmoi\\b/.test(q))localStorage.setItem("umami.disabled","1");'
    'if(/[?&]moi\\b/.test(q))localStorage.removeItem("umami.disabled")}catch(e){}'
    'document.addEventListener("click",function(e){'
    'var el=e.target.closest&&e.target.closest("a.btn,button");if(!el||!window.umami)return;'
    'var t=(el.getAttribute("aria-label")||el.textContent||"").replace(/\\s+/g," ").trim().slice(0,50);'
    'if(!t)return;window.umami.track("Clic : "+t,{page:location.pathname})},true)})();</script>\n'
)


def pages():
    return sorted(f for f in ROOT.rglob("*.html") if "node_modules" not in f.parts)


def main():
    poses = 0
    for f in pages():
        src = f.read_text(encoding="utf-8")
        if MARQUE in src or "</head>" not in src:
            continue
        f.write_text(src.replace("</head>", "  " + BLOC + "</head>", 1), encoding="utf-8", newline="\n")
        poses += 1
    print(f"mesure d'audience posée sur {poses} page(s)")


if __name__ == "__main__":
    main()
