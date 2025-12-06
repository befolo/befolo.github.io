# Portfolio Landry BEFOLO

Site statique (compatible GitHub Pages) présentant le profil, les services SIG/Data et les projets de Landry BEFOLO. Tout le contenu métier est séparé du code pour faciliter les mises à jour.

## Aperçu
- Page principale : `index.html` (sections Hero, Services, À propos, Démo dashboard, Projets, Parcours, CV express, Contact).
- Page détail projet : `project.html?id=<slug>` (rendu à partir des données JSON).
- Aucune étape de build : HTML/JS/CSS statiques + CDN (Tailwind, Swiper, Leaflet, Chart.js).

## Structure
```
assets/
  css/styles.css       # styles globaux
  js/app.js            # rendu dynamique à partir des JSON
data/
  site.json            # contenus généraux (textes, KPIs, CV, coordonnées, etc.)
  projects.json        # fiches projets (cartes + pages détail)
images/                # toutes les images en .webp
index.html             # page d'accueil
project.html           # page de détail projet (paramètre ?id=slug)
```

## Modifier le contenu (sans toucher au code)
- Textes/sections : éditer `data/site.json` (hero, services, about, dashboard, parcours, CV, contact).
- Projets : éditer `data/projects.json` (tags, résumé, carousel, bullets, slug).
- Images : placer les visuels en `.webp` dans `images/` puis référencer le chemin dans les JSON.

## Ajouter un projet
1) Ajouter une image `.webp` dans `images/`.
2) Ajouter un objet dans `data/projects.json` avec `slug`, `title`, `summary`, `tags`, `image`, `carousel`, `details`.
3) Accéder à `project.html?id=<slug>` pour vérifier la page détail.

## Contrainte GitHub Pages
- Tout est statique, aucune dépendance build. Les CDN restent côté client.
- Vérifier que les chemins relatifs (`assets/`, `data/`, `images/`) sont préservés lors du déploiement.

## Tests rapides
- Ouvrir `index.html` localement ou via Pages et contrôler : menu, cartes Leaflet, graphiques, carrousels.
- Tester un détail projet : `project.html?id=idg-douala`.
