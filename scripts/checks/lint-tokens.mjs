#!/usr/bin/env node
/**
 * lint:tokens — garde-fou du Design System (AGENTS.md § 2 « Design System First »).
 *
 * Périmètre : tout `src/` (composants, layouts, pages, lib, styles, stories), hors types générés.
 * Interdit :
 *  - tailles de texte en dur : échelle native (text-xs … text-9xl, avec ou sans préfixe md:, hover:…)
 *    et valeurs arbitraires (text-[10px], text-[8vw], text-[clamp(…)], text-[calc(…)])
 *    → utilitaires natifs `text-fluid-*` / variables CSS `var(--text-fluid-*)` (`tokens.css`) ;
 *  - couleurs du thème en valeur arbitraire : bg-[var(--color-brand-dark)] → bg-brand-dark ;
 *  - ombres arbitraires shadow-[…] → ombres du thème (shadow-brutal-*) ;
 *  - `transition-all` (cibles GSAP), `@apply` ;
 *  - `!important` : CSS `!important` et modificateur Tailwind `!` (préfixe `!text-white` ou suffixe `text-white!`) ;
 *  - dans les fichiers `.css` (hors `src/core/styles/tokens.css`, source de vérité unique) :
 *    couleurs `#hex`, `rgb(...)` / `rgba(...)` et courbes `cubic-bezier(...)` en dur.
 *
 * Migration progressive : les occurrences existantes sont figées par fichier dans
 * `scripts/checks/token-baseline.json`. Le script échoue si un fichier dépasse sa ligne de base
 * (ou si un nouveau fichier en contient). Après une migration, `npm run lint:tokens -- --update`
 * abaisse la ligne de base ; elle ne peut jamais augmenter par ce biais.
 * `--init` refige l'existant (uniquement lors d'un changement de périmètre ou de règles, en revue).
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const BASELINE_PATH = join(ROOT, 'scripts/checks/token-baseline.json');
const SCAN_DIRS = ['src'];
const EXCLUDED = [/^src\/core\/cms\/sanity\//];
const EXTENSIONS = new Set(['.svelte', '.astro', '.ts', '.css']);

const NATIVE_SCALE = /(?<![\w-])(?:[\w-]+:)*text-(?:xs|sm|base|lg|xl|[2-9]xl)(?![\w-])/g;
const ARBITRARY_SIZE =
  /(?<![\w-])(?:[\w-]+:)*text-\[(?:\d[\d.]*(?:px|rem|em|vw|vh|dvh|svh|%)|(?:clamp|calc|min|max)\([^\]]*\))\]/g;
const FORBIDDEN_TRANSITION_ALL = /(?<![\w-])(?:[\w-]+:)*transition-all(?![\w-])/g;
const FORBIDDEN_ARBITRARY_SHADOW = /(?<![\w-])(?:[\w-]+:)*shadow-\[[^\]]+\]/g;
const FORBIDDEN_AT_APPLY = /@apply\b/g;
const FORBIDDEN_THEME_COLOR_VAR =
  /(?<![\w-])(?:[\w-]+:)*[a-z]+(?:-[a-z]+)*-\[var\(--color-[\w-]+\)\]/g;
const FORBIDDEN_CSS_IMPORTANT = /!important\b/g;
const UTILITY =
  '(?:text|bg|border|font|leading|tracking|shadow|rounded|opacity|z|p[xytrbl]?|m[xytrbl]?|w|h|min-[wh]|max-[wh]|top|left|right|bottom|inset|translate|scale|rotate|overflow|object|flex|grid|gap|block|inline|hidden|visible|invisible|pointer-events|transition|duration|ease|delay)';
const FORBIDDEN_TW_IMPORTANT = new RegExp(
  `(?<![\\w!])!(?:[\\w-]+:)*${UTILITY}-[\\w./\\[\\]()%-]+(?![\\w-])|(?<![\\w-])(?:[\\w-]+:)*${UTILITY}-[\\w./\\[\\]()%-]*[\\w\\])]!(?![\\w=])`,
  'g',
);

// Règles SSOT additionnelles sur tous les fichiers .css hors src/core/styles/tokens.css
const FORBIDDEN_CSS_HEX = /#[0-9a-fA-F]{3,8}\b/g;
const FORBIDDEN_CSS_RGB = /\brgba?\s*\(/g;
const FORBIDDEN_CSS_CUBIC_BEZIER = /\bcubic-bezier\s*\(/g;
const FORBIDDEN_CSS_FONT_SIZE = /\bfont-size\s*:\s*(?![^;]*var\(|inherit\b|100%\b|0\b)[^;]+/g;
const CSS_VAR_DEF = /(--[a-zA-Z0-9_-]+)\s*:/g;
const CSS_VAR_REF_NO_FALLBACK = /var\(\s*(--[a-zA-Z0-9_-]+)\s*\)/g;

const update = process.argv.includes('--update');
const init = process.argv.includes('--init');

function walk(dir) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).flatMap((entry) => {
    const path = join(abs, entry);
    if (statSync(path).isDirectory()) return walk(relative(ROOT, path));
    return EXTENSIONS.has(extname(path)) ? [path] : [];
  });
}

const allFiles = SCAN_DIRS.flatMap(walk).filter(
  (file) => !EXCLUDED.some((re) => re.test(relative(ROOT, file))),
);

const definedCssVars = new Set();
for (const file of allFiles) {
  const content = readFileSync(file, 'utf8');
  for (const match of content.matchAll(CSS_VAR_DEF)) {
    definedCssVars.add(match[1]);
  }
}

function scan(file) {
  const rel = relative(ROOT, file).replaceAll('\\', '/');
  const isCss = extname(file) === '.css';
  const isNonTokenCss = isCss && rel !== 'src/core/styles/tokens.css';
  const lines = readFileSync(file, 'utf8').split('\n');
  const hits = [];
  const patterns = [
    NATIVE_SCALE,
    ARBITRARY_SIZE,
    FORBIDDEN_TRANSITION_ALL,
    FORBIDDEN_ARBITRARY_SHADOW,
    FORBIDDEN_AT_APPLY,
    FORBIDDEN_THEME_COLOR_VAR,
    FORBIDDEN_CSS_IMPORTANT,
    FORBIDDEN_TW_IMPORTANT,
    ...(isNonTokenCss
      ? [FORBIDDEN_CSS_HEX, FORBIDDEN_CSS_RGB, FORBIDDEN_CSS_CUBIC_BEZIER, FORBIDDEN_CSS_FONT_SIZE]
      : []),
  ];
  lines.forEach((line, index) => {
    for (const re of patterns) {
      for (const match of line.matchAll(re)) hits.push({ line: index + 1, token: match[0] });
    }
    if (isCss) {
      for (const match of line.matchAll(CSS_VAR_REF_NO_FALLBACK)) {
        if (!definedCssVars.has(match[1])) {
          hits.push({ line: index + 1, token: `${match[0]} (variable non définie)` });
        }
      }
    }
  });
  return hits;
}

const results = new Map();
for (const file of allFiles) {
  const hits = scan(file);
  if (hits.length) results.set(relative(ROOT, file), hits);
}

const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) : null;
const total = [...results.values()].reduce((sum, hits) => sum + hits.length, 0);
let effective = baseline ?? {};

if (update || init || !baseline) {
  const next = {};
  for (const [file, hits] of [...results.entries()].sort()) {
    // Création initiale : on fige l'existant. Ensuite la ligne de base ne peut que baisser,
    // et un fichier absent de la ligne de base reste à 0.
    next[file] = baseline && !init ? Math.min(hits.length, baseline[file] ?? 0) : hits.length;
  }
  writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`);
  effective = next;
  console.log(
    `lint:tokens — ligne de base écrite (${total} occurrence(s) dans ${results.size} fichier(s)).`,
  );
}

const regressions = [];
for (const [file, hits] of results) {
  const allowed = effective[file] ?? 0;
  if (hits.length > allowed) regressions.push({ file, hits, allowed });
}

if (regressions.length) {
  console.error("lint:tokens — classes hors Design System (voir l'en-tête du script) :\n");
  for (const { file, hits, allowed } of regressions) {
    console.error(`  ${file} : ${hits.length} occurrence(s), ligne de base ${allowed}`);
    hits.forEach(({ line, token }) => console.error(`    L${line}  ${token}`));
  }
  process.exit(1);
}

console.log(`lint:tokens — OK (${total} occurrence(s) héritées sous ligne de base, 0 nouvelle).`);
