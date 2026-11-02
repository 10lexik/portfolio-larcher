#!/usr/bin/env node
/**
 * lint:themes — contrat `data-theme` (AGENTS.md, contraste du header).
 *
 * Le header adapte sa couleur en lisant UNIQUEMENT l'attribut `data-theme` (dark | raised)
 * des bandes pleine largeur (`<section>`, `<header>`, composant `<Section>`). Ce script échoue si une
 * de ces balises reçoit un fond du thème sans porter `data-theme` :
 *  - classe BEM de section/header dont la feuille `.css` pose `background-color: var(--color-brand-dark|primary|alt|light)` ;
 *  - classe utilitaire directe `bg-brand-dark|green|red|light`.
 * `<Section theme=…>` (Section.astro) pose l'attribut lui-même : il est conforme par construction.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SCAN_DIRS = ['src/ui', 'src/blocks', 'src/domains', 'src/layouts', 'src/pages'];
const SRC_DIR = join(ROOT, 'src');
const THEME_BG_UTILITY = /(?<![\w:/-])bg-brand-(dark|primary|alt|light)(?![\w/-])/;
const THEME_BG_CSS = /background(?:-color)?\s*:\s*var\(--color-brand-(?:dark|primary|alt|light)\)/;

function walk(dir, exts = ['.svelte', '.astro']) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return walk(path, exts);
    return exts.includes(extname(path)) ? [path] : [];
  });
}

/**
 * Classes BEM de racine ou d'en-tête de section dont la règle CSS pose un fond thématique.
 */
function themedBemClasses() {
  const classes = new Set();
  for (const file of walk(SRC_DIR, ['.css'])) {
    if (file.endsWith('tokens.css')) continue;
    const src = readFileSync(file, 'utf8');
    // Repère les blocs racine (.foo { ... }) ou sous-éléments d'en-tête (.foo__header { ... })
    const ruleRe = /([.&][\w-]+)\s*\{([^{}]*)\}/g;
    for (const m of src.matchAll(ruleRe)) {
      const selector = m[1].replace(/^[.&]+/, '');
      const body = m[2];
      if (THEME_BG_CSS.test(body)) {
        // On surveille les blocs de section/page/header (hors sous-éléments internes de cartes/boutons/pills)
        if (
          selector === 'ds-section' ||
          selector.startsWith('ds-section--') ||
          selector.endsWith('__header') ||
          selector.startsWith('hero') ||
          selector.startsWith('footer') ||
          selector.startsWith('cta-banner') ||
          selector.startsWith('newsletter') ||
          selector.startsWith('featured') ||
          selector.startsWith('stats-section')
        ) {
          classes.add(selector);
        }
      }
    }
  }
  return classes;
}

const watchedClasses = themedBemClasses();
const errors = [];
for (const file of SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)))) {
  const src = readFileSync(file, 'utf8');
  const tagRe = /<(section|header)\b([\s\S]*?)>/g;
  for (const m of src.matchAll(tagRe)) {
    const attrs = m[2];
    if (/data-theme\s*=/.test(attrs)) continue;
    const direct = THEME_BG_UTILITY.test(attrs);
    const matchedBem = [...watchedClasses].find((cls) =>
      new RegExp(`(?<![\\w-])${cls}(?![\\w-])`).test(attrs),
    );
    if (direct || matchedBem) {
      const line = src.slice(0, m.index).split('\n').length;
      errors.push(
        `  ${relative(ROOT, file)}:${line}  <${m[1]}> ${matchedBem ? `classe .${matchedBem}` : 'bg-brand-*'} sans data-theme`,
      );
    }
  }
}

if (errors.length) {
  console.error('lint:themes — bandes à fond thématique sans attribut data-theme :\n');
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`lint:themes — OK (${watchedClasses.size} classes BEM à fond thématique surveillées).`);
