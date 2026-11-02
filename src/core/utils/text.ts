const LIAISON_WORDS = new Set([
  // Français — articles et déterminants
  'un',
  'une',
  'le',
  'la',
  'les',
  'des',
  'du',
  'de',
  'ce',
  'cet',
  'cette',
  'ces',
  'son',
  'sa',
  'ses',
  'mon',
  'ma',
  'mes',
  'ton',
  'ta',
  'tes',
  'nos',
  'vos',
  'leur',
  'leurs',
  'chaque',
  'tout',
  'toute',
  'tous',
  'toutes',
  'aucun',
  'aucune',
  'nul',
  'nulle',
  'quel',
  'quelle',
  'quels',
  'quelles',
  'même',
  'mêmes',
  'seul',
  'seule',
  'seuls',
  'seules',
  'propre',
  'propres',
  // Français — prépositions et mots de liaison
  'à',
  'au',
  'aux',
  'en',
  'par',
  'pour',
  'sur',
  'sous',
  'dans',
  'avec',
  'sans',
  'vers',
  'chez',
  'entre',
  'contre',
  'depuis',
  'pendant',
  'selon',
  'malgré',
  'via',
  'dès',
  'hors',
  'comme',
  'jusqu’à',
  'jusqu’au',
  'jusqu’aux',
  // Français — conjonctions de coordination/subordination, pronoms et adverbes courts
  'et',
  'ou',
  'où',
  'ni',
  'mais',
  'or',
  'donc',
  'car',
  'que',
  'qui',
  'dont',
  'quand',
  'si',
  'ne',
  'pas',
  'plus',
  'moins',
  'très',
  'trop',
  'peu',
  'bien',
  'je',
  'tu',
  'il',
  'ils',
  'elle',
  'elles',
  'on',
  'nous',
  'vous',
  'se',
  'y',
  // Français — adjectifs numéraux courts
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  // Anglais — articles, déterminants, prépositions, conjonctions et numéraux courts
  'a',
  'an',
  'the',
  'this',
  'that',
  'these',
  'those',
  'my',
  'our',
  'your',
  'his',
  'her',
  'its',
  'their',
  'each',
  'every',
  'no',
  'any',
  'some',
  'all',
  'both',
  'same',
  'single',
  'own',
  'to',
  'in',
  'into',
  'on',
  'onto',
  'at',
  'by',
  'for',
  'of',
  'with',
  'without',
  'from',
  'over',
  'under',
  'between',
  'among',
  'through',
  'across',
  'after',
  'before',
  'during',
  'since',
  'until',
  'upon',
  'within',
  'as',
  'per',
  'and',
  'or',
  'nor',
  'but',
  'yet',
  'so',
  'if',
  'when',
  'while',
  'where',
  'who',
  'whom',
  'whose',
  'which',
  'how',
  'why',
  'not',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
]);

function decodeHTML(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&rsquo;/gi, '’')
    .replace(/&lsquo;/gi, '‘')
    .replace(/&rdquo;/gi, '”')
    .replace(/&ldquo;/gi, '“')
    .replace(/&laquo;/gi, '«')
    .replace(/&raquo;/gi, '»')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&hellip;/gi, '…')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');
}

function isLiaisonToken(token: string): boolean {
  if (!token || /[,:;.)\]»"—–-]$/.test(token)) return false;
  const subParts = token.split('\u00A0');
  const lastPart = subParts[subParts.length - 1] ?? '';
  const cleaned = lastPart.replace(/^[([«"“‘']+/, '').toLowerCase();
  if (!cleaned) return false;
  if (/^\d+$/.test(cleaned)) return true;
  return LIAISON_WORDS.has(cleaned);
}

/**
 * Indique si un segment de titre se termine par un article, une préposition
 * ou une conjonction de coordination (utile lorsque le mot suivant est dans un `<em>`).
 */
export function endsWithLiaisonWord(str: string | null | undefined): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  const parts = trimmed.split(/\s+/);
  const lastWord = parts[parts.length - 1] ?? '';
  return isLiaisonToken(lastWord);
}

/**
 * Applique les règles d'impression typographique aux titres :
 * - Remplace les traits d'union internes par des traits d'union insécables (`\u2011`)
 * - Lie les termes composés (`Design System`, `Case Study`, `Vue 3`, `Svelte 5`…)
 * - Interdit tout retour à la ligne après un article, une préposition, un mot de liaison
 *   ou une conjonction de coordination via des espaces insécables (`\u00A0`)
 * - Évite les mots veufs/orphelins isolés en fin de titre
 */
export function formatTitleTypography(
  str: string | null | undefined,
  options: { isPartial?: boolean } = {},
): string {
  if (!str) return '';

  const hasLeadingSpace = /^\s/.test(str);
  const hasTrailingSpace = /\s$/.test(str);

  const normalized = decodeHTML(str)
    .replace(/([A-Za-zÀ-ÖØ-öø-ÿ0-9])-([A-Za-zÀ-ÖØ-öø-ÿ0-9])/g, '$1\u2011$2')
    .replace(/\b(Design)\s+(System|Systems)\b/g, '$1\u00A0$2')
    .replace(/\b(Case)\s+(Study|Studies)\b/g, '$1\u00A0$2')
    .replace(/\b(Vue|Svelte|Tailwind|Storybook)\s+(\d+(?:\.\d+)?)\b/g, '$1\u00A0$2');

  const rawWords = normalized.trim().split(/ +/).filter(Boolean);
  if (rawWords.length === 0) return '';

  const clusters: string[] = [];
  let i = 0;

  while (i < rawWords.length) {
    let current = rawWords[i]!;
    while (
      i + 1 < rawWords.length &&
      isLiaisonToken(current) &&
      current.length + 1 + rawWords[i + 1]!.length <= 24
    ) {
      current = `${current}\u00A0${rawWords[i + 1]!}`;
      i += 1;
    }
    clusters.push(current);
    i += 1;
  }

  // Anti-orphelin en fin de titre : soude les deux derniers groupes s'ils restent compacts
  if (!options.isPartial && clusters.length >= 2) {
    const prev = clusters[clusters.length - 2]!;
    const last = clusters[clusters.length - 1]!;
    if (!/[,:;.)\]»"—–]$/.test(prev) && prev.length + 1 + last.length <= 25) {
      clusters.splice(clusters.length - 2, 2, `${prev}\u00A0${last}`);
    }
  }

  let result = clusters.join(' ');
  if (hasLeadingSpace) result = ` ${result}`;
  if (hasTrailingSpace) result = `${result} `;
  return result;
}

export function splitTitle(title: string | null | undefined): {
  mainTitle: string;
  subTitle: string | null;
} {
  if (!title) return { mainTitle: '', subTitle: null };

  const titleStr = decodeHTML(title).trim();

  // 1. Coupe naturelle par ponctuation (deux-points, tirets, barres, virgules)
  const match = titleStr.match(/(\s:|:\s| - | – | — | \| |, )/);
  if (match) {
    return {
      mainTitle: formatTitleTypography(titleStr.substring(0, match.index).trim()),
      subTitle: formatTitleTypography(titleStr.substring(match.index! + match[0].length).trim()),
    };
  }

  // 2. Coupe forcée si le titre est très long et n'a aucune ponctuation
  if (titleStr.length > 55) {
    // On cherche une préposition ou un mot de liaison après les 30 premiers caractères
    const searchArea = titleStr.substring(30);
    const fallbackMatch = searchArea.match(
      /\s+(par|pour|sur|dans|avec|sans|vers|lors de|mis en|à la|au|aux|et|ou|mais|donc|car|contre|chez|sous|depuis|envers)\s+/i,
    );

    if (fallbackMatch) {
      const splitIndex = 30 + fallbackMatch.index! + 1;
      return {
        mainTitle: formatTitleTypography(titleStr.substring(0, splitIndex).trim()),
        subTitle: formatTitleTypography(titleStr.substring(splitIndex).trim()),
      };
    }

    // 3. Dernier recours : Couper à l'espace le plus proche du milieu
    const midPoint = Math.floor(titleStr.length / 2);
    const spaceIndex = titleStr.indexOf(' ', midPoint);
    if (spaceIndex !== -1) {
      return {
        mainTitle: formatTitleTypography(titleStr.substring(0, spaceIndex).trim()),
        subTitle: formatTitleTypography(titleStr.substring(spaceIndex).trim()),
      };
    }
  }

  // Si le titre est court et n'a pas de ponctuation, on le laisse tel quel
  return {
    mainTitle: formatTitleTypography(titleStr),
    subTitle: null,
  };
}
