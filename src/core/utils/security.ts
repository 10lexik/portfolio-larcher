/**
 * Utilitaires de sécurité et d'assainissement (Anti-XSS, Safe URLs & Tabnabbing Guard).
 * Module pur sans dépendance externe, compatible SSR (Node) et navigateur.
 * Disponible via l'alias transversal @core/utils/security.
 */

const SYNTHETIC_BASE_ORIGIN = 'https://portfolio.internal';
const MAX_SVG_LENGTH = 16_384;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F]/;
const SCHEME_PREFIX_RE = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

const ALLOWED_PROTOCOLS = new Set(['https:', 'http:', 'mailto:', 'tel:']);

const ALLOWED_SVG_TAGS = new Set([
  'svg',
  'g',
  'path',
  'circle',
  'ellipse',
  'rect',
  'line',
  'polyline',
  'polygon',
  'defs',
  'linearGradient',
  'radialGradient',
  'stop',
  'clipPath',
  'mask',
]);

const VOID_SVG_TAGS = new Set([
  'path',
  'circle',
  'ellipse',
  'rect',
  'line',
  'polyline',
  'polygon',
  'stop',
]);

const ALLOWED_SVG_ATTRS = new Set([
  'xmlns',
  'viewBox',
  'width',
  'height',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'd',
  'points',
  'fill',
  'fill-rule',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-miterlimit',
  'stroke-opacity',
  'opacity',
  'transform',
  'gradientUnits',
  'gradientTransform',
  'spreadMethod',
  'offset',
  'stop-color',
  'stop-opacity',
  'clip-path',
  'clip-rule',
  'mask',
  'id',
  'class',
  'aria-hidden',
  'focusable',
]);

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  colon: ':',
  tab: '\t',
  newline: '\n',
};

/**
 * Valide et normalise une URL à destination d'un attribut `href`.
 * - Bloque les pseudo-protocoles (`javascript:`, `data:`, `vbscript:`, `blob:`, `file:`).
 * - Bloque les URLs relatives au protocole (`//evil.example`, `/\evil.example`, `\evil.example`).
 * - Bloque les caractères de contrôle ASCII et les identifiants intégrés (`https://user@host`).
 * - Préserve tels quels les fragments (`#ancre`) et les chemins relatifs internes sains.
 */
export function safeURL(rawUrl: string | null | undefined): string {
  if (typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) return '';

  if (trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('\\')) {
    return '';
  }

  if (trimmed.startsWith('#')) {
    return trimmed;
  }

  try {
    if (SCHEME_PREFIX_RE.test(trimmed)) {
      const parsed = new URL(trimmed);
      if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return '';
      if (parsed.username || parsed.password) return '';
      return parsed.href;
    }

    const resolved = new URL(trimmed, SYNTHETIC_BASE_ORIGIN);
    if (resolved.origin !== SYNTHETIC_BASE_ORIGIN) return '';
    if (resolved.username || resolved.password) return '';
    return trimmed;
  } catch {
    return '';
  }
}

/**
 * Garantit la présence de `noopener noreferrer` dès lors qu'un lien s'ouvre dans un nouvel onglet (`_blank`).
 */
export function safeExternalRel(
  target: string | null | undefined,
  rel: string | null | undefined,
): string | undefined {
  const tokens = (rel ?? '').trim().split(/\s+/).filter(Boolean);

  if (target === '_blank') {
    if (!tokens.includes('noopener')) tokens.push('noopener');
    if (!tokens.includes('noreferrer')) tokens.push('noreferrer');
  }

  return tokens.length > 0 ? tokens.join(' ') : undefined;
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(?:#(\d+)|#x([0-9a-fA-F]+)|([a-zA-Z]+));?/g, (full, dec, hex, named) => {
    if (dec !== undefined) {
      const code = Number.parseInt(dec, 10);
      return code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : full;
    }
    if (hex !== undefined) {
      const code = Number.parseInt(hex, 16);
      return code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : full;
    }
    if (named !== undefined) {
      const mapped = NAMED_ENTITIES[named.toLowerCase()];
      return mapped ?? full;
    }
    return full;
  });
}

function escapeAttrValue(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sanitizeSvgAttrValue(attrName: string, rawVal: string): string | null {
  const decoded = decodeHtmlEntities(rawVal).trim();
  if (CONTROL_CHARS_RE.test(decoded) || decoded.includes('<') || decoded.includes('>')) {
    return null;
  }

  const compactLower = decoded.replace(/\s+/g, '').toLowerCase();
  if (
    compactLower.includes('javascript:') ||
    compactLower.includes('vbscript:') ||
    compactLower.includes('data:') ||
    compactLower.includes('file:') ||
    compactLower.includes('expression(')
  ) {
    return null;
  }

  if (compactLower.includes('url(')) {
    if (!/^url\(#[A-Za-z][\w-]*\)$/.test(decoded)) {
      return null;
    }
  }

  if (attrName === 'id') {
    if (!/^[A-Za-z][\w-]*$/.test(decoded)) return null;
  } else if (attrName === 'class') {
    if (!/^[A-Za-z0-9_\s-]+$/.test(decoded)) return null;
  } else if (attrName === 'xmlns') {
    if (decoded !== 'http://www.w3.org/2000/svg') return null;
  }

  return escapeAttrValue(decoded);
}

function serializeAllowedAttrs(rawAttrs: string): string {
  const attrRe = /([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  const serialized: string[] = [];
  const seen = new Set<string>();

  for (const match of rawAttrs.matchAll(attrRe)) {
    const name = match[1];
    const rawVal = match[2] ?? match[3] ?? match[4] ?? '';
    if (!name || !ALLOWED_SVG_ATTRS.has(name) || seen.has(name)) continue;

    const cleanVal = sanitizeSvgAttrValue(name, rawVal);
    if (cleanVal === null) continue;

    seen.add(name);
    serialized.push(`${name}="${cleanVal}"`);
  }

  return serialized.length > 0 ? ` ${serialized.join(' ')}` : '';
}

/**
 * Assainit une icône SVG vectorielle par **liste blanche stricte et reconstruction canonique**.
 * - N'autorise que les balises géométriques/dégradés (`ALLOWED_SVG_TAGS`) et attributs sûrs (`ALLOWED_SVG_ATTRS`).
 * - Élimine intégralement `<script>`, `<foreignObject>`, `<animate>`, `<set>`, `<use>`, `<style>`,
 *   les gestionnaires `on*`, `href` / `xlink:href`, les entités HTML obfusquées et les `url(...)` externes.
 * - N'émet aucun nœud texte ni sous-chaîne brute issue de l'entrée (zéro surface mXSS).
 */
export function sanitizeSvg(svgRaw: string | null | undefined): string {
  if (typeof svgRaw !== 'string') return '';
  const trimmed = svgRaw.trim();
  if (!trimmed || trimmed.length > MAX_SVG_LENGTH) return '';

  // Nettoyage préalable des commentaires XML, sections CDATA et instructions de traitement
  const stripped = trimmed
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/gi, '')
    .replace(/<![^>]*>/g, '')
    .replace(/<\?[\s\S]*?\?>/g, '');

  const stack: string[] = [];
  const output: string[] = [];
  let skipDepth = 0;
  let rootSeen = false;
  let cursor = 0;

  while (cursor < stripped.length) {
    const openIdx = stripped.indexOf('<', cursor);
    if (openIdx === -1) break;
    const closeIdx = stripped.indexOf('>', openIdx + 1);
    if (closeIdx === -1) return '';

    const rawTag = stripped.slice(openIdx + 1, closeIdx).trim();
    cursor = closeIdx + 1;
    if (!rawTag) continue;

    const isClosing = rawTag.startsWith('/');
    const tagBody = isClosing ? rawTag.slice(1).trim() : rawTag;
    const selfClosing = !isClosing && tagBody.endsWith('/');
    const cleanBody = selfClosing ? tagBody.slice(0, -1).trim() : tagBody;

    const nameMatch = /^([A-Za-z][\w:-]*)/.exec(cleanBody);
    if (!nameMatch) continue;
    const tagName = nameMatch[1];

    if (!rootSeen) {
      if (isClosing || tagName !== 'svg') return '';
      rootSeen = true;
    }

    if (skipDepth > 0) {
      if (isClosing) {
        skipDepth -= 1;
      } else if (!selfClosing) {
        skipDepth += 1;
      }
      continue;
    }

    if (isClosing) {
      if (!ALLOWED_SVG_TAGS.has(tagName)) continue;
      const expected = stack.pop();
      if (expected !== tagName) return '';
      output.push(`</${tagName}>`);
      if (stack.length === 0) break;
      continue;
    }

    if (!ALLOWED_SVG_TAGS.has(tagName)) {
      if (!selfClosing) {
        skipDepth = 1;
      }
      continue;
    }

    const rawAttrs = cleanBody.slice(tagName.length);
    const attrsOut = serializeAllowedAttrs(rawAttrs);

    if (selfClosing || VOID_SVG_TAGS.has(tagName)) {
      if (tagName === 'svg') {
        output.push(`<svg${attrsOut}></svg>`);
        break;
      }
      output.push(`<${tagName}${attrsOut} />`);
    } else {
      stack.push(tagName);
      output.push(`<${tagName}${attrsOut}>`);
    }
  }

  if (!rootSeen || stack.length > 0 || skipDepth > 0) {
    return '';
  }

  return output.join('');
}
