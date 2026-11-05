/**
 * Découpeur typographique accessible pour les titres (`[data-split-title]`).
 *
 * - Pose `aria-label` sur le titre avec le texte intégral pour les lecteurs d'écran
 * - Respecte les règles d'impression (`formatTitleTypography`) : aucune ligne ne se termine
 *   sur un article, une préposition, un mot de liaison ou une conjonction de coordination
 * - Enveloppe les mots et groupes insécables dans des masques `aria-hidden="true"` (`[data-split-mask]`)
 * - Préserve les balises `<em>` (texte en dégradé rose → violet) afin que chaque mot/caractère
 *   conserve son style chromatique pendant l'élévation GSAP (`yPercent: 118 → 0`).
 */
import gsap from 'gsap';
import { endsWithLiaisonWord, formatTitleTypography } from '@core/utils/text';
import { MOTION_PRESETS } from './motion';

function appendClusterContent(
  cluster: string,
  wordSpan: HTMLElement,
  charElements: HTMLElement[],
  isEm = false,
) {
  if (isEm) {
    const parts = cluster.split('\u00A0');
    parts.forEach((part, idx) => {
      if (part) {
        const maskSpan = document.createElement('span');
        maskSpan.dataset.splitMask = 'true';

        const charSpan = document.createElement('span');
        charSpan.dataset.splitChar = 'true';
        charSpan.className = 'split-char--em';
        charSpan.textContent = part;

        maskSpan.appendChild(charSpan);
        wordSpan.appendChild(maskSpan);
        charElements.push(charSpan);
      }
      if (idx < parts.length - 1) {
        const nbsp = document.createElement('span');
        nbsp.className = 'split-space';
        nbsp.textContent = '\u00A0';
        wordSpan.appendChild(nbsp);
      }
    });
    return;
  }

  for (const char of cluster) {
    if (char === '\u00A0') {
      const nbsp = document.createElement('span');
      nbsp.className = 'split-space';
      nbsp.textContent = '\u00A0';
      wordSpan.appendChild(nbsp);
      continue;
    }
    const maskSpan = document.createElement('span');
    maskSpan.dataset.splitMask = 'true';

    const charSpan = document.createElement('span');
    charSpan.dataset.splitChar = 'true';
    charSpan.textContent = char;

    maskSpan.appendChild(charSpan);
    wordSpan.appendChild(maskSpan);
    charElements.push(charSpan);
  }
}

function appendSplitWords(
  text: string,
  targetParent: HTMLElement,
  charElements: HTMLElement[],
  isEm = false,
) {
  // On découpe uniquement sur les espaces normaux : les groupes liés par \u00A0
  // ou \u2011 restent soudés dans le même .split-word (white-space: nowrap).
  const tokens = text.split(/([ \t\r\n]+)/);
  for (const token of tokens) {
    if (!token) continue;
    if (/^[ \t\r\n]+$/.test(token)) {
      const space = document.createElement('span');
      space.className = 'split-space';
      space.textContent = '\u00A0';
      targetParent.appendChild(space);
      continue;
    }

    const subWords = token.includes('-')
      ? token
          .split('-')
          .map((part, i, arr) => (i < arr.length - 1 ? `${part}-` : part))
          .filter(Boolean)
      : [token];

    for (const subWord of subWords) {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'split-word';
      appendClusterContent(subWord, wordSpan, charElements, isEm);
      targetParent.appendChild(wordSpan);
    }
  }
}

/** Découpe un titre en masques de caractères/mots tout en préservant les nœuds `<em>` et les liaisons insécables */
function splitTitleChars(element: HTMLElement): HTMLElement[] {
  if (element.dataset.textSplit === 'true') {
    return Array.from(element.querySelectorAll<HTMLElement>('[data-split-char]'));
  }

  const rawText = element.textContent?.replace(/\s+/g, ' ').trim() || '';
  if (!rawText) return [];

  if (!element.closest('[aria-hidden="true"]')) {
    element.setAttribute('aria-label', rawText);
  }
  element.dataset.textSplit = 'true';

  const wrapper = document.createElement('span');
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.className = 'split-wrapper';

  const charElements: HTMLElement[] = [];
  const childNodes = Array.from(element.childNodes);
  let pendingLiaisonPrefix: string | null = null;

  for (let i = 0; i < childNodes.length; i += 1) {
    const node = childNodes[i]!;
    const isLastNode = i === childNodes.length - 1;
    const nextNode = childNodes[i + 1];

    if (node.nodeType === Node.TEXT_NODE) {
      const rawNodeText = node.textContent || '';
      const formatted = formatTitleTypography(rawNodeText, { isPartial: !isLastNode });

      // Si ce nœud texte précède un <em> et se termine par un article/préposition/conjonction
      // (ex. "... avec un " avant "<em>Design System modulaire</em>"), on soude ce groupe final
      // au premier mot du <em> dans un même .split-word afin d'interdire tout retour à la ligne après "un".
      if (nextNode instanceof HTMLElement && endsWithLiaisonWord(rawNodeText)) {
        const trimmed = formatted.trimEnd();
        const lastSpaceIdx = trimmed.lastIndexOf(' ');
        if (lastSpaceIdx !== -1) {
          const headText = `${trimmed.slice(0, lastSpaceIdx + 1)}`;
          pendingLiaisonPrefix = trimmed.slice(lastSpaceIdx + 1);
          appendSplitWords(headText, wrapper, charElements, false);
        } else {
          pendingLiaisonPrefix = trimmed;
        }
      } else {
        appendSplitWords(formatted, wrapper, charElements, false);
      }
    } else if (node instanceof HTMLElement) {
      const isEm = node.tagName === 'EM';
      const rawEmText = (node.textContent || '').trim();

      if (pendingLiaisonPrefix && rawEmText) {
        const firstSpaceIdx = rawEmText.indexOf(' ');
        const firstEmWord = firstSpaceIdx !== -1 ? rawEmText.slice(0, firstSpaceIdx) : rawEmText;
        const restEmText = firstSpaceIdx !== -1 ? rawEmText.slice(firstSpaceIdx + 1) : '';

        // Groupe insécable soudant la liaison (texte blanc) et le 1er mot du <em> (dégradé)
        const bridgedWordSpan = document.createElement('span');
        bridgedWordSpan.className = 'split-word';
        appendClusterContent(`${pendingLiaisonPrefix}\u00A0`, bridgedWordSpan, charElements, false);

        const bridgedEm = document.createElement(node.tagName.toLowerCase());
        if (node.className) bridgedEm.className = node.className;
        appendClusterContent(
          formatTitleTypography(firstEmWord, { isPartial: true }),
          bridgedEm,
          charElements,
          isEm,
        );
        bridgedWordSpan.appendChild(bridgedEm);
        wrapper.appendChild(bridgedWordSpan);
        pendingLiaisonPrefix = null;

        if (restEmText) {
          const space = document.createElement('span');
          space.className = 'split-space';
          space.textContent = '\u00A0';
          wrapper.appendChild(space);

          const cloneContainer = document.createElement(node.tagName.toLowerCase());
          if (node.className) cloneContainer.className = node.className;
          appendSplitWords(
            formatTitleTypography(restEmText, { isPartial: !isLastNode }),
            cloneContainer,
            charElements,
            isEm,
          );
          wrapper.appendChild(cloneContainer);
        }
      } else {
        const cloneContainer = document.createElement(node.tagName.toLowerCase());
        if (node.className) cloneContainer.className = node.className;
        appendSplitWords(
          formatTitleTypography(node.textContent || '', { isPartial: !isLastNode }),
          cloneContainer,
          charElements,
          isEm,
        );
        wrapper.appendChild(cloneContainer);
      }
    }
  }

  element.replaceChildren(wrapper);
  return charElements;
}

/** Pose l'état initial masqué avant le premier paint (zéro-FOUC) */
export function prepareSplitTitle(titleEl: HTMLElement) {
  if (titleEl.dataset.splitReady === 'true') return;
  const chars = splitTitleChars(titleEl);
  if (chars.length > 0) {
    gsap.set(chars, { ...MOTION_PRESETS.splitTitle.chars.initial });
  }
  titleEl.dataset.splitReady = 'true';
}

/** Anime l'élévation des caractères/mots d'un titre dans une timeline ou de manière autonome */
export function animateSplitTitle(
  titleEl: HTMLElement,
  tl?: gsap.core.Timeline,
  at: number | string = 0,
): gsap.core.Timeline {
  const timeline = tl || gsap.timeline();
  const chars = splitTitleChars(titleEl);
  const { from, to } = MOTION_PRESETS.splitTitle.chars;

  if (chars.length > 0) {
    // Adapte le stagger à la longueur du titre pour garder une durée totale nerveuse (~0.55-0.8s)
    const dynamicStagger = Math.min(to.stagger, 0.42 / Math.max(chars.length, 1));
    timeline.fromTo(
      chars,
      { ...from },
      {
        ...to,
        stagger: dynamicStagger,
      },
      at,
    );
  }

  return timeline;
}
