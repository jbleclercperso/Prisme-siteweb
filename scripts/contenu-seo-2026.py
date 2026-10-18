"""Génère les guides SEO ajoutés en octobre 2026.

Les textes restent ici comme source éditoriale relisible. Le script part des
gabarits existants, remplace uniquement l'article, puis ``gabarit.py`` pose le
maillage interne et ``seo.py`` produit les métadonnées et les données JSON-LD.

    python scripts/contenu-seo-2026.py
    python scripts/gabarit.py
    python scripts/seo.py
"""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent


PUBLIC_RESEARCH = {
    "trier-grand-dossier-videos": {
        "crumb": "Trier un grand dossier de vidéos",
        "h1": "Comment trier un grand dossier de vidéos sans y passer des semaines",
        "lead": "Un dossier de 500, 5 000 ou 50 000 vidéos ne se range pas fichier par fichier dans l'Explorateur. La bonne méthode consiste à réduire le nombre de décisions, travailler par passes et garder une structure assez simple pour tenir dans le temps.",
        "brief": "Créez d'abord cinq à huit destinations utiles, faites une première passe uniquement pour garder, supprimer ou écarter, puis affinez les fichiers conservés. Le gain vient moins d'une arborescence parfaite que d'un enchaînement sans interruption : voir, décider, ranger, passer à la suivante.",
        "sections": [
            ("Pourquoi le tri bloque sur un gros volume", """
      <p>Le problème n'est généralement pas de savoir où ranger une vidéo. C'est le coût de chaque décision : ouvrir le fichier, attendre que le lecteur démarre, avancer dans la timeline, fermer la fenêtre, retrouver le fichier et le déplacer. Répété mille fois, ce rituel transforme une soirée de tri en chantier interminable.</p>
      <p>Les noms sont rarement fiables. <code>VID_20240218_173812.mp4</code> ne dit rien, et une miniature prise à la première seconde peut montrer un écran noir. Avant de décider, il faut pouvoir parcourir plusieurs moments de la vidéo. C'est cette étape, plus que le déplacement lui-même, qu'il faut accélérer.</p>"""),
            ("La méthode en trois passes", """
      <h3>1. Éliminer sans classer</h3>
      <p>Commencez par les décisions évidentes : à supprimer, à garder, à revoir. Ne créez pas vingt catégories. Cette passe retire les fichiers ratés, inutiles ou manifestement en double et réduit le volume avant le classement fin.</p>
      <h3>2. Ranger par destination réelle</h3>
      <p>Choisissez des dossiers qui correspondent à votre usage : famille, voyages, travail, projets, à monter, archives. Une vidéo doit avoir une destination évidente. Si vous hésitez souvent entre deux dossiers, ils sont probablement trop proches et peuvent être fusionnés.</p>
      <h3>3. Nettoyer les exceptions</h3>
      <p>À la fin seulement, traitez les noms incohérents, les dates fausses, les vidéos corrompues et les doublons moins visibles. Vous évitez ainsi de passer dix minutes sur un fichier qui aurait été supprimé lors de la première passe.</p>"""),
            ("Un flux de travail qui reste rapide", """
      <ul>
        <li><strong>Travaillez par sessions courtes</strong> : un lot de 100 fichiers terminé vaut mieux qu'un classement idéal abandonné à mi-chemin.</li>
        <li><strong>Utilisez le clavier</strong> : une touche par destination supprime les allers-retours entre lecteur et Explorateur.</li>
        <li><strong>Conservez une file “à revoir”</strong> : l'hésitation ne doit pas bloquer tout le lot.</li>
        <li><strong>Déplacez réellement les fichiers</strong> si vous voulez que le rangement reste compréhensible dans l'Explorateur, sur un NAS et dans vos sauvegardes.</li>
        <li><strong>Gardez une copie de sécurité</strong> avant une grosse réorganisation, puis vérifiez quelques dossiers au hasard avant d'effacer l'ancienne copie.</li>
      </ul>"""),
            ("Ce que Prisme change dans ce travail", """
      <p>Prisme affiche les vidéos d'un ou plusieurs dossiers, y compris sur un disque externe ou un NAS. Le survol fait défiler des extraits pris dans la vidéo ; le lecteur intégré reprend instantanément si un aperçu ne suffit pas. Vous associez jusqu'à 29 destinations à des touches : une pression déplace le fichier, et le suivant s'affiche.</p>
      <p>L'historique permet d'annuler jusqu'à 200 actions. Le mode doublons regroupe aussi la même vidéo lorsqu'elle a été réencodée ou renommée, puis place la meilleure version en tête. Le diagnostic des fichiers abîmés, le lecteur flottant et le Mur de plusieurs vidéos servent ensuite à traiter les exceptions sans changer d'outil.</p>
      <div class="limites"><b class="limites-titre">À décider avant de commencer</b><ul><li>Prisme déplace réellement les fichiers : vérifiez les dossiers de destination et la sauvegarde.</li><li>Une bonne arborescence reste volontairement courte ; les mots-clés et favoris complètent les dossiers sans les multiplier.</li><li>Le logiciel fonctionne sur Windows 10 et 11.</li></ul></div>"""),
        ],
        "cta_title": "Commencer par un lot, pas par toute la bibliothèque",
        "cta_text": "L'essai de 14 jours donne accès à toutes les fonctions, sans carte bancaire. Testez d'abord la méthode sur une copie d'un petit dossier.",
        "faq": [
            ("Combien de dossiers faut-il créer pour trier ses vidéos ?", "Commencez avec cinq à huit destinations qui correspondent à des usages réels. Vous pourrez les préciser après la première passe. Trop de catégories ralentissent chaque décision et finissent souvent par se chevaucher."),
            ("Comment trier des vidéos dont le nom ne veut rien dire ?", "Utilisez des aperçus pris à plusieurs moments du fichier plutôt que la seule vignette du début. Dans Prisme, le survol montre le contenu et le lecteur intégré permet de vérifier immédiatement."),
            ("Peut-on annuler un mauvais déplacement ?", "Oui dans Prisme : l'historique conserve jusqu'à 200 actions de tri. Pour une réorganisation importante, gardez malgré tout une sauvegarde indépendante."),
            ("Faut-il renommer les vidéos avant de les ranger ?", "Non. Triez d'abord, puis renommez les fichiers conservés si le nom vous aide réellement. Renommer tout le lot avant la première passe fait perdre du temps sur des fichiers qui seront peut-être supprimés."),
        ],
    },
    "organiser-videos-telechargees": {
        "crumb": "Organiser ses vidéos téléchargées",
        "h1": "Organiser ses vidéos téléchargées sur Windows : une méthode durable",
        "lead": "Cours achetés, exports de plateformes, conférences, rushes reçus ou vidéos libres : les téléchargements s'accumulent vite sous des noms opaques. Voici une méthode pour transformer ce dossier provisoire en vidéothèque locale claire, sans dépendre d'un service en ligne.",
        "brief": "Séparez l'arrivée du classement : un dossier “À trier” reçoit les nouveaux fichiers, des dossiers stables décrivent leur usage, et une passe régulière déplace, dédoublonne puis sauvegarde. N'organisez que des fichiers que vous avez le droit de conserver ; le classement ne change pas les droits attachés au contenu.",
        "sections": [
            ("1. Garder une zone d'arrivée unique", """
      <p>Laissez le navigateur et les applications télécharger dans un dossier d'arrivée. Ce dossier n'est pas votre bibliothèque : c'est une boîte de réception. Un fichier y reste tant qu'il n'a pas été vérifié, renommé si nécessaire et déplacé vers sa destination définitive.</p>
      <p>Cette séparation évite les dossiers “Downloads”, “Downloads (1)” et “Nouveau dossier (3)” dispersés sur plusieurs disques. Elle permet aussi de sauvegarder la bibliothèque sans copier les fichiers temporaires ou incomplets.</p>"""),
            ("2. Choisir une arborescence qui décrit l'usage", """
      <p>Une structure robuste répond à la question “où irai-je chercher cette vidéo ?”. Pour des cours : thème, puis formation. Pour des conférences : événement, puis année. Pour des projets : client ou projet, puis sources, exports et archives. Évitez de répéter dans les dossiers une information déjà portée par la date ou le nom.</p>
      <div class="tableau"><table><tr><th>Besoin</th><th>Structure utile</th><th>À éviter</th></tr><tr><td>Retrouver par sujet</td><td>Sujet / série</td><td>Un dossier par fichier</td></tr><tr><td>Suivre un projet</td><td>Projet / sources / exports</td><td>Mélanger versions de travail et finales</td></tr><tr><td>Archiver</td><td>Année / événement</td><td>Dix niveaux de sous-dossiers</td></tr><tr><td>Regarder sur plusieurs appareils</td><td>Bibliothèque stable sur PC ou NAS</td><td>Chemins qui changent chaque semaine</td></tr></table></div>"""),
            ("3. Nettoyer les noms et les doublons au bon moment", """
      <p>Un bon nom aide quand il porte une information absente du dossier : titre, épisode, intervenant, date ou version. Conservez l'extension et utilisez un modèle simple. Faites ce nettoyage après le premier tri, sur les fichiers que vous gardez.</p>
      <p>Les copies exactes sont faciles à repérer par leur empreinte. Les doublons visuels sont plus difficiles : une même vidéo peut exister en 720p et 1080p, avoir été recadrée ou réencodée. Comparez durée, dimensions, débit et qualité avant de supprimer. Gardez la meilleure version, pas forcément le fichier le plus lourd.</p>"""),
            ("4. Mettre en place une routine de cinq minutes", """
      <ul><li>Une fois par semaine, ouvrez le dossier d'arrivée.</li><li>Supprimez les téléchargements incomplets et les copies manifestes.</li><li>Prévisualisez, décidez, puis déplacez chaque fichier dans sa destination.</li><li>Contrôlez que la sauvegarde a bien repris les nouveaux dossiers.</li><li>Chaque mois, traitez le dossier “à revoir” au lieu de créer un second purgatoire.</li></ul>
      <p>Prisme rassemble ces étapes dans une fenêtre : aperçus au survol, lecture immédiate, destinations au clavier, doublons exacts ou réencodés, plusieurs racines et NAS. Il ne télécharge aucun contenu et ne modifie aucun droit : il organise uniquement les fichiers déjà présents sur votre machine.</p>"""),
        ],
        "cta_title": "Vider le dossier Téléchargements sans perdre le fil",
        "cta_text": "Essayez Prisme pendant 14 jours sur une copie de votre dossier d'arrivée. Aucun compte et aucune carte bancaire ne sont nécessaires.",
        "faq": [
            ("Quel est le meilleur classement pour des vidéos téléchargées ?", "Celui qui correspond à la façon dont vous les recherchez : par sujet, projet, série ou événement. Gardez peu de niveaux et une zone d'arrivée distincte de la bibliothèque définitive."),
            ("Comment repérer deux versions de la même vidéo ?", "Une empreinte détecte les copies exactes. Pour deux encodages différents, il faut comparer le contenu visuel ainsi que la durée, la résolution et le débit. Prisme regroupe ces variantes et présente la meilleure version en premier."),
            ("Est-il légal de conserver une vidéo téléchargée ?", "Cela dépend de sa source, de la licence et des conditions du service. Organiser un fichier ne vous donne aucun droit supplémentaire. Conservez uniquement les contenus que vous avez le droit de télécharger et d'archiver."),
            ("Faut-il utiliser un NAS ?", "Pas obligatoirement. Un NAS devient utile lorsque plusieurs appareils doivent accéder à la même bibliothèque ou lorsque le volume dépasse le stockage du PC. Il ne remplace pas une sauvegarde séparée."),
        ],
    },
    "alternative-videocull": {
        "crumb": "VideoCull ou Prisme",
        "h1": "VideoCull ou Prisme : deux façons de trier une grande collection de vidéos",
        "lead": "VideoCull et Prisme partent du même constat : ouvrir chaque vidéo une par une dans l'Explorateur est trop lent. Les deux applications Windows montrent plusieurs moments du fichier et accélèrent la décision, mais elles ne visent pas exactement la même étape du travail.",
        "brief": "Choisissez VideoCull si vous voulez un outil gratuit et open source centré sur l'écrémage d'un lot avec des décisions simples. Choisissez Prisme si vous voulez transformer ce tri en bibliothèque durable : destinations au clavier, photos et vidéos, plusieurs disques ou NAS, doublons réencodés, recherche, lecture et accès TV.",
        "sections": [
            ("Ce que propose VideoCull", """
      <p><a href="https://videocull.app/" rel="nofollow noopener">VideoCull</a> est une application Windows gratuite et open source. Elle extrait plusieurs images de chaque vidéo afin d'en voir rapidement le contenu, puis propose un flux garder, supprimer ou passer. Le projet indique aussi détecter les doublons exacts et visuels.</p>
      <p>Son intérêt est clair : prendre rapidement une décision sur un dossier de rushes ou un lot à nettoyer. L'interface reste focalisée sur cette opération, ce qui convient bien à un besoin ponctuel et à ceux qui veulent un outil libre.</p>"""),
            ("Ce que Prisme ajoute", """
      <p>Prisme reprend l'idée du tri visuel, mais l'inscrit dans la gestion quotidienne d'une bibliothèque. Les dossiers de destination reçoivent des touches ; une décision déplace le fichier et affiche immédiatement le suivant. Les mêmes outils fonctionnent pour les photos et les vidéos, dans plusieurs racines locales, disques externes ou dossiers réseau.</p>
      <p>Après le tri, la bibliothèque reste dans Prisme : recherche par noms et mots-clés, favoris, aperçus au survol, Mur de deux à dix médias, lecteur flottant, diagnostic et réparation de vidéos, accès depuis le téléphone et application TV. Les fichiers restent de vrais fichiers dans de vrais dossiers.</p>"""),
            ("Comparatif rapide", """
      <div class="tableau"><table><tr><th>Critère</th><th>VideoCull</th><th>Prisme</th></tr><tr><td>Usage principal</td><td>Écrémer un lot vidéo</td><td>Trier puis gérer une bibliothèque</td></tr><tr><td>Décisions</td><td>Garder, supprimer, passer</td><td>Jusqu'à 29 dossiers associés au clavier</td></tr><tr><td>Photos</td><td>Non annoncé</td><td>Oui</td></tr><tr><td>Doublons</td><td>Exacts et visuels selon le projet</td><td>Exacts et autres encodages, meilleure version en tête</td></tr><tr><td>NAS et plusieurs racines</td><td>Non mis en avant</td><td>Oui</td></tr><tr><td>Bibliothèque, recherche, lecture</td><td>Fonctions de tri</td><td>Oui, dans la même application</td></tr><tr><td>Licence et prix</td><td>Gratuit, open source</td><td>Propriétaire, essai puis abonnement ou achat définitif</td></tr><tr><td>Système</td><td>Windows</td><td>Windows 10 et 11</td></tr></table></div>"""),
            ("Le bon choix selon votre situation", """
      <ul><li><strong>Un lot ponctuel à réduire</strong> : commencez par VideoCull. Le coût est nul et son flux simple répond directement au besoin.</li><li><strong>Plusieurs destinations précises</strong> : Prisme évite de refaire des déplacements dans l'Explorateur après le tri.</li><li><strong>Photos et vidéos mélangées</strong> : Prisme applique la même méthode aux deux.</li><li><strong>Une bibliothèque à regarder ensuite</strong> : Prisme ajoute recherche, lecture, Wall, téléphone et TV.</li><li><strong>Priorité absolue au logiciel libre</strong> : VideoCull est le choix cohérent ; Prisme ne prétend pas l'être.</li></ul>
      <div class="limites"><b class="limites-titre">Comparatif vérifiable</b><p>Les fonctions de VideoCull décrites ici proviennent de son site et de son dépôt publics consultés en octobre 2026. Les projets évoluent : vérifiez sa documentation avant de choisir. Prisme ne prétend pas remplacer un outil gratuit pour tout le monde.</p></div>"""),
        ],
        "cta_title": "Tester le flux qui correspond à votre bibliothèque",
        "cta_text": "Prisme s'essaie 14 jours avec toutes ses fonctions, sans carte bancaire. Testez les deux outils sur la copie d'un même petit lot.",
        "faq": [
            ("VideoCull est-il gratuit ?", "Oui. Le projet se présente comme gratuit et open source. Consultez son site ou son dépôt pour vérifier la licence et la version disponibles au moment du téléchargement."),
            ("Quelle est la principale différence entre VideoCull et Prisme ?", "VideoCull est centré sur l'écrémage d'un lot vidéo. Prisme ajoute le rangement vers de nombreux dossiers et la gestion continue d'une bibliothèque de photos et vidéos."),
            ("Les deux détectent-ils les doublons ?", "VideoCull annonce la détection de doublons exacts et visuels. Prisme regroupe les copies exactes et les variantes réencodées, puis aide à choisir la meilleure version."),
            ("Peut-on essayer les deux sans risque ?", "Oui, sur une copie d'un petit dossier. Vérifiez toujours ce que fait l'action supprimer et gardez une sauvegarde avant tout tri de masse."),
        ],
    },
    "alternative-video-hub-app": {
        "crumb": "Video Hub App ou Prisme",
        "h1": "Video Hub App ou Prisme : quel organisateur vidéo choisir ?",
        "lead": "Video Hub App et Prisme transforment des dossiers de vidéos en bibliothèque visuelle locale. Le premier mise sur un catalogue riche en captures, tags et filtres sur Windows, macOS et Linux ; le second ajoute un flux de tri physique très rapide et plusieurs outils pour gérer les fichiers sous Windows.",
        "brief": "Choisissez Video Hub App si vous voulez surtout créer une galerie vidéo multiplateforme, annoter les fichiers et les retrouver par tags. Choisissez Prisme si votre priorité est de répartir rapidement un gros stock dans de vrais dossiers, puis de conserver recherche, doublons, lecture et accès réseau dans la même application.",
        "sections": [
            ("Ce que Video Hub App fait particulièrement bien", """
      <p><a href="https://videohubapp.com/en/" rel="nofollow noopener">Video Hub App</a> se présente comme un « YouTube pour les vidéos de votre ordinateur ». Il crée un hub à partir d'un ou plusieurs dossiers, génère des captures et permet de parcourir les fichiers sous forme de vignettes, pellicules ou planches de captures. Le survol, les filtres et l'ouverture à l'instant correspondant à une image facilitent l'exploration d'une collection.</p>
      <p>Le logiciel gère les tags, les étoiles, les descriptions, le renommage, les listes de lecture et plusieurs critères de recherche. Il fonctionne sur Windows, macOS et Linux. C'est un avantage net pour une bibliothèque consultée depuis plusieurs systèmes ou pour un utilisateur qui veut enrichir le catalogue sans nécessairement changer son arborescence.</p>"""),
            ("Ce que Prisme privilégie", """
      <p>Prisme est centré sur la décision répétée. Vous associez jusqu'à 29 dossiers à des touches, voyez plusieurs moments d'une vidéo, puis déplacez le fichier en une pression ; le suivant s'affiche immédiatement. Le résultat n'existe pas seulement dans une base : les fichiers sont réellement rangés dans des dossiers lisibles par l'Explorateur, une sauvegarde ou un autre logiciel.</p>
      <p>Une fois la première passe terminée, Prisme conserve une bibliothèque locale réunissant vidéos et photos, dossiers du PC, disques externes et partages NAS. Il ajoute la détection des copies exactes et des vidéos réencodées, le Mur de deux à dix médias, un lecteur flottant, le diagnostic de fichiers abîmés et un accès local depuis un navigateur ou une application TV.</p>"""),
            ("Comparatif des deux approches", """
      <div class="tableau"><table><tr><th>Critère</th><th>Video Hub App</th><th>Prisme</th></tr><tr><td>Systèmes</td><td>Windows, macOS et Linux</td><td>Windows 10 et 11</td></tr><tr><td>Vue du contenu</td><td>Vignettes, pellicules et captures</td><td>Aperçus au survol et lecteur immédiat</td></tr><tr><td>Organisation</td><td>Tags, étoiles, descriptions, hubs</td><td>Dossiers au clavier, favoris et mots-clés</td></tr><tr><td>Tri physique en série</td><td>Pas le flux principal</td><td>Jusqu'à 29 destinations</td></tr><tr><td>Doublons</td><td>Fonction annoncée</td><td>Copies exactes et variantes réencodées</td></tr><tr><td>Photos</td><td>Produit centré sur la vidéo</td><td>Photos et vidéos séparées dans l'interface</td></tr><tr><td>Réseau</td><td>Dossiers réseau ; télécommande locale</td><td>NAS, navigateur local et application TV</td></tr></table></div>
      <p>Le meilleur choix dépend donc moins du nombre de fonctions que du travail à accomplir. Une galerie très personnalisable et multiplateforme favorise Video Hub App. Une boîte de réception de milliers de fichiers à répartir favorise Prisme.</p>"""),
            ("Trois cas concrets pour décider", """
      <ul><li><strong>Vous cataloguez sans déplacer</strong> : Video Hub App offre des vues et des champs riches pour documenter la collection.</li><li><strong>Vous devez vider un grand dossier en vrac</strong> : les destinations au clavier de Prisme évitent les déplacements manuels après chaque décision.</li><li><strong>Vous utilisez un Mac ou Linux</strong> : Video Hub App est compatible ; Prisme ne l'est pas encore.</li><li><strong>Vous mélangez photos et vidéos</strong> : Prisme applique le même flux de tri aux deux types, avec des espaces distincts.</li><li><strong>Vous avez besoin d'un catalogue très détaillé</strong> : testez la profondeur des tags et filtres de Video Hub App avant de choisir.</li></ul>
      <div class="limites"><b class="limites-titre">Comparaison datée et vérifiable</b><p>Les fonctions de Video Hub App ci-dessus viennent de son site et de son guide officiel consultés en octobre 2026. Une version peut évoluer : vérifiez les fonctions, la licence et la compatibilité actuelles avant d'installer. Testez tout déplacement ou suppression sur une copie.</p></div>"""),
        ],
        "cta_title": "Comparer les deux méthodes sur le même dossier",
        "cta_text": "Essayez Prisme pendant 14 jours, sans carte bancaire, sur la copie d'un petit lot. Mesurez surtout le nombre de gestes nécessaires pour votre tâche réelle.",
        "faq": [
            ("Video Hub App fonctionne-t-il sur Mac et Linux ?", "Oui, son site officiel annonce Windows, macOS et Linux. Prisme est actuellement limité à Windows 10 et 11."),
            ("Video Hub App déplace-t-il les vidéos comme Prisme ?", "Il propose notamment renommage, tags et gestion du catalogue. Prisme met explicitement le déplacement en série vers des dossiers associés au clavier au centre de son flux."),
            ("Lequel convient le mieux à une vidéothèque sur NAS ?", "Les deux peuvent travailler avec des dossiers réseau. Prisme met en avant plusieurs racines et le tri physique sur NAS ; Video Hub App accepte les dossiers réseau dans un hub. Testez la vitesse sur votre propre réseau."),
            ("Peut-on utiliser Video Hub App et Prisme ensemble ?", "Oui. Un classement dans de vrais dossiers reste indexable par Video Hub App. Fermez ou rescanez le catalogue après un déplacement massif pour éviter des chemins obsolètes."),
        ],
    },
    "alternative-fast-video-cataloger": {
        "crumb": "Fast Video Cataloger ou Prisme",
        "h1": "Fast Video Cataloger ou Prisme : catalogue professionnel ou tri quotidien ?",
        "lead": "Fast Video Cataloger et Prisme indexent de grandes collections locales sous Windows, mais leur centre de gravité diffère. Fast Video Cataloger vise la recherche détaillée de plans et le travail d'équipe ; Prisme privilégie le rangement rapide d'une collection personnelle dans des dossiers durables.",
        "brief": "Choisissez Fast Video Cataloger pour cataloguer des rushes, transcrire la parole, enrichir les métadonnées, travailler à plusieurs ou retrouver un plan sur un disque déconnecté. Choisissez Prisme pour décider vite du sort de chaque photo ou vidéo, déplacer les fichiers au clavier et disposer d'outils de visionnage personnels plus directs.",
        "sections": [
            ("Le terrain de Fast Video Cataloger", """
      <p><a href="https://videocataloger.com/features/" rel="nofollow noopener">Fast Video Cataloger</a> est un catalogue vidéo Windows orienté archives et production. Il extrait une chronologie de vignettes, permet de rechercher des vidéos ou des scènes par mots-clés et métadonnées et, dans sa version actuelle, annonce transcription locale, détection de visages, classification de scènes et d'objets. Un clic sur une vignette ou une phrase ouvre la vidéo au bon instant.</p>
      <p>Le catalogue peut décrire des supports momentanément déconnectés : utile pour savoir sur quel disque d'archives se trouve un plan avant de le brancher. Les champs personnalisés, les scripts C#, le serveur et les comptes utilisateurs répondent aux équipes, documentalistes et vidéastes qui ont besoin d'un véritable système de gestion de contenus.</p>"""),
            ("Le terrain de Prisme", """
      <p>Prisme s'adresse d'abord à la personne qui a trop de fichiers devant elle. Une vidéo se prévisualise au survol, un dossier de destination reçoit une touche, et chaque pression range le fichier avant d'afficher le suivant. Ce flux traite aussi les photos et ne demande pas de construire une taxonomie professionnelle avant de commencer.</p>
      <p>La bibliothèque reste locale et s'appuie sur les dossiers existants du PC, des disques et du NAS. Prisme ajoute favoris, recherche tolérante, mots-clés tirés des noms, comparaison de doublons exacts ou réencodés, Mur multividéo, lecteur flottant et réparation de certains fichiers. Il vise l'usage individuel, pas la gestion des droits d'une équipe de production.</p>"""),
            ("Comparatif fonctionnel", """
      <div class="tableau"><table><tr><th>Besoin</th><th>Fast Video Cataloger</th><th>Prisme</th></tr><tr><td>Public principal</td><td>Créateurs, archives et équipes</td><td>Collections personnelles</td></tr><tr><td>Recherche dans la parole</td><td>Transcription annoncée</td><td>Non</td></tr><tr><td>Métadonnées</td><td>Riches, personnalisables, par vidéo ou scène</td><td>Mots-clés et informations de fichier</td></tr><tr><td>Supports déconnectés</td><td>Catalogue consultable hors connexion au disque</td><td>Racine attendue pour ouvrir le média</td></tr><tr><td>Collaboration</td><td>Serveur, comptes et client web</td><td>Usage individuel</td></tr><tr><td>Tri vers des dossiers au clavier</td><td>Gestionnaire de fichiers intégré</td><td>Cœur du flux, jusqu'à 29 destinations</td></tr><tr><td>Photos</td><td>Outils complémentaires</td><td>Flux de tri photo dédié</td></tr></table></div>"""),
            ("Lequel choisir sans surdimensionner son outil ?", """
      <p>Pour une société de production, une banque de rushes ou une archive où plusieurs personnes décrivent et recherchent des plans, Fast Video Cataloger apporte des fonctions que Prisme ne cherche pas à reproduire. La transcription et les métadonnées de scène peuvent justifier à elles seules ce choix.</p>
      <p>Pour une collection familiale, des téléchargements autorisés, des exports ou des vidéos accumulées sur plusieurs disques, Prisme réduit la préparation et les gestes. Il est possible de ranger d'abord avec Prisme puis d'indexer les dossiers stabilisés dans un catalogue professionnel.</p>
      <div class="limites"><b class="limites-titre">Ce que Prisme ne remplace pas</b><ul><li>Pas de transcription de la parole.</li><li>Pas de base de métadonnées personnalisée ni de scripts C#.</li><li>Pas de comptes ni de catalogue collaboratif hébergé.</li><li>Pas de catalogue utile quand tous les supports sont déconnectés.</li></ul></div>"""),
        ],
        "cta_title": "Choisir le bon niveau d'outil",
        "cta_text": "L'essai complet de Prisme dure 14 jours sans carte bancaire. Comparez le temps de rangement sur un lot représentatif avant d'investir dans un catalogue plus complexe.",
        "faq": [
            ("Fast Video Cataloger est-il destiné aux particuliers ?", "Il peut convenir à un particulier exigeant, mais ses fonctions de métadonnées, transcription, scripts et collaboration ciblent aussi clairement les professionnels et les archives."),
            ("Prisme transcrit-il les vidéos ?", "Non. Fast Video Cataloger annonce une transcription locale interrogeable. Prisme propose plutôt une recherche par noms, mots-clés et contenu visuel local en essai."),
            ("Lequel gère les disques externes ?", "Les deux. Fast Video Cataloger conserve un catalogue consultable quand le disque est débranché ; Prisme réunit plusieurs racines mais a besoin du support pour lire ou déplacer le fichier."),
            ("Peut-on combiner les deux logiciels ?", "Oui. Rangez physiquement les fichiers avec Prisme, puis rescanez les dossiers stables dans Fast Video Cataloger pour la transcription et la documentation détaillée."),
        ],
    },
    "alternative-scenesort-pro": {
        "crumb": "SceneSort Pro ou Prisme",
        "h1": "SceneSort Pro ou Prisme : deux logiciels pour ranger une grande vidéothèque",
        "lead": "SceneSort Pro et Prisme sont deux applications Windows locales conçues pour des collections dispersées et difficiles à parcourir. SceneSort Pro automatise surtout le nettoyage des noms et les suggestions issues des fichiers ; Prisme accélère les décisions visuelles et le rangement manuel au clavier.",
        "brief": "Choisissez SceneSort Pro si les noms encombrés, l'identification de personnes ou studios et les traitements par lots sont votre problème principal. Choisissez Prisme si vous devez voir rapidement ce que contient chaque vidéo, la répartir dans vos propres dossiers et continuer à la regarder dans une bibliothèque photo-vidéo.",
        "sections": [
            ("L'approche de SceneSort Pro", """
      <p><a href="https://scenesortpro.com/" rel="nofollow noopener">SceneSort Pro</a> analyse plusieurs dossiers, disques externes ou emplacements réseau et construit un index local. Il nettoie les noms en retirant des éléments techniques, regroupe des doublons probables par taille et empreinte, lit résolution et codec et propose des personnes ou studios d'après les noms. Les suggestions passent par une file de validation.</p>
      <p>Son éditeur insiste sur le contrôle : renommages, déplacements et suppressions sont examinés avant application et journalisés pour pouvoir être annulés. Le logiciel ouvre ensuite la vidéo dans le lecteur externe choisi, par exemple VLC. Cette séparation convient à ceux qui veulent garder leur lecteur habituel.</p>"""),
            ("L'approche de Prisme", """
      <p>Prisme commence par montrer le contenu. Plusieurs instants d'une vidéo apparaissent sans ouvrir une autre fenêtre ; si l'aperçu ne suffit pas, le lecteur intégré reprend immédiatement. Chaque dossier de destination reçoit une touche et la vidéo suivante arrive dès la décision. Le classement repose sur votre jugement plutôt que sur une interprétation du nom.</p>
      <p>Après le rangement, Prisme reste le lecteur et le navigateur de la collection. Il réunit aussi les photos, compare des variantes réencodées, affiche jusqu'à dix médias ensemble, garde une vidéo au-dessus des autres fenêtres et peut diagnostiquer ou réparer certains fichiers endommagés.</p>"""),
            ("Comparatif rapide", """
      <div class="tableau"><table><tr><th>Critère</th><th>SceneSort Pro</th><th>Prisme</th></tr><tr><td>Principe du tri</td><td>Suggestions, file de révision, lots</td><td>Décision visuelle, une touche par destination</td></tr><tr><td>Nettoyage des noms</td><td>Analyse et propositions en série</td><td>Renommage unitaire avec F2</td></tr><tr><td>Personnes et studios</td><td>Suggestions tirées des noms</td><td>Mots-clés tirés des noms, sans base de personnes</td></tr><tr><td>Doublons</td><td>Taille et empreinte, score de correspondance</td><td>Copies exactes et contenu vidéo réencodé</td></tr><tr><td>Lecture</td><td>Lecteur externe</td><td>Lecteurs intégrés, Mur et fenêtre flottante</td></tr><tr><td>Photos</td><td>Produit centré sur les vidéos</td><td>Oui, espace dédié</td></tr><tr><td>NAS</td><td>Chemins réseau et UNC annoncés</td><td>Oui, comme racines de bibliothèque</td></tr></table></div>"""),
            ("Comment choisir selon l'état de la collection", """
      <ul><li><strong>Des noms illisibles mais structurés</strong> : les propositions de nettoyage de SceneSort Pro peuvent gagner du temps.</li><li><strong>Des noms inutiles qui ne disent rien du contenu</strong> : les aperçus de Prisme permettent de décider avec les images.</li><li><strong>Des changements par lots à vérifier</strong> : la file de révision de SceneSort Pro est conçue pour cela.</li><li><strong>Un tri fin vers vos catégories</strong> : les 29 destinations de Prisme rendent chaque décision explicite.</li><li><strong>Un lecteur favori déjà configuré</strong> : SceneSort Pro le lance ; Prisme fournit ses propres modes de lecture.</li></ul>
      <div class="limites"><b class="limites-titre">Pas de gagnant universel</b><p>Les deux produits évoluent et certaines fonctions se recoupent. Les informations sur SceneSort Pro viennent de son site officiel consulté en octobre 2026. Utilisez une copie, contrôlez le plan de renommage et vérifiez la corbeille avant tout traitement massif.</p></div>"""),
        ],
        "cta_title": "Tester le tri visuel sur un petit lot",
        "cta_text": "Prisme offre 14 jours d'essai complet sans carte bancaire. Comparez-le à la file de révision de SceneSort Pro sur des fichiers représentatifs de votre désordre réel.",
        "faq": [
            ("SceneSort Pro et Prisme fonctionnent-ils hors ligne ?", "Les deux mettent en avant un traitement local. Certaines fonctions facultatives de métadonnées peuvent avoir leurs propres besoins ; vérifiez les réglages de la version installée."),
            ("Lequel renomme plusieurs fichiers à la fois ?", "SceneSort Pro propose des suggestions de nettoyage et une validation par lots. Prisme renomme actuellement un fichier à la fois avec F2."),
            ("Lequel utilise VLC ?", "SceneSort Pro ouvre les fichiers dans un lecteur externe comme VLC. Prisme intègre ses lecteurs, son Mur multividéo et une fenêtre flottante."),
            ("Les deux détectent-ils les doublons ?", "Oui, avec des méthodes et des interfaces différentes. Testez notamment les vidéos réencodées, qui sont plus difficiles que les copies strictement identiques."),
        ],
    },
    "alternative-adobe-bridge": {
        "crumb": "Adobe Bridge ou Prisme",
        "h1": "Adobe Bridge ou Prisme pour trier ses photos et vidéos ?",
        "lead": "Adobe Bridge est un gestionnaire de ressources numériques généraliste, étroitement adapté aux flux créatifs et aux métadonnées. Prisme est un outil Windows plus spécialisé : il accélère le tri visuel de grandes quantités de photos et surtout de vidéos vers de vrais dossiers.",
        "brief": "Choisissez Adobe Bridge pour gérer des formats créatifs variés, appliquer des mots-clés, notes et métadonnées XMP, renommer par lots et travailler avec l'écosystème Adobe. Choisissez Prisme si le temps perdu vient surtout de l'ouverture des vidéos et des déplacements répétés dans l'Explorateur.",
        "sections": [
            ("Pourquoi Adobe Bridge reste une référence", """
      <p><a href="https://helpx.adobe.com/bridge/desktop/organize-and-find-files/organize-files-and-folders/organize-content-and-assets.html" rel="nofollow noopener">Adobe Bridge</a> parcourt, recherche, trie, filtre et gère des images, PDF, fichiers de mise en page et médias dynamiques. Il peut déplacer, renommer ou supprimer des fichiers, exécuter des commandes par lots et afficher les données importées d'un appareil photo ou d'une caméra.</p>
      <p>Ses notes, libellés de couleur, mots-clés hiérarchiques et métadonnées XMP conviennent aux photographes et créatifs qui veulent enrichir les fichiers de façon standardisée. Le renommage par lots et les espaces de travail personnalisables sont de vrais avantages. Bridge prend aussi son sens lorsqu'il s'insère entre Camera Raw, Photoshop, Illustrator, InDesign ou d'autres outils Adobe.</p>"""),
            ("Pourquoi Prisme n'est pas un clone de Bridge", """
      <p>Prisme ne cherche pas à gérer tous les actifs d'un studio. Son interface est optimisée pour une boucle courte : voir plusieurs moments d'une vidéo, choisir une destination au clavier, passer au fichier suivant. Les copies se font en arrière-plan et l'historique peut annuler jusqu'à 200 actions. Le même principe s'applique aux photos déjà exportées dans des formats courants.</p>
      <p>Prisme ajoute des fonctions absentes du cœur de Bridge : regroupement des vidéos réencodées, lecture de plusieurs médias dans le Mur, lecteur toujours au premier plan, accès local depuis le téléphone ou la TV et diagnostic de vidéos corrompues. En échange, il ne traite ni RAW, ni PDF, ni fichiers de création.</p>"""),
            ("Comparatif par usage", """
      <div class="tableau"><table><tr><th>Besoin</th><th>Adobe Bridge</th><th>Prisme</th></tr><tr><td>Types de fichiers</td><td>Images, RAW, PDF, documents Adobe, médias dynamiques</td><td>Photos courantes et vidéos</td></tr><tr><td>Métadonnées</td><td>XMP, IPTC, mots-clés hiérarchiques, modèles</td><td>Mots-clés, favoris et index local</td></tr><tr><td>Renommer par lots</td><td>Oui, avec modèles</td><td>Non, renommage unitaire</td></tr><tr><td>Tri vidéo au clavier</td><td>Notes, libellés et commandes</td><td>Jusqu'à 29 dossiers de destination</td></tr><tr><td>Aperçu vidéo</td><td>Prévisualisation des médias</td><td>Captures multiples, survol et lecture immédiate</td></tr><tr><td>Doublons réencodés</td><td>Pas une fonction centrale</td><td>Oui</td></tr><tr><td>Écosystème créatif</td><td>Intégration Adobe</td><td>Application autonome</td></tr></table></div>"""),
            ("Bridge est meilleur dans certains cas — et c'est normal", """
      <p>Pour un photographe RAW, un graphiste ou une équipe qui doit préserver et échanger des métadonnées, Bridge est le choix logique. Il est aussi meilleur lorsque le renommage par lots fait partie du flux. Prisme ne remplace pas ces fonctions et ne prétend pas gérer un projet créatif complet.</p>
      <p>Pour une vidéothèque familiale ou personnelle en désordre, la spécialisation de Prisme peut éviter de configurer notes, libellés et commandes avant de commencer. Les deux outils peuvent cohabiter : Bridge pour préparer et documenter les fichiers d'un projet, Prisme pour trier et parcourir la collection finale.</p>
      <div class="limites"><b class="limites-titre">Avant un tri important</b><p>Les métadonnées ne remplacent pas les dossiers ni la sauvegarde. Vérifiez aussi quels champs sont intégrés au fichier et lesquels vivent dans une base ou un fichier annexe. Travaillez sur une copie quand vous testez un nouveau flux.</p></div>"""),
        ],
        "cta_title": "Essayer un outil spécialisé sur vos vidéos",
        "cta_text": "Prisme s'essaie gratuitement pendant 14 jours, sans carte bancaire. Gardez Bridge pour ses forces et comparez seulement le travail de tri qui vous ralentit.",
        "faq": [
            ("Adobe Bridge peut-il organiser des vidéos ?", "Oui. La documentation Adobe indique qu'il peut parcourir, prévisualiser, rechercher, trier, filtrer et gérer des médias dynamiques en plus des images et documents."),
            ("Prisme remplace-t-il Adobe Bridge pour un photographe ?", "Non si vous avez besoin de RAW, de métadonnées XMP avancées, de renommage par lots ou d'intégration aux applications Adobe. Prisme vise le tri rapide de formats photo courants et de vidéos."),
            ("Lequel est le plus rapide pour répartir des vidéos dans des dossiers ?", "Prisme a été conçu autour de cette opération : une touche par destination et le fichier suivant immédiatement. Dans Bridge, le résultat dépend davantage de l'espace de travail et des commandes configurées."),
            ("Peut-on utiliser Bridge et Prisme sur les mêmes dossiers ?", "Oui, en évitant de déplacer des fichiers pendant que l'autre application les indexe. Après un déplacement massif, actualisez Bridge et vérifiez les éventuels fichiers annexes de métadonnées."),
        ],
    },
    "alternative-digikam": {
        "crumb": "digiKam ou Prisme",
        "h1": "digiKam ou Prisme : quel logiciel pour classer photos et vidéos ?",
        "lead": "digiKam est une puissante photothèque open source qui sait aussi cataloguer des vidéos. Prisme est une application Windows plus simple à démarrer, centrée sur le tri rapide des fichiers dans des dossiers et sur le visionnage vidéo. Les deux produits répondent donc à des profondeurs de gestion différentes.",
        "brief": "Choisissez digiKam pour les fichiers RAW, les albums, les tags hiérarchiques, les notes, la recherche avancée et la retouche photo, sur Windows, macOS ou Linux. Choisissez Prisme pour traiter rapidement un gros dossier photo-vidéo, comparer des vidéos et conserver un flux de lecture plus direct.",
        "sections": [
            ("Ce qui rend digiKam très complet", """
      <p><a href="https://www.digikam.org/about/" rel="nofollow noopener">digiKam</a> est un gestionnaire de photos open source pour Linux, Windows et macOS. Il importe photos, RAW et vidéos depuis des appareils ou supports, les organise en albums et permet d'ajouter tags, notes et libellés. La recherche combine date, lieu, métadonnées EXIF, IPTC ou XMP et de nombreux autres critères.</p>
      <p>Le logiciel propose aussi reconnaissance de visages, outils de classification, renommage par lots et retouche photo. Pour les vidéos, il s'appuie sur FFmpeg afin d'extraire les métadonnées et de lire les médias. Cette richesse convient à l'utilisateur prêt à construire et entretenir un catalogue détaillé.</p>"""),
            ("Ce que Prisme simplifie", """
      <p>Prisme ne possède ni développement RAW, ni reconnaissance faciale, ni éditeur photo. Il réduit volontairement le modèle : des racines à parcourir, des dossiers de destination, des favoris et des mots-clés. Le travail principal se fait avec le clavier, sans formulaire de métadonnées entre deux fichiers.</p>
      <p>Cette simplicité devient un avantage quand la vidéo domine. Des captures à plusieurs instants évitent de lancer chaque fichier, la molette parcourt le contenu, et la décision déplace immédiatement la vidéo. Prisme compare aussi les vidéos réencodées, réunit plusieurs disques ou NAS et fournit un Mur multividéo, un lecteur flottant et des outils de réparation.</p>"""),
            ("Comparatif sans opposer logiciel libre et logiciel commercial", """
      <div class="tableau"><table><tr><th>Critère</th><th>digiKam</th><th>Prisme</th></tr><tr><td>Licence</td><td>Open source</td><td>Propriétaire, essai puis payant</td></tr><tr><td>Systèmes</td><td>Windows, macOS, Linux</td><td>Windows 10 et 11</td></tr><tr><td>RAW et retouche</td><td>Oui</td><td>Non</td></tr><tr><td>Tags et recherche</td><td>Très complets, métadonnées standard</td><td>Plus simples, locaux et orientés usage</td></tr><tr><td>Visages</td><td>Reconnaissance disponible</td><td>Non</td></tr><tr><td>Tri physique rapide</td><td>Gestion et lots possibles</td><td>Une touche vers 29 destinations</td></tr><tr><td>Vidéo</td><td>Catalogage, métadonnées et lecture</td><td>Aperçus, doublons de contenu et modes de lecture</td></tr></table></div>"""),
            ("Quel profil correspond à chaque logiciel ?", """
      <p>digiKam est difficile à battre pour une grande photothèque, surtout avec des RAW, des visages, des lieux et une taxonomie précise. Il demande en contrepartie de comprendre davantage de notions et de choisir où stocker le catalogue et les métadonnées.</p>
      <p>Prisme convient mieux si votre première question est « comment finir ce tri ? ». Il sacrifie la profondeur photo pour réduire le nombre d'étapes, puis ajoute des fonctions de lecture vidéo utiles au quotidien. Une organisation en dossiers créée par Prisme peut ensuite être indexée dans digiKam.</p>
      <div class="limites"><b class="limites-titre">Deux choix assumés</b><ul><li>digiKam est plus complet et multiplateforme, mais son apprentissage est plus important.</li><li>Prisme est plus étroit et seulement Windows, mais son flux de décision est immédiat.</li><li>Dans les deux cas, sauvegardez la photothèque et la base avant un changement massif.</li></ul></div>"""),
        ],
        "cta_title": "Tester la simplicité avant de choisir la profondeur",
        "cta_text": "Essayez toutes les fonctions de Prisme pendant 14 jours, sans carte bancaire, sur une copie. Si le manque de RAW ou de métadonnées avancées bloque votre usage, digiKam est probablement plus adapté.",
        "faq": [
            ("digiKam gère-t-il les vidéos ?", "Oui. Son site officiel annonce le catalogage des vidéos et l'utilisation de FFmpeg pour extraire les métadonnées et lire les médias."),
            ("digiKam est-il gratuit ?", "Oui, digiKam est un logiciel open source. Prisme est un logiciel propriétaire avec un essai de 14 jours avant achat ou abonnement."),
            ("Lequel choisir pour les fichiers RAW ?", "digiKam. Prisme ne prend pas en charge les RAW et ne remplace pas un développeur ou gestionnaire photo complet."),
            ("Lequel choisir pour des milliers de vidéos ?", "Prisme est plus directement orienté vers l'aperçu et le tri vidéo au clavier. digiKam convient mieux si ces vidéos doivent rejoindre une photothèque richement documentée."),
        ],
    },
    "alternative-diffractor": {
        "crumb": "Diffractor ou Prisme",
        "h1": "Diffractor ou Prisme : deux organisateurs photo et vidéo pour Windows",
        "lead": "Diffractor et Prisme travaillent directement avec les fichiers présents sur le PC ou des lecteurs connectés, sans imposer un cloud. Diffractor est une visionneuse et un gestionnaire de métadonnées photo-vidéo polyvalent ; Prisme se spécialise davantage dans le tri séquentiel et les grandes collections vidéo.",
        "brief": "Choisissez Diffractor pour les RAW, métadonnées, dates et lieux, comparaison côte à côte, retouche photo et synchronisation avec votre stockage. Choisissez Prisme si vous voulez attribuer une destination à chaque fichier en une touche, voir plusieurs moments d'une vidéo et détecter des variantes réencodées.",
        "sections": [
            ("Le flux proposé par Diffractor", """
      <p><a href="https://www.diffractor.com/" rel="nofollow noopener">Diffractor</a> est une application Windows qui indexe les dossiers choisis tout en laissant photos et vidéos dans l'arborescence ordinaire. Elle affiche photos, vidéos et audio, prend en charge des formats RAW et permet une recherche par métadonnées, date de prise de vue, lieu ou type de fichier.</p>
      <p>Diffractor compare des médias côte à côte, applique notes, tags et drapeaux et permet de corriger des métadonnées. Il ajoute des retouches photo et peut comparer la collection avec un NAS ou un lecteur réseau pour synchroniser les changements. Son éditeur avertit justement qu'une synchronisation peut supprimer des fichiers et ne remplace pas une sauvegarde.</p>"""),
            ("Le flux proposé par Prisme", """
      <p>Prisme commence là où une visionneuse généraliste devient lente : des centaines de décisions successives. Jusqu'à 29 destinations sont associées au clavier ; une touche déplace le fichier et affiche le suivant. Les aperçus vidéo montrent plusieurs moments, le lecteur intégré vérifie un détail sans changer de fenêtre et l'historique annule les erreurs.</p>
      <p>Prisme ne retouche pas les photos et ne synchronise pas deux stockages. Il concentre ses fonctions supplémentaires sur la vidéo : même contenu sous plusieurs encodages, Mur de deux à dix médias, lecteur flottant, son normalisé à la lecture, diagnostic et réparation de certains fichiers.</p>"""),
            ("Comparatif des fonctions importantes", """
      <div class="tableau"><table><tr><th>Besoin</th><th>Diffractor</th><th>Prisme</th></tr><tr><td>Photos et vidéos locales</td><td>Oui</td><td>Oui</td></tr><tr><td>RAW</td><td>Oui, nombreux formats</td><td>Non</td></tr><tr><td>Métadonnées</td><td>XMP, IPTC, EXIF, ID3 et autres</td><td>Index local et mots-clés simples</td></tr><tr><td>Retouche photo</td><td>Outils intégrés</td><td>Non</td></tr><tr><td>Tri vers plusieurs dossiers</td><td>Gestion des fichiers</td><td>Flux au clavier jusqu'à 29 destinations</td></tr><tr><td>Doublons</td><td>Contrôles de copies possibles</td><td>Copies exactes et variantes réencodées</td></tr><tr><td>NAS</td><td>Synchronisation possible</td><td>Bibliothèque et tri direct sur partage</td></tr></table></div>"""),
            ("Diffractor est un concurrent direct, mais pas identique", """
      <p>Les deux outils défendent une bibliothèque locale et des dossiers ordinaires. Diffractor prend l'avantage pour une collection majoritairement photo, riche en métadonnées et en RAW, ou lorsqu'il faut comparer et retoucher des images. Prisme prend l'avantage quand l'effort principal est de regarder assez d'une vidéo pour choisir rapidement où elle va.</p>
      <p>Il est possible d'utiliser Diffractor comme visionneuse globale et Prisme pour les campagnes de tri vidéo. Évitez simplement de synchroniser ou déplacer le même dossier simultanément dans deux applications, puis laissez chaque index se mettre à jour.</p>
      <div class="limites"><b class="limites-titre">Attention aux opérations de masse</b><p>Un outil local peut réellement modifier, déplacer ou supprimer vos fichiers. Une fonction de synchronisation n'est pas une sauvegarde. Préparez une copie indépendante et testez toujours la règle sur un petit dossier.</p></div>"""),
        ],
        "cta_title": "Comparer le temps nécessaire à cent décisions",
        "cta_text": "Prisme s'essaie 14 jours avec toutes ses fonctions et sans carte bancaire. Un lot de cent vidéos suffit pour savoir si son tri au clavier correspond à votre façon de travailler.",
        "faq": [
            ("Diffractor fonctionne-t-il sans cloud ?", "Oui. Son site indique que les fichiers restent dans les dossiers Windows choisis et ne sont pas téléversés. Certaines actions réseau dépendent naturellement de votre propre stockage."),
            ("Diffractor prend-il en charge les vidéos ?", "Oui. Il peut afficher et lire photos, vidéos et audio, avec recherche, comparaison et métadonnées. Prisme approfondit davantage le tri et le visionnage vidéo."),
            ("Lequel choisir pour les RAW ?", "Diffractor. Prisme ne prend pas en charge les formats RAW et ne fournit pas d'outils de développement photo."),
            ("Peut-on utiliser un NAS avec les deux ?", "Oui, avec des approches différentes. Diffractor propose notamment une synchronisation ; Prisme ajoute directement un partage comme racine de bibliothèque. Sauvegardez avant toute synchronisation ou suppression."),
        ],
    },
}


# Les comparatifs de marques grand public restent des notes de recherche :
# ils ne sont ni générés ni indexés. Le silo public privilégie les besoins
# concrets afin de ne pas multiplier des pages proches ou faire découvrir des
# concurrents sans intention de recherche clairement établie.
PUBLIC = {
    slug: PUBLIC_RESEARCH[slug]
    for slug in ("trier-grand-dossier-videos", "organiser-videos-telechargees")
}


ADULT_RESEARCH = {
    ("alternative-the-vault", "fr"): {
        "twin": "/en/adult/the-vault-alternative/",
        "crumb": "Alternative à The Vault",
        "h1": "The Vault ou Prisme : quel logiciel pour organiser sa collection porno ?",
        "lead": "The Vault et Prisme sont deux applications locales pour Windows capables de rendre une grande collection de photos et vidéos plus facile à parcourir. The Vault construit une bibliothèque visuelle enrichie ; Prisme privilégie le tri rapide dans de vrais dossiers et le visionnage quotidien.",
        "brief": "Choisissez The Vault pour son catalogue visuel, son application Android et ses fonctions d'IA hors ligne. Choisissez Prisme pour classer physiquement des milliers de fichiers au clavier, travailler sur plusieurs disques ou un NAS et disposer d'outils de lecture, de doublons et de réparation dans la même application.",
        "sections": [
            ("Ce que The Vault met en avant", """
      <p><a href="https://vault-app.site/" rel="nofollow noopener">The Vault</a> est présenté par son éditeur comme un logiciel gratuit et open source pour Windows et Android. Il indexe photos et vidéos dans une bibliothèque visuelle, propose des tags, une recherche, plusieurs panneaux et des fonctions d'IA exécutées hors ligne. Son site mentionne aussi la détection des images en double.</p>
      <p>Cette approche convient à celui qui veut enrichir un catalogue et parcourir ses médias comme dans une galerie. La version Android est un avantage si le mobile fait partie du flux principal.</p>"""),
            ("Ce que Prisme fait différemment", """
      <p>Prisme part des dossiers existants. Vous associez jusqu'à 29 dossiers à des touches, prévisualisez une vidéo puis la déplacez en une pression ; la suivante apparaît aussitôt. Le classement reste visible dans l'Explorateur et réutilisable par n'importe quel autre logiciel.</p>
      <p>Prisme réunit les racines locales, disques externes et partages NAS dans une seule vue. Il détecte les copies exactes et les vidéos réencodées, montre jusqu'à dix médias dans le Mur, garde un lecteur flottant au premier plan et peut diagnostiquer ou réparer certaines vidéos endommagées.</p>"""),
            ("Comparatif sans faux gagnant", """
      <div class="tableau"><table><tr><th>Besoin</th><th>The Vault</th><th>Prisme</th></tr><tr><td>Bibliothèque visuelle et tags</td><td>Oui, cœur du produit</td><td>Oui, avec priorité aux dossiers</td></tr><tr><td>Tri physique au clavier</td><td>Pas mis en avant</td><td>Jusqu'à 29 destinations</td></tr><tr><td>IA hors ligne</td><td>Tags annoncés</td><td>Recherche par contenu en essai, locale</td></tr><tr><td>Doublons</td><td>Images en double annoncées</td><td>Photos et vidéos, y compris réencodages</td></tr><tr><td>Android</td><td>Application</td><td>Accès navigateur ; application TV distincte</td></tr><tr><td>NAS et plusieurs racines</td><td>À vérifier selon votre configuration</td><td>Prévu pour cela</td></tr><tr><td>Prix</td><td>Gratuit et open source</td><td>Essai 14 jours, puis payant</td></tr></table></div>"""),
            ("Pour qui choisir chaque outil", """
      <p>The Vault est le choix naturel si vous voulez un projet libre, une galerie riche et un usage Android. Prisme est plus adapté si votre problème immédiat est le désordre sur le disque : des milliers de fichiers à répartir, plusieurs emplacements à réunir et des doublons vidéo à comparer.</p>
      <p>Les deux approches peuvent cohabiter. Commencez sur une copie de petit volume, vérifiez la façon dont les métadonnées et déplacements sont conservés, puis seulement ensuite ouvrez toute la bibliothèque.</p>
      <div class="limites"><b class="limites-titre">Ce que Prisme ne remplace pas</b><ul><li>Prisme n'est pas open source.</li><li>Il ne possède pas d'application Android de gestion complète.</li><li>Il ne récupère pas de fiches d'acteurs, de studios ou de scènes depuis Internet.</li></ul></div>"""),
        ],
        "cta_title": "Comparer sur votre propre bibliothèque",
        "cta_text": "Essayez Prisme 14 jours sans carte bancaire, sur une copie d'un dossier. Rien n'est envoyé en ligne.",
        "faq": [("The Vault est-il gratuit ?", "Son site le présente comme gratuit et open source. Vérifiez la licence et les versions disponibles sur le site officiel au moment de votre choix."), ("The Vault et Prisme fonctionnent-ils hors ligne ?", "Les deux mettent en avant un fonctionnement local. Prisme n'envoie ni vos médias ni son analyse de contenu dans le cloud."), ("Lequel range réellement les fichiers ?", "Le tri physique vers des dossiers associés au clavier est au cœur de Prisme. Pour The Vault, vérifiez dans la version actuelle si son organisation correspond à votre besoin de déplacer les fichiers."), ("Peut-on utiliser les deux ?", "Oui. Une organisation en dossiers reste exploitable par plusieurs logiciels. Travaillez d'abord sur une copie et relancez l'indexation après un déplacement massif.")],
    },
    ("the-vault-alternative", "en"): {
        "twin": "/adulte/alternative-the-vault/",
        "crumb": "The Vault alternative",
        "h1": "The Vault or Prisme: which porn organizer fits your workflow?",
        "lead": "The Vault and Prisme are local Windows applications designed to make a large photo and video collection easier to browse. The Vault builds a rich visual library; Prisme focuses on fast, keyboard-driven filing into real folders and everyday viewing.",
        "brief": "Pick The Vault for its visual catalog, Android application and advertised offline AI. Pick Prisme when you need to file thousands of items into actual folders, combine drives or a NAS, compare video duplicates and keep viewing tools in the same desktop app.",
        "sections": [
            ("What The Vault emphasizes", """<p><a href="https://vault-app.site/" rel="nofollow noopener">The Vault</a> is presented by its publisher as a free, open-source Windows and Android tool. It indexes photos and videos in a visual library, with tags, search, multiple panels and AI features that run offline. Its site also advertises duplicate-image detection.</p><p>That model suits people who want to enrich a catalog and browse media as a gallery. A dedicated Android application is a meaningful advantage when mobile is part of the main workflow.</p>"""),
            ("How Prisme differs", """<p>Prisme starts with the folders you already have. Assign up to 29 destinations to keys, preview a video, then file it with one press; the next item appears immediately. The result remains visible in File Explorer and usable by any other software.</p><p>Local folders, external drives and NAS shares can appear in one view. Prisme finds exact copies and re-encoded video variants, shows up to ten items in the Wall, keeps a floating player above other windows and can diagnose or repair some damaged videos.</p>"""),
            ("A comparison without a fake winner", """<div class="tableau"><table><tr><th>Need</th><th>The Vault</th><th>Prisme</th></tr><tr><td>Visual library and tags</td><td>Yes, a core focus</td><td>Yes, with folders first</td></tr><tr><td>Physical keyboard filing</td><td>Not a headline feature</td><td>Up to 29 destinations</td></tr><tr><td>Offline AI</td><td>Tagging advertised</td><td>Local content search in preview</td></tr><tr><td>Duplicates</td><td>Duplicate images advertised</td><td>Photos and videos, including re-encodes</td></tr><tr><td>Android</td><td>Dedicated app</td><td>Browser access; separate TV app</td></tr><tr><td>NAS and multiple roots</td><td>Check your setup</td><td>Designed for them</td></tr><tr><td>Price</td><td>Free and open source</td><td>14-day trial, then paid</td></tr></table></div>"""),
            ("Who should choose which", """<p>The Vault is the natural choice if open source, a gallery-rich catalog and Android matter most. Prisme fits better when the immediate problem is disk disorder: thousands of files to distribute, several locations to bring together and video duplicates to compare.</p><p>The approaches can coexist because a folder-based library stays available to other tools. Start with a copied test folder, confirm how metadata and moves behave, and only then index the full collection.</p><div class="limites"><b class="limites-titre">What Prisme does not replace</b><ul><li>Prisme is not open source.</li><li>It has no full Android management application.</li><li>It does not fetch performer, studio or scene records from the internet.</li></ul></div>"""),
        ],
        "cta_title": "Compare them on your own library",
        "cta_text": "Try every Prisme feature for 14 days without a credit card, using a copied test folder. Nothing is uploaded.",
        "faq": [("Is The Vault free?", "Its official site presents it as free and open source. Check the current license and available releases on that site before choosing."), ("Do The Vault and Prisme work offline?", "Both emphasize local operation. Prisme does not upload your media or its content analysis to a cloud service."), ("Which one files the actual media?", "Physical filing into keyboard-assigned folders is central to Prisme. For The Vault, verify whether its current release moves files in the way your workflow requires."), ("Can I use both?", "Yes. A folder-based collection remains available to multiple tools. Test on a copy and rescan any catalog after large moves.")],
    },
    ("alternative-nsfw-manager", "fr"): {
        "twin": "/en/adult/nsfw-manager-alternative/", "crumb": "Alternative à NSFW Manager",
        "h1": "NSFW Manager ou Prisme : détecter du contenu sensible ou organiser une collection",
        "lead": "NSFW Manager et Prisme parlent tous les deux de fichiers pour adultes sur Windows, mais ils ne résolvent pas le même problème. Le premier cherche du contenu sensible sur la machine et peut l'isoler ; le second aide le propriétaire d'une collection connue à la trier, la ranger et la regarder.",
        "brief": "Choisissez NSFW Manager pour auditer un PC et repérer automatiquement des images ou vidéos sensibles. Choisissez Prisme lorsque vous savez où se trouve votre collection et que vous voulez l'organiser vite, dans de vrais dossiers, avec aperçus, doublons et outils de lecture.",
        "sections": [
            ("Le rôle de NSFW Manager", """<p><a href="https://www.nsfwmanager.com/" rel="nofollow noopener">NSFW Manager</a> se présente comme un outil local pour Windows qui détecte et classe le contenu NSFW, puis permet de le mettre en quarantaine. Son intérêt principal est l'audit : trouver des fichiers sensibles dispersés, y compris quand leur nom ne les signale pas.</p><p>Ce positionnement convient à un contrôle de machine, à un nettoyage ou à une séparation initiale entre médias sensibles et ordinaires. Ce n'est pas la même chose qu'une bibliothèque conçue pour être parcourue chaque jour.</p>"""),
            ("Le rôle de Prisme", """<p>Prisme part de dossiers que vous choisissez. Il montre des extraits de chaque vidéo, associe des destinations à des touches et déplace le fichier dès la décision. Les photos et vidéos, plusieurs disques et les dossiers d'un NAS peuvent être réunis dans la même interface.</p><p>Une fois le tri fait, les favoris, mots-clés, aperçus, recherche locale par contenu, doublons, Mur, lecteur flottant, téléphone et télé servent à retrouver et regarder la collection. L'application ne cherche pas à scanner tout le PC à votre insu.</p>"""),
            ("Comparaison par objectif", """<div class="tableau"><table><tr><th>Objectif</th><th>NSFW Manager</th><th>Prisme</th></tr><tr><td>Trouver du contenu sensible dispersé</td><td>Oui, fonction principale</td><td>Non, vous choisissez les dossiers</td></tr><tr><td>Quarantaine</td><td>Oui</td><td>Non ; classement vers vos dossiers</td></tr><tr><td>Trier au clavier</td><td>Pas le cœur du produit</td><td>Jusqu'à 29 destinations</td></tr><tr><td>Parcourir une bibliothèque</td><td>Secondaire</td><td>Oui</td></tr><tr><td>Doublons et réencodages</td><td>À vérifier selon la version</td><td>Oui</td></tr><tr><td>Lecture avancée</td><td>Pas l'objectif principal</td><td>Aperçus, Mur et lecteur flottant</td></tr><tr><td>Traitement local</td><td>Annoncé</td><td>Oui</td></tr></table></div>"""),
            ("Ils peuvent se compléter", """<p>Un flux raisonnable consiste à utiliser un détecteur pour localiser et isoler les fichiers sensibles, puis un organisateur pour classer ce qui doit être conservé. Avant toute quarantaine ou suppression, contrôlez les faux positifs et gardez une sauvegarde.</p><p>La discrétion ne dépend jamais d'une seule application. Un compte Windows séparé, le chiffrement BitLocker ou VeraCrypt et des sauvegardes elles-mêmes chiffrées protègent davantage qu'un simple dossier caché.</p><div class="limites"><b class="limites-titre">Ne pas confondre détection et protection</b><p>Détecter, masquer et chiffrer sont trois actions différentes. Prisme ajoute un écran de repli et un code PIN, mais ne remplace pas le chiffrement du disque ni la sécurité du compte Windows.</p></div>"""),
        ],
        "cta_title": "Une fois les fichiers localisés, les ranger vraiment",
        "cta_text": "Essayez Prisme 14 jours, sans carte bancaire. Commencez sur une copie et définissez vos dossiers de destination avant le premier tri.",
        "faq": [("NSFW Manager et Prisme font-ils la même chose ?", "Non. NSFW Manager vise la détection et la quarantaine de contenu sensible. Prisme vise le tri, le rangement et le visionnage d'une collection dont vous connaissez les dossiers."), ("Prisme scanne-t-il tout le PC ?", "Non. Vous choisissez les dossiers et racines à ajouter. Le logiciel ne part pas chercher du contenu dans le reste de la machine."), ("Un code PIN suffit-il pour protéger une collection ?", "Non. Il aide contre un regard accidentel, mais un compte Windows protégé et le chiffrement du disque sont nécessaires contre un accès déterminé."), ("Peut-on utiliser un détecteur puis Prisme ?", "Oui. Vérifiez d'abord les résultats du détecteur, puis ajoutez à Prisme uniquement les dossiers que vous souhaitez organiser.")],
    },
    ("nsfw-manager-alternative", "en"): {
        "twin": "/adulte/alternative-nsfw-manager/", "crumb": "NSFW Manager alternative",
        "h1": "NSFW Manager or Prisme: detect sensitive files or organize a collection",
        "lead": "NSFW Manager and Prisme both deal with adult media on Windows, but they solve different problems. The former searches a computer for sensitive content and can isolate it; the latter helps the owner of a known collection sort, file and watch it.",
        "brief": "Choose NSFW Manager to audit a PC and automatically locate sensitive images or videos. Choose Prisme when you know where your collection is and want to organize it quickly in real folders, with previews, duplicate detection and viewing tools.",
        "sections": [
            ("What NSFW Manager is for", """<p><a href="https://www.nsfwmanager.com/" rel="nofollow noopener">NSFW Manager</a> presents itself as a local Windows tool that detects and classifies NSFW content, then lets the user quarantine it. Its primary value is auditing: finding sensitive files scattered across a computer even when their names reveal nothing.</p><p>That is useful for a device review, cleanup or initial separation between sensitive and ordinary media. It is not the same job as a library designed for daily browsing.</p>"""),
            ("What Prisme is for", """<p>Prisme starts with folders you select. It shows sampled moments from each video, assigns destinations to keys and moves the file as soon as you decide. Photos, videos, multiple drives and NAS folders can appear in the same interface.</p><p>After filing, favorites, keywords, previews, local content search, duplicate groups, the Wall, a floating player, phone access and a TV app help you find and watch the collection. Prisme does not attempt to scan the entire PC without your direction.</p>"""),
            ("Compare the objective, not the label", """<div class="tableau"><table><tr><th>Objective</th><th>NSFW Manager</th><th>Prisme</th></tr><tr><td>Find scattered sensitive media</td><td>Yes, its main purpose</td><td>No, you select folders</td></tr><tr><td>Quarantine</td><td>Yes</td><td>No; files go to your folders</td></tr><tr><td>Keyboard filing</td><td>Not the main focus</td><td>Up to 29 destinations</td></tr><tr><td>Browse a library</td><td>Secondary</td><td>Yes</td></tr><tr><td>Duplicates and re-encodes</td><td>Check the current version</td><td>Yes</td></tr><tr><td>Advanced viewing</td><td>Not the main purpose</td><td>Previews, Wall and floating player</td></tr><tr><td>Local processing</td><td>Advertised</td><td>Yes</td></tr></table></div>"""),
            ("The tools can complement each other", """<p>A sensible workflow is to use a detector to locate and isolate sensitive files, then an organizer to file the items you intend to keep. Review false positives and keep a backup before any quarantine or deletion.</p><p>Privacy never depends on one app. A separate Windows account, BitLocker or VeraCrypt encryption and encrypted backups provide stronger protection than a hidden folder.</p><div class="limites"><b class="limites-titre">Detection is not protection</b><p>Finding, hiding and encrypting are different actions. Prisme offers an instant cover screen and PIN, but it does not replace full-disk encryption or Windows account security.</p></div>"""),
        ],
        "cta_title": "Once the files are found, organize them for real",
        "cta_text": "Try Prisme for 14 days without a credit card. Start on a copy and set your destination folders before the first filing session.",
        "faq": [("Do NSFW Manager and Prisme do the same job?", "No. NSFW Manager focuses on sensitive-content detection and quarantine. Prisme focuses on sorting, filing and viewing a collection whose folders you already know."), ("Does Prisme scan my whole PC?", "No. You explicitly choose the folders and roots to add. It does not search the rest of the computer for adult files."), ("Is a PIN enough to protect a collection?", "No. It helps against a casual glance, but a protected Windows account and disk encryption are needed against determined access."), ("Can I run a detector before Prisme?", "Yes. Review the detector's results first, then add only the folders you intend to organize to Prisme.")],
    },
    ("organiser-collection-porno-nas", "fr"): {
        "twin": "/en/adult/organize-porn-collection-nas/", "crumb": "Collection porno sur un NAS",
        "h1": "Organiser une collection porno sur un NAS sans sacrifier la confidentialité",
        "lead": "Un NAS centralise une grande collection et la rend accessible depuis plusieurs appareils, mais il ajoute des choix de réseau, de droits et de sauvegarde. Voici une méthode pour trier les fichiers depuis Windows, garder une arborescence lisible et éviter d'exposer la bibliothèque par erreur.",
        "brief": "Créez un partage réservé à la bibliothèque, donnez-lui un compte distinct, montez-le comme lecteur réseau sous Windows et organisez les fichiers dans de vrais dossiers. N'ouvrez aucun port sur Internet par défaut. Un NAS en RAID améliore la disponibilité, mais une seconde copie reste indispensable.",
        "sections": [
            ("Préparer le NAS avant d'ajouter les médias", """<ol><li>Créez un partage dédié, séparé des photos familiales et des dossiers publics.</li><li>Créez un utilisateur propre à cet usage, avec un mot de passe long et aucun accès invité.</li><li>Retirez l'indexation multimédia globale si elle publie automatiquement les miniatures vers des applications communes.</li><li>Activez les instantanés si le NAS les propose, puis préparez une sauvegarde vers un autre disque ou emplacement.</li><li>Sous Windows, montez le partage comme lecteur réseau avec ce compte dédié.</li></ol><p>Le chiffrement du volume protège surtout les disques retirés du NAS. Pour l'accès quotidien, les comptes, permissions et mises à jour du NAS sont tout aussi importants.</p>"""),
            ("Choisir une arborescence stable", """<p>Le chemin réseau doit changer rarement. Gardez peu de niveaux et réservez un dossier d'arrivée pour les nouveaux fichiers. Les catégories principales doivent être assez larges pour qu'une décision soit rapide ; les mots-clés et favoris complètent ensuite les dossiers.</p><p>Évitez d'utiliser le nom d'une application dans l'arborescence. Même si vous changez un jour de logiciel, vos dossiers doivent rester compréhensibles. Les fichiers ne devraient jamais dépendre d'une base propriétaire pour être retrouvés.</p>"""),
            ("Trier le NAS depuis Windows avec Prisme", """<p>Prisme ajoute le lecteur réseau comme une racine, aux côtés des disques locaux. Les aperçus évitent d'ouvrir chaque fichier ; jusqu'à 29 destinations reçoivent des touches. Un déplacement effectué dans le même partage reste généralement rapide, car le NAS change surtout l'emplacement logique du fichier.</p><p>Pour les doublons, Prisme compare les copies exactes et les vidéos réencodées, puis présente la meilleure version en tête. Faites les suppressions seulement après la fin de l'analyse et après vérification de la sauvegarde. Sur un Wi-Fi lent, privilégiez l'Ethernet pour la première indexation et les gros déplacements entre volumes.</p>"""),
            ("Regarder sans rendre le NAS public", """<p>Sur le réseau local, Prisme donne accès à la bibliothèque depuis un navigateur protégé par mot de passe et via Prisme TV. Vous pouvez ainsi parcourir, rechercher et regarder la collection sur plusieurs écrans sans la déplacer ni la publier sur un service extérieur.</p><p>Pour l'extérieur, préférez un VPN vers votre réseau plutôt qu'une ouverture de port directe. Désactivez UPnP si vous ne l'utilisez pas, activez l'authentification à deux facteurs du NAS et consultez les journaux de connexion.</p><div class="limites"><b class="limites-titre">Un NAS n'est pas une sauvegarde</b><p>Le RAID protège surtout contre la panne d'un disque. Il ne protège pas d'une suppression, d'un rançongiciel, d'une erreur de tri, d'un vol ou d'un sinistre. Gardez au moins une copie indépendante et déconnectée ou hors site.</p></div>"""),
        ],
        "cta_title": "Trier le NAS sans déplacer la bibliothèque sur le PC",
        "cta_text": "Prisme s'essaie 14 jours sur Windows. Ajoutez un dossier test du NAS avant d'ouvrir la racine complète.",
        "faq": [("Prisme peut-il organiser des vidéos directement sur un NAS ?", "Oui, si Windows accède au partage réseau avec les droits nécessaires. Ajoutez le lecteur ou le chemin réseau comme racine, puis testez d'abord les déplacements sur un petit dossier."), ("Faut-il un serveur multimédia pour regarder les vidéos du NAS ?", "Non pour un usage local avec Prisme. Son accès par navigateur et Prisme TV permettent de parcourir et regarder la bibliothèque sur le réseau sans installer un autre catalogue."), ("Le RAID sauvegarde-t-il la collection ?", "Non. Le RAID maintient surtout le service lors de la panne d'un disque. Une suppression ou un rançongiciel se réplique sur l'ensemble ; gardez une copie indépendante."), ("Comment éviter que la bibliothèque apparaisse sur la télé familiale ?", "Utilisez un partage et un compte dédiés, désactivez l'indexation multimédia automatique et n'ajoutez pas cette bibliothèque aux services multimédias utilisés par le foyer.")],
    },
    ("organize-porn-collection-nas", "en"): {
        "twin": "/adulte/organiser-collection-porno-nas/", "crumb": "Porn collection on a NAS",
        "h1": "How to organize a porn collection on a NAS without sacrificing privacy",
        "lead": "A NAS centralizes a large collection and makes it available to several devices, but it also introduces network, permission and backup decisions. This workflow keeps the files sortable from Windows, the folder tree understandable and the library from being exposed by accident.",
        "brief": "Create a dedicated share and account, map it as a Windows network drive and organize the files in real folders. Do not expose ports to the internet by default. RAID improves availability, but it never replaces a second independent copy.",
        "sections": [
            ("Prepare the NAS before adding media", """<ol><li>Create a dedicated share, separate from family photos and public folders.</li><li>Create a specific user with a long password and no guest access.</li><li>Disable global media indexing if it automatically publishes thumbnails to shared apps.</li><li>Enable snapshots when available, then prepare a backup to another disk or location.</li><li>Map the share as a Windows network drive using the dedicated account.</li></ol><p>Volume encryption mainly protects drives removed from the enclosure. Day-to-day privacy also depends on accounts, permissions and timely NAS updates.</p>"""),
            ("Choose a stable folder tree", """<p>The network path should rarely change. Keep the tree shallow and reserve an inbox folder for new files. Main categories should be broad enough for a fast decision; keywords and favorites can add detail without multiplying folders.</p><p>Avoid naming the tree after an application. Even if you change software one day, the folders should remain understandable. Files should never require a proprietary database just to be found again.</p>"""),
            ("Sort the NAS from Windows with Prisme", """<p>Prisme can add the network drive as a root alongside local disks. Hover previews avoid opening every file, and up to 29 destinations can be assigned to keys. Moving a file within one share is usually fast because the NAS mainly changes its logical location.</p><p>Prisme groups exact duplicates and re-encoded video variants, placing the best candidate first. Delete only after analysis is complete and the backup is verified. Use Ethernet for the first index and for large moves between volumes when Wi-Fi is slow.</p>"""),
            ("Watch without making the NAS public", """<p>On the local network, Prisme gives access to the selected library through a password-protected browser view and the Prisme TV app. You can browse, search and watch the collection on several screens without moving it or publishing it to an outside service.</p><p>For access away from home, prefer a VPN into your network over a directly exposed port. Disable UPnP when unused, enable two-factor authentication on the NAS and review connection logs.</p><div class="limites"><b class="limites-titre">A NAS is not a backup</b><p>RAID mainly protects against one drive failing. It does not protect against deletion, ransomware, a filing mistake, theft or fire. Keep at least one independent, disconnected or off-site copy.</p></div>"""),
        ],
        "cta_title": "Sort the NAS without copying the library to the PC",
        "cta_text": "Try Prisme on Windows for 14 days. Add one test folder from the NAS before opening the complete root.",
        "faq": [("Can Prisme organize videos directly on a NAS?", "Yes, when Windows can access the share with write permission. Add the mapped drive or network path as a root and test moves on a small folder first."), ("Do I need a media server to watch NAS videos?", "Not for local use with Prisme. Its browser access and Prisme TV let you browse and watch the library over the network without installing another catalog."), ("Does RAID back up the collection?", "No. RAID mostly keeps the NAS running after a drive failure. Deletion and ransomware affect the array too, so keep an independent copy."), ("How do I keep the library off the family TV?", "Use a dedicated share and account, disable automatic media indexing and do not add that library to household media services.")],
    },
}


# Les comparatifs adultes sont conservés comme notes de recherche internes,
# mais ne sont plus générés ni indexés. Le site public ne garde que les pages
# fondées sur les besoins concrets de l'utilisateur.
ADULT = {
    key: ADULT_RESEARCH[key]
    for key in (
        ("organiser-collection-porno-nas", "fr"),
        ("organize-porn-collection-nas", "en"),
    )
}


def faq_html(items, lang):
    title = "Questions fréquentes" if lang == "fr" else "Frequently asked questions"
    rows = "\n".join(
        f"          <details>\n            <summary>{q}</summary>\n            <div class=\"answer-body\"><p>{a}</p></div>\n          </details>"
        for q, a in items
    )
    return f"""      <section class="guide-faq">
        <h2>{title}</h2>
        <div class="faq">
{rows}
        </div>
      </section>"""


def article(data, lang, adult=False):
    home = "/adulte/" if adult and lang == "fr" else "/en/adult/" if adult else "/"
    guides = home + "guides/"
    labels = ("Prisme", "Guides")
    sections = "\n".join(f"      <h2>{title}</h2>\n{body}" for title, body in data["sections"])
    trial = home + ("telecharger.html" if lang == "fr" else "download.html") if adult else "/telecharger.html"
    trial_label = "Essayer gratuitement" if lang == "fr" else "Try it free"
    demo_label = "Voir les fonctionnalités" if lang == "fr" else "See the features"
    return f"""  <article class="guide">
    <div class="container prose">
      <nav class="ariane" aria-label="{'Fil d’Ariane' if lang == 'fr' else 'Breadcrumb'}"><ol><li><a href="{home}">{labels[0]}</a></li><li><a href="{guides}">{labels[1]}</a></li><li aria-current="page">{data['crumb']}</li></ol></nav>
      <h1>{data['h1']}</h1>
      <p class="lead">{data['lead']}</p>

      <div class="bref">
        <b class="bref-titre">{'En bref' if lang == 'fr' else 'In short'}</b>
        <p>{data['brief']}</p>
      </div>

{sections}

      <div class="cta-guide">
        <h2>{data['cta_title']}</h2>
        <p>{data['cta_text']}</p>
        <div class="cta-actions"><a class="btn btn-primary" href="{trial}" data-link="trial">{trial_label}</a><a class="btn btn-ghost" href="{home}#fonctionnalites">{demo_label}</a></div>
      </div>

{faq_html(data['faq'], lang)}
      <!-- voisins -->
      <nav class="voisins" aria-label="{'À lire aussi' if lang == 'fr' else 'Read next'}"></nav>
      <!-- /voisins -->
    </div>
  </article>"""


def replace_article(source, content):
    result, count = re.subn(r'  <article class="guide">.*?  </article>', content, source, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("gabarit d'article introuvable")
    return result


def write_public(slug, data):
    template = (ROOT / "alternative-picasa" / "index.html").read_text(encoding="utf-8")
    target = ROOT / slug / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(replace_article(template, article(data, "fr")), encoding="utf-8", newline="\n")


def write_adult(slug, lang, data):
    if lang == "fr":
        template_path = ROOT / "adulte" / "trier-videos-porno" / "index.html"
        target = ROOT / "adulte" / slug / "index.html"
        lang_label, lang_code = "EN", "en"
    else:
        template_path = ROOT / "en" / "adult" / "sort-porn-videos" / "index.html"
        target = ROOT / "en" / "adult" / slug / "index.html"
        lang_label, lang_code = "FR", "fr"
    source = template_path.read_text(encoding="utf-8")
    lang_link = f'<a class="nav-lang" href="{data["twin"]}?lang={lang_code}" hreflang="{lang_code}" lang="{lang_code}" title="{lang_label}">{lang_label}</a>'
    source, count = re.subn(r'<a class="nav-lang"[^>]*>.*?</a>', lang_link, source, count=1)
    if count != 1:
        raise RuntimeError(f"sélecteur de langue introuvable dans {template_path}")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(replace_article(source, article(data, lang, adult=True)), encoding="utf-8", newline="\n")


def normalize_age_gate():
    """Le titre de la modale n'appartient pas au plan de titres éditorial."""
    for base in (ROOT / "adulte", ROOT / "en" / "adult"):
        for target in base.rglob("*.html"):
            source = target.read_text(encoding="utf-8")
            source = source.replace('<h2 id="gate-title">', '<strong class="gate-title" id="gate-title">')
            source = source.replace('</h2>\n    <p id="gate-desc">', '</strong>\n    <p id="gate-desc">')
            target.write_text(source, encoding="utf-8", newline="\n")


def main():
    for slug, data in PUBLIC.items():
        write_public(slug, data)
    for (slug, lang), data in ADULT.items():
        write_adult(slug, lang, data)
    normalize_age_gate()
    print(f"{len(PUBLIC) + len(ADULT)} nouveaux guides générés ; titres de la modale d'âge normalisés")


if __name__ == "__main__":
    main()
