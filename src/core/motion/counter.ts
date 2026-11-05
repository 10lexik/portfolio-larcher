/**
 * Animation progressive des compteurs numériques (`[data-counter-value]`).
 *
 * Permet d'animer tous les `<Counter>` / `<Stats>` rendus en SSR sans hydrater aucun îlot Svelte
 * côté client (zéro remplacement DOM sur les grilles GSAP), tout en restant 100 % compatible
 * avec le montage client dans Storybook.
 */
import { prefersReducedMotion } from './motion';

interface ActiveCounter {
  frame: number;
  cleanup?: () => void;
}

const activeCounters = new WeakMap<HTMLElement, ActiveCounter>();
let sharedObserver: IntersectionObserver | null = null;

function animateCounter(el: HTMLElement): void {
  const textNode = el.querySelector<HTMLElement>('[data-counter-text]');
  if (!textNode) return;

  const target = Number.parseFloat(el.dataset.counterValue ?? '');
  if (!Number.isFinite(target)) return;

  const prefix = el.dataset.counterPrefix ?? '';
  const suffix = el.dataset.counterSuffix ?? '';
  const duration = Math.max(100, Number.parseFloat(el.dataset.counterDuration ?? '1400') || 1400);

  const prev = activeCounters.get(el);
  if (prev?.frame) cancelAnimationFrame(prev.frame);

  const start = performance.now();
  const state: ActiveCounter = { frame: 0 };
  activeCounters.set(el, state);

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const shown = Math.round(target * eased);
    textNode.textContent = `${prefix}${shown}${suffix}`;
    if (progress < 1) {
      state.frame = requestAnimationFrame(tick);
    } else {
      state.frame = 0;
    }
  };

  textNode.textContent = `${prefix}0${suffix}`;
  state.frame = requestAnimationFrame(tick);
}

function getObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          sharedObserver?.unobserve(el);
          animateCounter(el);
        }
      },
      { threshold: 0.35 },
    );
  }
  return sharedObserver;
}

/** Attache l'observateur de décompte à un élément `<Counter>` unique (SSR ou Storybook) */
export function bindCounterElement(el: HTMLElement): () => void {
  if (el.dataset.counterBound === 'true') {
    return () => {};
  }
  el.dataset.counterBound = 'true';

  if (prefersReducedMotion()) {
    return () => {};
  }

  const observer = getObserver();
  if (!observer) {
    return () => {};
  }

  const textNode = el.querySelector<HTMLElement>('[data-counter-text]');
  const prefix = el.dataset.counterPrefix ?? '';
  const suffix = el.dataset.counterSuffix ?? '';
  if (textNode) {
    textNode.textContent = `${prefix}0${suffix}`;
  }

  observer.observe(el);

  const cleanup = () => {
    observer.unobserve(el);
    const state = activeCounters.get(el);
    if (state?.frame) cancelAnimationFrame(state.frame);
    delete el.dataset.counterBound;
  };
  activeCounters.set(el, { frame: 0, cleanup });
  return cleanup;
}

/** Découvre et initialise tous les compteurs `[data-counter-value]` présents sous `root` */
export function initCounters(root: ParentNode = document): void {
  if (typeof window === 'undefined') return;
  const counters = root.querySelectorAll<HTMLElement>('[data-counter-value]');
  counters.forEach((el) => {
    bindCounterElement(el);
  });
}
