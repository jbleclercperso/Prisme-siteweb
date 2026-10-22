"""Installer les tags Clair dans un site statique existant. Aucun déploiement."""
from pathlib import Path
import argparse
import re

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('root',type=Path)
parser.add_argument('--site',required=True,choices=['conchypro','prisme','pixmedic'])
parser.add_argument('--apply',action='store_true',help='Sans cette option, affiche seulement les modifications prévues.')
a=parser.parse_args()
root=a.root.resolve()
if not (root/'index.html').is_file():
    raise SystemExit('Le dossier doit être la racine du site public contenant index.html.')
loader=(root/'assets/clair.js').read_text()
origin='https://stellar-palmier-858ecb.netlify.app'
tag=f'<script defer src="/assets/clair.js" data-site="{a.site}"></script>'
changes={}
for path in sorted(root.rglob('*.html')):
    if any(x in path.relative_to(root).parts for x in ['node_modules','.git','.netlify','archive','archives']):
        continue
    s=path.read_text(encoding='utf-8')
    if 'src="/assets/clair.js"' in s:
        continue
    matches=list(re.finditer(r'</head\s*>',s,re.I))
    if len(matches)!=1:
        raise SystemExit(f'En-tête HTML absent ou ambigu : {path}')
    end=matches[0].start()
    changes[path]=s[:end]+tag+'\n'+s[end:]
changes[root/'assets/clair.js']=loader
config=root/'netlify.toml'
if config.exists():
    s=config.read_text()
    def allow(match):
        directive=match.group(0)
        return directive if origin in directive else directive+' '+origin
    updated=re.sub(r'(?:script-src|connect-src)\s+[^;"\n]+',allow,s)
    if updated!=s:
        changes[config]=updated
for path,content in changes.items():
    print(('ÉCRIRE ' if a.apply else 'PRÉVU ')+str(path.relative_to(root)))
    if a.apply:
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(content,encoding='utf-8')
print(f'{len(changes)} fichiers. Aucun fichier publié sur Netlify.')
