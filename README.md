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
  badges/             # vignettes de certifications (PNG transparent)
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

## Certifications et badges

Section « Certifications » (`data/site.json` → `certifications`). Elle n'accueille que des titres
**obtenus** : une certification en cours n'a ni badge ni page de vérification, elle reste mentionnée
dans les faits de « À propos ».

```json
{
  "name":   { "fr": "…", "en": "…" },
  "issuer": "Google Cloud",
  "year":   "2026",
  "image":  "images/badges/mon-badge.png",
  "url":    "https://www.credly.com/badges/<identifiant>/public_url"
}
```

- **`url`** — le lien de preuve. Sur Credly : ouvrir le badge → *Share* → *Link*.
  Tant qu'il est vide, la carte affiche « Lien à ajouter » plutôt qu'un bouton mort.
- **`image`** — optionnelle. Déposer le fichier dans `images/badges/` (PNG **transparent**, ~200×200).
  Sans image, la carte se replie sur les initiales de l'émetteur.
- **`certifications.profileUrl`** — profil Credly public. S'il est renseigné, un lien
  « Voir tous les badges sur Credly » s'affiche sous la liste ; sinon rien ne s'affiche.

Les vignettes s'affichent **en couleur**. Les badges Google Cloud sont des cartes-certificats dont le
texte est le seul contenu : désaturés, ils deviennent illisibles, et la lisibilité prime ici sur
l'homogénéité chromatique. Le traitement reste piloté par deux tokens CSS, `--badge-filter` et
`--badge-hover`, aujourd'hui à `none` — y remettre `grayscale(1)` suffit à rétablir la désaturation.

La vignette occupe toute la largeur de la carte, dans un cadre au filet d'un cheveu. Au-delà de quatre
badges, la rangée défile horizontalement dans son propre conteneur — la page, elle, ne défile jamais
de côté.

## Photo de profil

Deux fichiers, deux cadrages :

- `about.portrait` → `images/profile.webp` (800×1000, ratio 4:5) pour « À propos ». **Image détourée**
  (PNG/WebP à canal alpha) : elle est posée directement sur le fond de page, sans cadre. Affichée en
  niveaux de gris, elle repasse en couleur au survol.

  Un halo très diffus est dessiné derrière elle, **uniquement en thème sombre** (token
  `--portrait-halo`, à `0` en clair et `1` en sombre) : sans lui une chevelure foncée se confond avec
  le fond. Ce halo déborde volontairement de sa boîte, d'où le `overflow-x: clip` sur `.about` qui
  l'empêche de provoquer un défilement horizontal de la page.

  Pour remplacer le portrait, fournir une image **déjà détourée**. Une photo avec fond fonctionne
  aussi, mais elle réaffichera un rectangle.
- `about.avatar` → `images/profile-avatar.webp` (400×400) pour la pastille ronde du pied de page. Un
  cadrage carré dédié évite que le recadrage automatique du cercle ne rogne le haut du crâne. Si le
  champ est absent, la pastille retombe sur `portrait`.

**Si un fichier manque**, un emplacement neutre s'affiche à sa place — la page ne casse pas.

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
