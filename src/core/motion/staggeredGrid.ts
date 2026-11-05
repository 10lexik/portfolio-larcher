/**
 * Runner unifié pour les grilles de cartes en cascade staggée par rangée visuelle.
 *
 * - Regroupement dynamique par rangée visuelle via mesure statique (`documentTop`)
 * - Règle « 1 élément = 1 seul événement » :
 *   - Toute rangée présente dans le viewport initial (`top < viewportH`) entre dans la
 *     timeline de 1re vague (`introTl`) et ne reçoit AUCUN `ScrollTrigger`.
 *   - Toute rangée située sous la ligne de flottaison (`top >= viewportH`) reçoit un
 *     `ScrollTrigger` (`start: 'top bottom'`), avec `once: true` dans les sections `[data-stack]`
 *     et retour contrôlé (`onLeaveBack` + `onRefresh` gardés par `naturalTop >= window.innerHeight - 1`) ailleurs.
 *   - Tout `[data-reveal]` imbriqué dans un item de grille est neutralisé (`data-stagger-item="true"`)
 *     pour interdire toute double animation parent + enfant.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { documentTop } from './geometry';
import { MOTION_PRESETS, prefersReducedMotion } from './motion';
import { cancelDeferredReset, playSmartEntrance, resetOrDeferBelowFold } from './scrollEntrance';

gsap.registerPlugin(ScrollTrigger);

const STAGGER_GRID_SELECTOR = [
  '[data-stl-grid]',
  '[data-gsap-anim="staggered-cards"]',
  '.mosaic',
  '.bento',
  '.stats',
  '.grid-auto',
  '.cs-catalogue',
  '.variants',
  '.chain',
  '.cs-videos',
  '.about-roles',
  '.experience-list',
  '.ds-checks',
  '.timeline',
  '.home-hero__collage',
].join(', ');

function getGridItems(grid: HTMLElement): HTMLElement[] {
  return (Array.from(grid.children) as HTMLElement[]).filter(
    (child) =>
      child instanceof HTMLElement &&
      child.tagName !== 'SCRIPT' &&
      child.tagName !== 'STYLE' &&
      !child.classList.contains('proofs__row--head'),
  );
}

/** Regroupe les éléments d'une grille par rangée visuelle selon leur position statique (`documentTop`) */
function groupCardsByRow(items: HTMLElement[], threshold = 28): HTMLElement[][] {
  const rows: { top: number; items: HTMLElement[] }[] = [];
  items.forEach((item) => {
    const top = documentTop(item);
    const existing = rows.find((r) => Math.abs(r.top - top) < threshold);
    if (existing) {
      existing.items.push(item);
    } else {
      rows.push({ top, items: [item] });
    }
  });
  rows.sort((a, b) => a.top - b.top);
  return rows.map((r) => r.items);
}

/** Pose l'état masqué avant le premier paint (zéro-FOUC, sans géométrie) sur toutes les grilles */
export function prepareStaggeredGrids(root: ParentNode = document) {
  if (prefersReducedMotion()) return;
  const grids = root.querySelectorAll<HTMLElement>(STAGGER_GRID_SELECTOR);
  grids.forEach((grid) => {
    if (grid.dataset.staggerInit === 'true' || grid.offsetHeight === 0) return;
    if (grid.parentElement?.closest(STAGGER_GRID_SELECTOR)) return;
    const items = getGridItems(grid);
    if (!items.length) return;
    items.forEach((item) => {
      item.dataset.staggerItem = 'true';
      // Neutralise tout [data-reveal] imbriqué pour garantir 1 seul moteur par carte
      item.querySelectorAll<HTMLElement>('[data-reveal]').forEach((nested) => {
        nested.dataset.staggerItem = 'true';
      });
    });
    gsap.set(items, { autoAlpha: 0 });
  });
}

interface MeasuredRow {
  rowItems: HTMLElement[];
  rowTrigger: HTMLElement;
  rect: DOMRect;
  gridIndex: number;
  rowIndex: number;
  isStacked: boolean;
}

/** Initialise les grilles : 1re vague dans `introTl` pour le haut de page, `ScrollTrigger` sous le pli */
export function initAllStaggeredGrids(
  root: ParentNode = document,
  introTl?: gsap.core.Timeline,
  viewportH = typeof window !== 'undefined' ? window.innerHeight : 900,
): ScrollTrigger[] {
  if (prefersReducedMotion()) return [];
  const grids = Array.from(root.querySelectorAll<HTMLElement>(STAGGER_GRID_SELECTOR)).filter(
    (grid) =>
      grid.dataset.staggerInit !== 'true' &&
      grid.offsetHeight > 0 &&
      !grid.parentElement?.closest(STAGGER_GRID_SELECTOR),
  );
  if (!grids.length) return [];

  const { from, to, scroll } = MOTION_PRESETS.staggeredCards;
  const measuredRows: MeasuredRow[] = [];

  // Passe 1 (LECTURE PURE) : regroupe par rangée statique et mesure getBoundingClientRect()
  grids.forEach((grid, gridIndex) => {
    const items = getGridItems(grid);
    if (!items.length) return;
    grid.dataset.staggerInit = 'true';
    const isStacked = Boolean(grid.closest('[data-stack], [data-stack-reveal]'));

    items.forEach((item) => {
      item.dataset.staggerItem = 'true';
      item.querySelectorAll<HTMLElement>('[data-reveal]').forEach((nested) => {
        nested.dataset.staggerItem = 'true';
      });
    });

    const rows = groupCardsByRow(items);
    rows.forEach((rowItems, rowIndex) => {
      const rowTrigger = rowItems[0];
      if (!rowTrigger) return;
      measuredRows.push({
        rowItems,
        rowTrigger,
        rect: rowTrigger.getBoundingClientRect(),
        gridIndex,
        rowIndex,
        isStacked,
      });
    });
  });

  const allTriggers: ScrollTrigger[] = [];
  let waveRowCount = 0;

  // Passe 2 (ÉCRITURE PURE)
  measuredRows.forEach(({ rowItems, rowTrigger, rect, gridIndex, rowIndex, isStacked }) => {
    // Cas A : Rangée déjà au-dessus de l'écran (reload en milieu de page)
    if (rect.bottom <= 0) {
      gsap.set(rowItems, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        clearProps: 'transform,opacity,visibility',
      });
      return;
    }

    // Cas B : Rangée visible dans le viewport initial → 1re vague uniquement (AUCUN ScrollTrigger)
    if (rect.top < viewportH) {
      const tl = introTl || gsap.timeline();
      const at = 0.14 + waveRowCount * 0.08;
      waveRowCount += 1;
      tl.fromTo(
        rowItems,
        { ...from },
        {
          ...to,
          clearProps: 'transform',
        },
        at,
      );
      return;
    }

    // Cas C : Rangée sous la ligne de flottaison → ScrollTrigger indépendant
    const toVars: gsap.TweenVars = {
      ...to,
      clearProps: 'transform',
    };

    const resetRowOut = () => {
      gsap.killTweensOf(rowItems);
      gsap.set(rowItems, { autoAlpha: 0, x: 0, y: 0, scale: 1, clearProps: 'transform' });
    };

    if (isStacked) {
      allTriggers.push(
        ScrollTrigger.create({
          trigger: rowTrigger,
          start: scroll.start,
          end: scroll.end,
          once: true,
          id: `grid-${gridIndex}-r${rowIndex + 1}`,
          onEnter: () => playSmartEntrance(rowItems, from, toVars),
        }),
      );
    } else {
      allTriggers.push(
        ScrollTrigger.create({
          trigger: rowTrigger,
          start: scroll.start,
          end: scroll.end,
          id: `grid-${gridIndex}-r${rowIndex + 1}`,
          onEnter: (self) => {
            cancelDeferredReset(self);
            playSmartEntrance(rowItems, from, toVars);
          },
          onLeaveBack: (self) => {
            resetOrDeferBelowFold(self, rowTrigger, resetRowOut);
          },
        }),
      );
    }
  });

  return allTriggers;
}
