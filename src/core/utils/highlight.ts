/**
 * Coloration syntaxique minimale (SCSS / TypeScript / Vue) pour les extraits de code.
 * La tokenisation s'opère en une passe sur le code brut, puis chaque segment (texte libre
 * comme jeton coloré) subit un échappement HTML complet sur 5 caractères (`&`, `<`, `>`, `"`, `'`) :
 * la sortie est strictement sûre pour `{@html}`.
 */
const escapeHtml = (source: string): string =>
  source
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(\$[\w-]+)|('[^'\n]*'|"[^"\n]*")|(<\/?[A-Za-z][\w-]*)|\b(export|type|const|import|from|return|default)\b|(\b\d+(?:\.\d+)?(?:px|vw|vh|%)?)/g;

export function highlight(source: string): string {
  const chunks: string[] = [];
  let cursor = 0;

  for (const match of source.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      chunks.push(escapeHtml(source.slice(cursor, start)));
    }

    const [raw, comment, variable, str, tag, keyword, num] = match;
    const escaped = escapeHtml(raw);

    if (comment) chunks.push(`<span class="tok-c">${escaped}</span>`);
    else if (variable) chunks.push(`<span class="tok-v">${escaped}</span>`);
    else if (str) chunks.push(`<span class="tok-s">${escaped}</span>`);
    else if (tag) chunks.push(`<span class="tok-t">${escaped}</span>`);
    else if (keyword) chunks.push(`<span class="tok-k">${escaped}</span>`);
    else if (num) chunks.push(`<span class="tok-n">${escaped}</span>`);
    else chunks.push(escaped);

    cursor = start + raw.length;
  }

  if (cursor < source.length) {
    chunks.push(escapeHtml(source.slice(cursor)));
  }

  return chunks.join('');
}
