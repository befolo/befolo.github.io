# Portfolio — Landry Befolo

Site statique servi par GitHub Pages. Positionnement : **Ingénieur Géospatial, Data, Cloud & IA**.
Le contenu métier est entièrement séparé du code : tout se modifie depuis `data/*.json`, sans toucher au HTML ni au JS.

## Aperçu

- `index.html` — page unique : hero, À propos, Stack, Observatoire, Projets, Parcours, Contact.
- `project.html?id=<slug>` — étude de cas, rendue depuis `data/projects.json`.
- **Aucune étape de build.** Le déploiement consiste à servir le dépôt tel quel.

Design : palette quasi-monochrome froide, **modes clair et sombre** avec bascule, un seul accent (bleu acier).
Le hero est un canvas 2D natif : courbes de niveau (le terrain) surmontées d'une orbite satellite avec sa trace au sol.

## Structure

```
assets/
  css/styles.css      # design system complet (tokens clair/sombre + composants)
  js/hero-viz.js      # canvas du hero, sans dépendance
  js/app.js           # i18n, thème, rendu depuis les JSON
data/
  site.json           # tous les contenus hors projets
  projects.json       # études de cas
images/               # visuels en .webp
index.html
project.html
sitemap.xml           # à mettre à jour à l'ajout d'un projet
robots.txt
```

Dépendances externes (CDN, côté client uniquement) : Google Fonts, **Leaflet** (carte de l'observatoire, `index.html`)
et **Swiper** (carrousel, `project.html`). Rien d'autre — pas de framework CSS, pas de bibliothèque de graphiques :
le graphique en barres est en CSS et les icônes sont des SVG inline.

## Modifier le contenu

Tous les champs de texte destinés à l'affichage suivent le schéma bilingue :

```json
"heading": { "fr": "Texte français", "en": "English text" }
```

Les valeurs non textuelles (chemins d'images, coordonnées, couleurs, noms d'outils comme `PostGIS`) restent
des chaînes simples, partagées par les deux langues. Un champ laissé en chaîne simple continue de fonctionner :
il s'affiche tel quel dans les deux langues.

- **Textes du site** → `data/site.json` (`meta`, `nav`, `hero`, `about`, `stack`, `dashboard`, `parcours`, `contact`).
- **Études de cas** → `data/projects.json`.
- **Titre du hero** → `hero.loop` est la liste des mots qui défilent (`Géospatial → Data → Cloud → IA`).

## Ajouter un projet

1. Déposer le visuel en `.webp` dans `images/`.
2. Ajouter un objet dans `data/projects.json` avec `slug`, `title`, `summary`, `tags`, `image`, `imageAlt`,
   `carousel` et `details` (`client`, `role`, `period`, `bullets`). Les champs de texte prennent la forme `{ "fr": …, "en": … }`.
3. Ajouter l'URL correspondante dans `sitemap.xml` :
   `https://befolo.github.io/project.html?id=<slug>`.
4. Vérifier la page : `project.html?id=<slug>`.

## Photo de profil

`data/site.json` → `about.portrait` pointe vers `images/profile.webp` (portrait, ~800×1000).
**Tant que le fichier n'existe pas**, un emplacement neutre s'affiche à sa place, dans la section À propos
comme dans le pied de page — la page ne casse pas.

## Thème et langue

- Le thème suit la préférence système par défaut ; la bascule enregistre le choix dans `localStorage`.
  Les tuiles Leaflet et le canvas du hero suivent le thème actif.
- La langue est détectée depuis `localStorage`, puis `navigator.language`, sinon français.

Les deux réglages sont tolérants aux navigateurs qui bloquent le stockage (navigation privée) : la page
fonctionne, seule la persistance est perdue.

## SEO

- Balises `title`, `description`, Open Graph et Twitter Card mises à jour dynamiquement selon la langue
  et, sur `project.html`, selon le projet affiché.
- `link[rel=canonical]` pointe vers l'URL complète avec le paramètre `?id=` : chaque étude de cas est
  une page distincte, pas un doublon.
- Données structurées JSON-LD : `Person` sur l'accueil, `BreadcrumbList` + `CreativeWork` sur les études de cas.

## Contrainte GitHub Pages

Tout est statique, aucune étape de build, aucun workflow CI. Conserver les chemins relatifs
(`assets/`, `data/`, `images/`) tels quels au déploiement.

## Tests rapides

```bash
python3 -m http.server 8000
```

Puis contrôler : bascule clair/sombre (y compris en mode « système », sans choix explicite), bascule FR/EN
et sa persistance après rechargement, carte de l'observatoire, compteurs animés, carrousel sur
`project.html?id=idg-douala`, et le rendu à 375 px de large.
