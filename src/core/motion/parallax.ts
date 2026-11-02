/**
 * Parallaxes d'images (`[data-parallax]`).
 *
 * - S'applique exclusivement aux conteneurs balisés `[data-parallax]` qui ne portent pas
 *   déjà une animation d'entrée sur le même nœud (règle « 1 élément = 1 seul événement »).
 * - Bornes calculées sur la géométrie statique (`documentTop`) pour être insensibles aux transforms.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { documentTop } from './geometry';
import { MOTION_PARALLAX, prefersReducedMotion } from './motion';

gsap.registerPlugin(ScrollTrigger);

const PARALLAX_SELECTOR = '[data-parallax]';

function parallaxRange(el: HTMLElement): { start: number; end: number } {
  const top = documentTop(el);
  const start = top < MOTION_PARALLAX.topThreshold ? 0 : top - window.innerHeight;
  const end = top + el.offsetHeight;
  return { start, end: Math.max(end, start + 1) };
}

function currentYPercent(el: HTMLElement, travel: number): number {
  const { start, end } = parallaxRange(el);
  const scroll = window.scrollY || document.documentElement.scrollTop;
  const progress = gsap.utils.clamp(0, 1, (scroll - start) / (end - start));
  return -travel + 2 * travel * progress;
}

/** Pré-positionne les cibles de parallaxe avant le premier paint (zéro saut) */
export function prepareParallax(root: ParentNode = document) {
  if (prefersReducedMotion()) return;
  const targets = root.querySelectorAll<HTMLElement>(PARALLAX_SELECTOR);
  targets.forEach((el) => {
    const inner = el.querySelector<HTMLElement>('img, video') || el;
    if (el.offsetHeight === 0 || inner.offsetHeight === 0 || inner === el) return;
    const { scale, travel } = MOTION_PARALLAX.fit;
    el.style.overflow = 'hidden';
    gsap.set(inner, {
      yPercent: currentYPercent(inner, travel),
      scale,
      transformOrigin: 'center center',
      force3D: true,
    });
  });
}

/** Crée les ScrollTriggers scrubbés de parallaxe */
export function createParallax(root: ParentNode = document) {
  if (typeof window === 'undefined' || prefersReducedMotion()) return;

  const targets = root.querySelectorAll<HTMLElement>(PARALLAX_SELECTOR);
  targets.forEach((el, idx) => {
    if (el.dataset.parallaxActive === 'true' || el.offsetHeight === 0) return;
    const inner = el.querySelector<HTMLElement>('img, video') || el;
    if (!inner || inner === el) return;

    el.dataset.parallaxActive = 'true';
    el.style.overflow = 'hidden';
    const { scale, travel } = MOTION_PARALLAX.fit;

    gsap.set(inner, {
      yPercent: currentYPercent(inner, travel),
      scale,
      transformOrigin: 'center center',
      force3D: true,
    });

    gsap.fromTo(
      inner,
      { yPercent: -travel, scale },
      {
        yPercent: travel,
        scale,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: inner,
          start: () => parallaxRange(inner).start,
          end: () => parallaxRange(inner).end,
          scrub: true,
          id: `parallax-media-${idx}`,
        },
      },
    );
  });
}
