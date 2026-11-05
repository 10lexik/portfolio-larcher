# Gwennaël Larcher — Portfolio & Design System

Bilingual (`FR` / `EN`) technical portfolio & live Design System built with **Astro 5**, **Svelte 5**, **Tailwind CSS 4**, **GSAP 3**, and **Storybook 10**.

- **Case Study 01 — Veepee Ad Studio (`/base-vue-3`)**: 32-component modular Design System powering 300+ brand campaigns across 13 European markets.
- **Case Study 02 — Design System & Automated Governance**: 4-pillar unidirectional architecture, single-source tokens, 5 GSAP motion engines, and 9 automated quality gates.
- **Interactive Storybook**: 67 documented stories audited against WCAG 2.1 AA (`/storybook/index.html`).

---

## Architecture (`src/`)

```text
src/
├── core/        # Foundation: tokens.css (SSOT), GSAP motion engines, i18n (fr/en), procedural grain, utilities
├── ui/          # Atomic primitives (each co-locates <Name>.svelte + <Name>.css + <Name>.stories.ts)
├── blocks/      # Composable editorial blocks (Stats, Bento, Quote, Split, Timeline, ComponentTree, CaseInsight)
├── domains/     # Vertical business slices: work, about, navigation (strictly isolated)
├── layouts/     # Astro shells (Layout, Section, Container) and localized page templates
└── pages/       # Thin HTTP routing shells (FR at /... and EN at /en/..., <= 60 lines, zero UI markup)
```

- **Unidirectional dependency flow**: `core → ui → blocks → domains → layouts → pages`. Lower layers never import from higher layers.
- **Domain isolation**: `work` and `about` never import from each other; only `navigation` and page templates compose them.
- **Typed Bilingual i18n (`fr` / `en`)**: Zero hardcoded copy in `.astro` or `.svelte` templates. Shared UI labels live in `src/core/i18n/` (`fr.ts`, `en.ts`, `t.ts`) with compile-time key parity (`Record<UiLabelKey, string>`), and structured page content is typed per domain (`getVeepeeContent(locale)`, `getDesignSystemContent(locale)`, `getProfileContent(locale)`).

---

## Development & Quality Gates

```bash
npm install
npm run dev          # Local dev server (http://localhost:4321)
npm run storybook    # Storybook workbench (http://localhost:6006)
npm run check        # Run all 10 automated quality & security gates
npm run build        # Static build (dist/ + dist/storybook/)
```

### Automated Quality Gates (`npm run check`)

| Command | Scope |
| :--- | :--- |
| `astro check` | Strict TypeScript checking across `.astro`, `.svelte`, and `.ts` |
| `npm run typecheck:svelte` | `svelte-check` configured to fail on warnings |
| `npm run lint` | ESLint (zero `any`, zero unused variables) |
| `npm run lint:css` | Stylelint across CSS, Astro, and Svelte |
| `npm run lint:tokens` | Bans hardcoded font sizes, colors, shadows, and `@apply` / `!important` |
| `npm run lint:themes` | Enforces parity between themed section backgrounds and `data-theme` |
| `npm run lint:arch` | Verifies pillar hierarchy, domain isolation, co-location contracts, and thin routes |
| `npm run lint:security` | Enforces DOM sink allowlist, CSP SHA-256 parity, anti-tabnabbing, `public/` hygiene, and `security.ts` unit tests |
| `npm run lint:dead` | Knip dead-code, unused export, and dependency check |
| `npm run format:check` | Prettier formatting check |
