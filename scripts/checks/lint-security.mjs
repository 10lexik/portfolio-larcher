#!/usr/bin/env node
/**
 * lint:security — garde-fou automatisé de cybersécurité (AGENTS.md § 3).
 *
 * Vérifie mécaniquement à chaque exécution de `npm run check` :
 *  1. Liste blanche stricte des puits DOM (`{@html}`, `set:html`, `innerHTML`, `outerHTML`,
 *     `insertAdjacentHTML`, `document.write`, `eval`, `new Function`).
 *  2. Protection anti-tabnabbing (`rel="noopener noreferrer"` obligatoire sur tout `<a target="_blank">`).
 *  3. Parité cryptographique SHA-256 entre `<script is:inline>` (`Layout.astro` + pages HTML de `dist/`)
 *     et la directive `script-src` de `vercel.json`, ainsi que la présence des en-têtes HTTP critiques.
 *  4. Hygiène de `public/` (et `dist/` s'il est compilé) : zéro `.DS_Store`, `.env*`, `*.map`, clé privée,
 *     et validité RFC 9116 de `public/.well-known/security.txt`.
 *  5. Absence de divulgation de version framework (`<meta name="generator">`).
 *  6. Suite de tests unitaires sur `safeURL`, `safeExternalRel`, `sanitizeSvg` et `highlight`.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { safeExternalRel, safeURL, sanitizeSvg } from '../../src/core/utils/security.ts';
import { highlight } from '../../src/core/utils/highlight.ts';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const errors = [];

function walkFiles(dirAbs, predicate = () => true) {
  if (!existsSync(dirAbs)) return [];
  const out = [];
  for (const entry of readdirSync(dirAbs, { withFileTypes: true })) {
    const full = join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, predicate));
    } else if (predicate(full, entry.name)) {
      out.push(full);
    }
  }
  return out;
}

// 1. Liste blanche des puits DOM dans src/ et .storybook/
const ALLOWED_AT_HTML = new Map([
  ['src/ui/Button/Button.svelte', 2],
  ['src/ui/CodeBlock/CodeBlock.svelte', 1],
]);

const CODE_EXTS = new Set(['.ts', '.svelte', '.astro', '.mjs']);
const codeFiles = [
  ...walkFiles(join(ROOT, 'src'), (f) => CODE_EXTS.has(extname(f))),
  ...walkFiles(join(ROOT, '.storybook'), (f) => CODE_EXTS.has(extname(f))),
];

const FORBIDDEN_SINKS = [
  { name: 'set:html', re: /\bset:html\b/g },
  { name: 'innerHTML', re: /\.\s*innerHTML\s*=/g },
  { name: 'outerHTML', re: /\.\s*outerHTML\s*=/g },
  { name: 'insertAdjacentHTML', re: /\.\s*insertAdjacentHTML\s*\(/g },
  { name: 'document.write', re: /\bdocument\.write(?:ln)?\s*\(/g },
  { name: 'eval()', re: /\beval\s*\(/g },
  { name: 'new Function()', re: /\bnew\s+Function\s*\(/g },
];

for (const fileAbs of codeFiles) {
  const rel = relative(ROOT, fileAbs).replaceAll('\\', '/');
  const rawContent = readFileSync(fileAbs, 'utf8');
  const ext = extname(fileAbs);
  const withoutHtmlComments = rawContent.replace(/<!--[\s\S]*?-->/g, '');
  const withoutJsComments =
    ext === '.ts' || ext === '.mjs'
      ? rawContent.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '')
      : withoutHtmlComments;

  if (ext === '.svelte') {
    const atHtmlMatches = [...withoutHtmlComments.matchAll(/\{@html\b[^}]*\}/g)];
    const allowedCount = ALLOWED_AT_HTML.get(rel) ?? 0;
    if (atHtmlMatches.length !== allowedCount) {
      errors.push(
        `[puits DOM] ${rel} contient ${atHtmlMatches.length} occurrence(s) de {@html} (autorisé : ${allowedCount}).`,
      );
    }
    if (rel === 'src/ui/Button/Button.svelte') {
      for (const m of atHtmlMatches) {
        if (m[0] !== '{@html sanitizeSvg(icon)}') {
          errors.push(
            `[puits DOM] ${rel} doit passer exclusivement par {@html sanitizeSvg(icon)}.`,
          );
        }
      }
    }
  }

  for (const { name, re } of FORBIDDEN_SINKS) {
    re.lastIndex = 0;
    if (re.test(withoutJsComments)) {
      errors.push(`[puits DOM interdit] ${rel} utilise ${name}.`);
    }
  }

  if (/<meta\s+[^>]*name=["']generator["']/i.test(withoutHtmlComments)) {
    errors.push(
      `[divulgation version] ${rel} expose <meta name="generator"> (supprimer l'empreinte framework).`,
    );
  }
}

// 2. Garde anti-tabnabbing sur les balises natives <a ... target="_blank">
const templateFiles = walkFiles(join(ROOT, 'src'), (f) =>
  ['.svelte', '.astro'].includes(extname(f)),
);
for (const fileAbs of templateFiles) {
  const rel = relative(ROOT, fileAbs).replaceAll('\\', '/');
  const content = readFileSync(fileAbs, 'utf8');
  for (const match of content.matchAll(/<a\b([\s\S]*?)>/g)) {
    const attrs = match[1];
    if (!/target\s*=\s*["']_blank["']/.test(attrs)) continue;
    const hasSafeStaticRel =
      /rel\s*=\s*["'][^"']*\bnoopener\b[^"']*["']/.test(attrs) &&
      /rel\s*=\s*["'][^"']*\bnoreferrer\b[^"']*["']/.test(attrs);
    const hasDerivedSafeRel = /rel\s*=\s*\{resolvedRel\}/.test(attrs);
    if (!hasSafeStaticRel && !hasDerivedSafeRel) {
      errors.push(
        `[tabnabbing] ${rel} possède un <a target="_blank"> sans rel="noopener noreferrer".`,
      );
    }
  }
}

// 3. Vérification de vercel.json & parité SHA-256 des scripts inline CSP
const vercelPath = join(ROOT, 'vercel.json');
const vercelConfig = JSON.parse(readFileSync(vercelPath, 'utf8'));
const headerRules = vercelConfig.headers ?? [];
const rootRule = headerRules.find((r) => r.source === '/(.*)');
const sbWildcardRule = headerRules.find((r) => r.source === '/storybook/(.*)');

if (!rootRule) {
  errors.push('[vercel.json] Règle globale "/(.*)" introuvable dans headers.');
} else {
  const map = new Map(rootRule.headers.map((h) => [h.key.toLowerCase(), h.value]));
  const requiredKeys = [
    'strict-transport-security',
    'content-security-policy',
    'x-content-type-options',
    'x-frame-options',
    'referrer-policy',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy',
    'permissions-policy',
  ];
  for (const key of requiredKeys) {
    if (!map.get(key)) {
      errors.push(`[vercel.json] En-tête "${key}" manquant sur "/(.*)".`);
    }
  }
  if (map.get('x-frame-options') !== 'DENY') {
    errors.push('[vercel.json] X-Frame-Options sur "/(.*)" doit valoir "DENY".');
  }

  const csp = map.get('content-security-policy') ?? '';
  for (const needle of [
    "default-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ]) {
    if (!csp.includes(needle)) {
      errors.push(`[vercel.json] Directive CSP "${needle}" manquante sur "/(.*)".`);
    }
  }
  if (csp.includes("script-src 'self' 'unsafe-inline'") || csp.includes("'unsafe-eval'")) {
    errors.push(
      "[vercel.json] La CSP principale du portfolio ne doit autoriser ni 'unsafe-inline' ni 'unsafe-eval' dans script-src.",
    );
  }

  for (const fileAbs of templateFiles) {
    const rel = relative(ROOT, fileAbs).replaceAll('\\', '/');
    const content = readFileSync(fileAbs, 'utf8');
    for (const match of content.matchAll(
      /<script\b[^>]*\bis:inline\b[^>]*>([\s\S]*?)<\/script>/g,
    )) {
      const body = match[1];
      const digest = `sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}`;
      if (!csp.includes(`'${digest}'`)) {
        errors.push(
          `[CSP SHA-256] Le hash '${digest}' du <script is:inline> dans ${rel} est absent de script-src dans vercel.json.`,
        );
      }
    }
  }

  const distDir = join(ROOT, 'dist');
  if (existsSync(distDir)) {
    const builtHtmlFiles = walkFiles(distDir, (f) => {
      const rel = relative(distDir, f).replaceAll('\\', '/');
      return !rel.startsWith('storybook/') && f.endsWith('.html');
    });
    for (const htmlFile of builtHtmlFiles) {
      const rel = relative(ROOT, htmlFile).replaceAll('\\', '/');
      const html = readFileSync(htmlFile, 'utf8');
      for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        const body = match[2];
        if (!body.trim()) continue;
        const digest = `sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}`;
        if (!csp.includes(`'${digest}'`)) {
          errors.push(
            `[CSP dist] Script inline non autorisé dans ${rel} (hash attendu : '${digest}').`,
          );
        }
      }
    }
  }
}

if (!sbWildcardRule) {
  errors.push('[vercel.json] Règle dédiée "/storybook/(.*)" introuvable dans headers.');
} else {
  const sbMap = new Map(sbWildcardRule.headers.map((h) => [h.key.toLowerCase(), h.value]));
  if (sbMap.get('x-frame-options') !== 'SAMEORIGIN') {
    errors.push('[vercel.json] X-Frame-Options sur "/storybook/(.*)" doit valoir "SAMEORIGIN".');
  }
  if (!sbMap.get('x-robots-tag')?.includes('noindex')) {
    errors.push('[vercel.json] X-Robots-Tag "noindex" manquant sur "/storybook/(.*)".');
  }
}

// 4. Hygiène de public/ (et dist/) + conformité RFC 9116 de security.txt
function checkStaticTree(baseDir, label) {
  if (!existsSync(baseDir)) return;
  const files = walkFiles(baseDir);
  for (const fileAbs of files) {
    const relFromBase = relative(baseDir, fileAbs).replaceAll('\\', '/');
    if (relFromBase.startsWith('storybook/')) continue;
    const segments = relFromBase.split('/');
    const baseName = segments.at(-1) ?? '';

    const isWellKnownFile = segments[0] === '.well-known' && !baseName.startsWith('.');
    if (baseName.startsWith('.') && !isWellKnownFile) {
      errors.push(`[hygiène ${label}] Fichier caché interdit : ${label}/${relFromBase}`);
    }
    if (baseName === 'Thumbs.db' || /\.(?:map|pem|key|crt|p12|env)$/i.test(baseName)) {
      errors.push(`[hygiène ${label}] Artefact sensible interdit : ${label}/${relFromBase}`);
    }
  }
}

checkStaticTree(join(ROOT, 'public'), 'public');
checkStaticTree(join(ROOT, 'dist'), 'dist');

const securityTxtPath = join(ROOT, 'public/.well-known/security.txt');
if (!existsSync(securityTxtPath)) {
  errors.push('[security.txt] Fichier public/.well-known/security.txt manquant (RFC 9116).');
} else {
  const secTxt = readFileSync(securityTxtPath, 'utf8');
  if (!/^Contact:\s+https:\/\//m.test(secTxt)) {
    errors.push('[security.txt] Champ "Contact: https://..." manquant.');
  }
  if (
    !/^Canonical:\s+https:\/\/portfolio-larcher\.vercel\.app\/\.well-known\/security\.txt$/m.test(
      secTxt,
    )
  ) {
    errors.push('[security.txt] Champ "Canonical:" invalide ou manquant.');
  }
  const expiresMatch = /^Expires:\s+(\S+)$/m.exec(secTxt);
  if (!expiresMatch) {
    errors.push('[security.txt] Champ "Expires:" manquant.');
  } else {
    const expDate = Date.parse(expiresMatch[1]);
    if (Number.isNaN(expDate) || expDate <= Date.now()) {
      errors.push(`[security.txt] Date Expires expirée ou invalide : ${expiresMatch[1]}.`);
    }
  }
}

// 6. Suite unitaire de non-régression sur security.ts et highlight.ts
try {
  // URLs légitimes conservées
  assert.equal(safeURL('/veepee-ad-studio'), '/veepee-ad-studio');
  assert.equal(safeURL('#hero'), '#hero');
  assert.equal(
    safeURL('https://www.linkedin.com/in/legwarkshop'),
    'https://www.linkedin.com/in/legwarkshop',
  );
  assert.equal(safeURL('mailto:contact@example.com'), 'mailto:contact@example.com');
  assert.equal(safeURL('tel:+33102030405'), 'tel:+33102030405');

  // Contournements et schémas dangereux rejetés
  assert.equal(safeURL('//untrusted.example/path'), '');
  assert.equal(safeURL('/\\untrusted.example/path'), '');
  assert.equal(safeURL('\\untrusted.example/path'), '');
  assert.equal(safeURL('javascript:void(0)'), '');
  assert.equal(safeURL('   JaVaScRiPt:void(0)'), '');
  assert.equal(safeURL('java\tscript:void(0)'), '');
  assert.equal(safeURL('data:text/html,test'), '');
  assert.equal(safeURL('vbscript:test'), '');
  assert.equal(safeURL('blob:https://portfolio-larcher.vercel.app/123'), '');
  assert.equal(safeURL('https://user:secret@example.com/'), '');
  assert.equal(safeURL(''), '');
  assert.equal(safeURL(null), '');

  // Protection tabnabbing automatique
  assert.equal(safeExternalRel('_blank', undefined), 'noopener noreferrer');
  assert.equal(safeExternalRel('_blank', 'noopener'), 'noopener noreferrer');
  assert.equal(safeExternalRel('_blank', 'me'), 'me noopener noreferrer');
  assert.equal(safeExternalRel(undefined, undefined), undefined);
  assert.equal(safeExternalRel('_self', 'author'), 'author');

  // Liste blanche stricte SVG
  const validIcon =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3.5 8h9" stroke-linecap="round"/></svg>';
  const cleanedIcon = sanitizeSvg(validIcon);
  assert.ok(cleanedIcon.startsWith('<svg viewBox="0 0 16 16"'));
  assert.ok(cleanedIcon.includes('<path d="M3.5 8h9" stroke-linecap="round" />'));

  // Dégradé local url(#id) autorisé, url(https://...) externe bloqué
  const localGrad =
    '<svg viewBox="0 0 10 10"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff"/></linearGradient></defs><rect width="10" height="10" fill="url(#g)"/></svg>';
  assert.ok(sanitizeSvg(localGrad).includes('fill="url(#g)"'));
  const remoteUrlSvg =
    '<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="url(https://untrusted.example/track)"/></svg>';
  assert.ok(!sanitizeSvg(remoteUrlSvg).includes('untrusted.example'));

  // Élimination des balises non géométriques, SMIL, attributs événementiels et href
  const dirtySvg =
    '<svg viewBox="0 0 16 16" onload="noop" style="color:red" data-x="1"><script>noop()</script><animate onbegin="noop"/><set attributeName="href" to="x"/><use href="#x"/><foreignObject><div>txt</div></foreignObject><path d="M0 0h10" onclick="noop"/></svg>';
  const sanitizedDirty = sanitizeSvg(dirtySvg);
  assert.equal(sanitizedDirty, '<svg viewBox="0 0 16 16"><path d="M0 0h10" /></svg>');
  assert.equal(sanitizeSvg('<div>not an svg</div>'), '');
  assert.equal(sanitizeSvg('<svg viewBox="0 0 10 10"><g></svg>'), '');

  // Échappement complet sur 5 caractères dans highlight() sans corruption des entités numériques
  const highlighted = highlight(`const label = '<img alt="x" />';`);
  assert.ok(!highlighted.includes('<img'));
  assert.ok(highlighted.includes('&lt;img'));
  assert.ok(highlighted.includes('&quot;x&quot;'));
  assert.ok(highlighted.includes('&#39;'));
  assert.ok(!highlighted.includes('&#<span'));
} catch (err) {
  errors.push(`[tests unitaires security] ${err instanceof Error ? err.message : String(err)}`);
}

if (errors.length > 0) {
  console.error(`lint:security — ${errors.length} violation(s) de sécurité détectée(s) :\n`);
  for (const err of errors) {
    console.error(`  • ${err}`);
  }
  process.exit(1);
}

console.log(
  'lint:security — OK (puits DOM, tabnabbing, hash CSP SHA-256, hygiène public/, security.txt et tests unitaires conformes).',
);
