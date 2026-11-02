# Gouvernance & architecture — portfolio-larcher

Source de vérité normative du dépôt. Chaque règle ci-dessous est vérifiée automatiquement par `npm run check`.

## 1. Architecture en piliers

```text
src/
├── core/        # Socle : styles (tokens.css = source unique), motion, i18n, utilitaires, contenu global
├── ui/          # Primitives atomiques (un dossier = Nom.svelte + Nom.css + Nom.stories.ts)
├── blocks/      # Blocs génériques de composition (Stats, Bento, Quote, Split, Timeline…)
├── domains/     # Tranches verticales métier : work, about, navigation
├── layouts/     # Coquilles Astro (Layout, Section, Container) et templates de page
└── pages/       # Routage HTTP uniquement (60 lignes maximum, aucun balisage d'interface)
```

- **Flux unidirectionnel** : `core` → `ui` → `blocks` → `domains` → `layouts` → `pages`. Une couche inférieure n'importe jamais une couche supérieure.
- **Isolation des domaines** : `work` et `about` ne s'importent pas entre eux ; seule `navigation` compose le site.
- **Co-localisation** : le CSS, les stories et les types d'un composant vivent dans son dossier. Aucun `index.ts`.

## 2. Design System first

- `src/core/styles/tokens.css` est l'unique source de couleurs, ombres, courbes et tailles de texte.
- Aucune taille de texte, couleur ou ombre arbitraire dans les composants, aucun `transition-all`, aucun `@apply`, aucun `!important`.
- Mobile-first : styles par défaut mobiles, ajustements à partir de 768 px.
- Toute bande de section à fond thématique porte `data-theme` (le composant `Section` le pose).
- Les entrées au scroll passent par le contrat `data-reveal` (`src/core/motion/reveal.ts`).

## 3. Garde-fous automatisés (`npm run check`)

| Commande | Rôle |
| :--- | :--- |
| `astro check` | Typage strict des composants `.astro`, `.svelte` et `.ts` |
| `npm run typecheck:svelte` | `svelte-check` avec échec sur avertissement |
| `npm run lint` | ESLint (aucun `any`, aucune variable inutilisée) |
| `npm run lint:css` | Stylelint |
| `npm run lint:tokens` | Interdit valeurs en dur et pratiques proscrites |
| `npm run lint:themes` | Parité fond thématique ↔ `data-theme` |
| `npm run lint:arch` | Piliers, isolation, contrats de composants, minceur des routes |
| `npm run format:check` | Prettier |

## 4. Déploiement

Sortie statique (`dist/`) : `npm run build` produit le site Astro puis le Storybook dans `dist/storybook`.
