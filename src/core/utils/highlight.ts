/**
 * Coloration syntaxique minimale (SCSS / TypeScript / Vue) pour les extraits de code.
 * Le texte est échappé avant toute insertion de balise : la sortie est sûre pour `{@html}`.
 */
const escapeMarkup = (source: string): string =>
  source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(\$[\w-]+)|('[^'\n]*'|"[^"\n]*")|(&lt;\/?[A-Za-z][\w-]*)|\b(export|type|const|import|from|return|default)\b|(\b\d+(?:\.\d+)?(?:px|vw|vh|%)?)/g;

export function highlight(source: string): string {
  return escapeMarkup(source).replace(
    TOKEN,
    (match, comment, variable, string, tag, keyword, number) => {
      if (comment) return `<span class="tok-c">${match}</span>`;
      if (variable) return `<span class="tok-v">${match}</span>`;
      if (string) return `<span class="tok-s">${match}</span>`;
      if (tag) return `<span class="tok-t">${match}</span>`;
      if (keyword) return `<span class="tok-k">${match}</span>`;
      if (number) return `<span class="tok-n">${match}</span>`;
      return match;
    },
  );
}
