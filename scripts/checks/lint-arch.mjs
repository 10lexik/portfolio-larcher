#!/usr/bin/env node
/**
 * lint:arch — garde-fou architectural automatisé (AGENTS.md § 2 « Architecture & Co-localisation »).
 *
 * Vérifie à chaque build :
 *  1. Absence des anciens dossiers bannis (`src/components`, `src/lib`, `src/design-system`, `src/types`, `src/styles`).
 *  2. Hiérarchie unidirectionnelle stricte des couches :
 *     `core` → `ui` → `blocks` → `domains` → `layouts` / `pages`.
 *  3. Isolation totale entre les domaines métier verticaux (`work`, `about`) :
 *     aucun domaine métier ne peut importer depuis un autre domaine métier (seul `navigation`, coquille
 *     globale du site, peut composer les domaines).
 *  4. Contrat de dossier composant : tout sous-dossier de composant dans `src/ui/<Nom>`,
 *     `src/blocks/<Nom>` et `src/domains/<domaine>/<Nom>` contient `<Nom>.svelte`, `<Nom>.css`
 *     et `<Nom>.stories.ts` (ou un unique `<Nom>.astro` pour un composant de rendu serveur), et aucun `index.ts`.
 *  5. Minceur des routes Astro dans `src/pages/` (<= 80 lignes pour les routes de domaine, <= 170 lignes
 *     pour les routes d'assemblage racine).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SRC = join(ROOT, 'src');

const FORBIDDEN_LEGACY_DIRS = [
  'src/components',
  'src/lib',
  'src/design-system',
  'src/types',
  'src/styles',
];

const VERTICAL_DOMAINS = new Set(['work', 'about']);
const SSR_DOMAIN_VIEWS = new Map([
  ['Detail', ['.astro', '.css']],
  ['Index', ['.astro']],
]);

const errors = [];

// 1. Dossiers bannis
for (const legacyDir of FORBIDDEN_LEGACY_DIRS) {
  if (existsSync(join(ROOT, legacyDir))) {
    errors.push(
      `[dossier banni] ${legacyDir} ne doit plus exister (migré vers src/{core,ui,blocks,domains}).`,
    );
  }
}

function walkFiles(dir, exts = new Set(['.ts', '.svelte', '.astro', '.css'])) {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full.endsWith('src/core/cms/sanity')) continue;
      files.push(...walkFiles(full, exts));
    } else if (exts.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function resolveImportToSrcRel(specifier, importerAbs) {
  if (specifier.startsWith('@core/')) return `src/core/${specifier.slice('@core/'.length)}`;
  if (specifier.startsWith('@ui/')) return `src/ui/${specifier.slice('@ui/'.length)}`;
  if (specifier.startsWith('@blocks/')) return `src/blocks/${specifier.slice('@blocks/'.length)}`;
  if (specifier.startsWith('@domains/'))
    return `src/domains/${specifier.slice('@domains/'.length)}`;
  if (specifier.startsWith('@layouts/'))
    return `src/layouts/${specifier.slice('@layouts/'.length)}`;
  if (specifier.startsWith('@data/')) return `src/data/${specifier.slice('@data/'.length)}`;
  if (specifier.startsWith('.')) {
    const resolved = resolve(dirname(importerAbs), specifier);
    const rel = relative(ROOT, resolved).replaceAll('\\', '/');
    return rel.startsWith('src/') ? rel : null;
  }
  return null;
}

function classifyFile(srcRel) {
  if (srcRel.endsWith('.stories.ts')) return { layer: 'stories', domain: null };
  const parts = srcRel.split('/');
  const top = parts[1];
  if (top === 'data') return { layer: 'data', domain: null };
  if (top === 'core') {
    if (parts[2] === 'stories') return { layer: 'stories', domain: null };
    return { layer: 'core', domain: null };
  }
  if (top === 'ui') return { layer: 'ui', domain: null };
  if (top === 'blocks') return { layer: 'blocks', domain: null };
  if (top === 'domains') return { layer: 'domains', domain: parts[2] ?? null };
  if (top === 'layouts') {
    const isPrimitiveWrapper =
      srcRel === 'src/layouts/Section.astro' || srcRel === 'src/layouts/Container.astro';
    return { layer: isPrimitiveWrapper ? 'layout-primitive' : 'layouts', domain: null };
  }
  if (top === 'pages') return { layer: 'pages', domain: null };
  return { layer: 'other', domain: null };
}

// 2 & 3. Vérification du graphe d'imports et de l'isolation inter-domaines
const IMPORT_RE =
  /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]|@import\s+['"]([^'"]+)['"]/g;

for (const fileAbs of walkFiles(SRC)) {
  const srcRel = relative(ROOT, fileAbs).replaceAll('\\', '/');
  // Exceptions structurelles :
  // - src/core/i18n/fr.ts agrège les dictionnaires *.i18n.ts co-localisés par domaine
  // - src/core/styles/global.css agrège les feuilles CSS globales
  if (srcRel === 'src/core/i18n/fr.ts' || srcRel === 'src/core/styles/global.css') continue;

  const fromInfo = classifyFile(srcRel);
  const content = readFileSync(fileAbs, 'utf8');

  for (const match of content.matchAll(IMPORT_RE)) {
    const spec = match[1] ?? match[2];
    if (!spec) continue;
    const targetRel = resolveImportToSrcRel(spec, fileAbs);
    if (!targetRel) continue;
    const toInfo = classifyFile(targetRel);

    if (fromInfo.layer === 'core') {
      if (toInfo.layer !== 'core' && toInfo.layer !== 'data') {
        errors.push(`[couche core] ${srcRel} importe "${spec}" (${toInfo.layer}) — interdit.`);
      }
    } else if (fromInfo.layer === 'ui') {
      if (!['core', 'data', 'ui'].includes(toInfo.layer)) {
        errors.push(`[couche ui] ${srcRel} importe "${spec}" (${toInfo.layer}) — interdit.`);
      }
    } else if (fromInfo.layer === 'blocks') {
      if (!['core', 'data', 'ui', 'blocks', 'layout-primitive'].includes(toInfo.layer)) {
        errors.push(`[couche blocks] ${srcRel} importe "${spec}" (${toInfo.layer}) — interdit.`);
      }
    } else if (fromInfo.layer === 'domains') {
      if (!['core', 'data', 'ui', 'blocks', 'domains', 'layout-primitive'].includes(toInfo.layer)) {
        errors.push(`[couche domains] ${srcRel} importe "${spec}" (${toInfo.layer}) — interdit.`);
      }
      if (
        toInfo.layer === 'domains' &&
        VERTICAL_DOMAINS.has(fromInfo.domain) &&
        toInfo.domain !== fromInfo.domain
      ) {
        errors.push(
          `[isolation domaine] ${srcRel} (domaine "${fromInfo.domain}") importe "${spec}" (domaine "${toInfo.domain}") — import croisé interdit.`,
        );
      }
    }
  }
}

// 4. Contrat de dossier composant
function checkComponentParentDir(parentRel) {
  const parentAbs = join(ROOT, parentRel);
  if (!existsSync(parentAbs)) return;
  for (const entry of readdirSync(parentAbs, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const compName = entry.name;
    const compRel = `${parentRel}/${compName}`;
    const compAbs = join(parentAbs, compName);

    if (existsSync(join(compAbs, 'index.ts'))) {
      errors.push(
        `[contrat composant] ${compRel}/index.ts est interdit (utiliser des imports explicites).`,
      );
    }

    const ssrExts = SSR_DOMAIN_VIEWS.get(compName);
    if (ssrExts) {
      for (const ext of ssrExts) {
        if (!existsSync(join(compAbs, `${compName}${ext}`))) {
          errors.push(`[contrat vue SSR] ${compRel}/${compName}${ext} est manquant.`);
        }
      }
      continue;
    }

    // Composant Astro pur (rendu serveur, sans îlot) : le fichier `<Nom>.astro` suffit
    if (existsSync(join(compAbs, `${compName}.astro`))) continue;

    for (const ext of ['.svelte', '.css', '.stories.ts']) {
      if (!existsSync(join(compAbs, `${compName}${ext}`))) {
        errors.push(`[contrat composant] ${compRel}/${compName}${ext} est manquant.`);
      }
    }
  }
}

checkComponentParentDir('src/ui');
checkComponentParentDir('src/blocks');
for (const domain of ['work', 'about', 'navigation']) {
  checkComponentParentDir(`src/domains/${domain}`);
}

// 5. Minceur des pages Astro dans src/pages/ (zéro balisage UI en dur : <= 60 lignes)
for (const pageAbs of walkFiles(join(SRC, 'pages'), new Set(['.astro']))) {
  const pageRel = relative(ROOT, pageAbs).replaceAll('\\', '/');
  const lines = readFileSync(pageAbs, 'utf8').split('\n').length;
  const maxLines = 60;
  if (lines > maxLines) {
    errors.push(
      `[route trop épaisse] ${pageRel} contient ${lines} lignes (max autorisé : ${maxLines}). Extraire la vue dans src/domains/ ou src/layouts/templates/.`,
    );
  }
}

if (errors.length > 0) {
  console.error(`lint:arch — ${errors.length} violation(s) d'architecture détectée(s) :\n`);
  for (const err of errors) {
    console.error(`  • ${err}`);
  }
  process.exit(1);
}

console.log(
  'lint:arch — OK (couches, isolation des domaines, contrats de composants et routes conformes).',
);
