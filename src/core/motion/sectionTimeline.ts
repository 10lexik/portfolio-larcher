/**
 * Timelines modulaires d'en-têtes de section (`[data-section-timeline]`).
 *
 * - En-tête : boucle déclarative sur HEADER_ELEMENTS (`[data-stl-badge]`, `[data-stl-title]`,
 *   `[data-stl-subtitle]`, `[data-stl-border]`).
 * - Règle « 1 élément = 1 seul événement » :
 *   - Si l'en-tête est dans le viewport initial au chargement (`top < viewportH`), il entre
 *     dans la timeline unique de 1re vague (`introTl`) et ne reçoit AUCUN `ScrollTrigger`.
 *   - S'il est sous la ligne de flottaison (`top >= viewportH`), il reçoit ses `ScrollTrigger`
 *     (`start: 'top bottom'`, `once: true` dans `[data-stack]`, sinon `onEnter` / `onLeaveBack` / `onRefresh`).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION_PRESETS, MOTION_SCROLL, prefersReducedMotion } from './motion';

gsap.registerPlugin(ScrollTrigger);

interface HeaderElementConfig {
  selector: string;
  suffix: 'badge' | 'title' | 'border' | 'subtitle';
  initial: gsap.TweenVars;
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  waveOffset: number;
}

const HEADER_ELEMENTS: HeaderElementConfig[] = [
  {
    selector: '[data-stl-badge]',
    suffix: 'badge',
    ...MOTION_PRESETS.sectionBadge,
    waveOffset: 0,
  },
  {
    selector: '[data-stl-title]',
    suffix: 'title',
    ...MOTION_PRESETS.sectionTitle,
    waveOffset: 0.05,
  },
  {
    selector: '[data-stl-border]',
    suffix: 'border',
    ...MOTION_PRESETS.sectionBorder,
    waveOffset: 0.1,
  },
  {
    selector: '[data-stl-subtitle]',
    suffix: 'subtitle',
    ...MOTION_PRESETS.sectionSubtitle,
    waveOffset: 0.14,
  },
];

/** Pose les états initiaux masqués avant le premier paint (zéro-FOUC, sans géométrie) */
export function prepareSectionTimelines(root: ParentNode = document) {
  if (prefersReducedMotion()) return;
  const headers = root.querySelectorAll<HTMLElement>('[data-section-timeline]');

  headers.forEach((header) => {
    if (header.dataset.stlBound === 'true') return;
    HEADER_ELEMENTS.forEach(({ selector, initial }) => {
      const el = header.querySelector<HTMLElement>(selector);
      if (el) gsap.set(el, { ...initial });
    });
  });
}

/** Initialise les en-têtes de section : 1re vague dans `introTl` OU `ScrollTrigger` sous le pli */
export function initSectionTimelines(
  root: ParentNode = document,
  introTl?: gsap.core.Timeline,
  viewportH = typeof window !== 'undefined' ? window.innerHeight : 900,
): ScrollTrigger[] {
  if (prefersReducedMotion()) return [];
  const headers = Array.from(root.querySelectorAll<HTMLElement>('[data-section-timeline]')).filter(
    (h) => h.dataset.stlBound !== 'true',
  );
  if (!headers.length) return [];

  // Passe 1 (LECTURE PURE) : mesure tous les getBoundingClientRect() avant toute écriture GSAP
  const measured = headers.map((header) => ({
    header,
    rect: header.getBoundingClientRect(),
  }));

  const triggers: ScrollTrigger[] = [];

  // Passe 2 (ÉCRITURE PURE)
  measured.forEach(({ header, rect }, idx) => {
    header.dataset.stlBound = 'true';
    const isStacked = Boolean(header.closest('[data-stack], [data-stack-reveal]'));

    // Cas A : Déjà au-dessus du viewport (reload en milieu de page)
    if (rect.bottom <= 0) {
      HEADER_ELEMENTS.forEach(({ selector, suffix, to }) => {
        const el = header.querySelector<HTMLElement>(selector);
        if (el) {
          gsap.set(el, {
            ...to,
            ...(suffix !== 'border' ? { clearProps: 'transform,opacity,visibility' } : {}),
          });
        }
      });
      return;
    }

    // Cas B : Visible dans le viewport initial → 1re vague uniquement (AUCUN ScrollTrigger)
    if (rect.top < viewportH) {
      const tl = introTl || gsap.timeline();
      HEADER_ELEMENTS.forEach(({ selector, suffix, from, to, waveOffset }) => {
        const el = header.querySelector<HTMLElement>(selector);
        if (!el) return;
        tl.fromTo(
          el,
          { ...from },
          {
            ...to,
            ...(suffix !== 'border' ? { clearProps: 'transform' } : {}),
          },
          0.08 + waveOffset,
        );
      });
      return;
    }

    // Cas C : Sous la ligne de flottaison → ScrollTrigger individuel par sous-élément
    const sectionId = header.querySelector('[id]')?.id || `sec-${idx}`;

    HEADER_ELEMENTS.forEach(({ selector, suffix, initial, from, to }) => {
      const el = header.querySelector<HTMLElement>(selector);
      if (!el) return;

      const playElIn = () => {
        gsap.fromTo(
          el,
          { ...from },
          {
            ...to,
            overwrite: true,
            ...(suffix !== 'border' ? { clearProps: 'transform' } : {}),
          },
        );
      };

      const resetElOut = () => {
        const currentY = parseFloat(String(gsap.getProperty(el, 'y') ?? '0')) || 0;
        const naturalTop = el.getBoundingClientRect().top - currentY;
        if (naturalTop < window.innerHeight - 1) return;
        gsap.killTweensOf(el);
        gsap.set(el, { ...initial, x: 0, y: 0 });
      };

      if (isStacked) {
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: MOTION_SCROLL.startHeader,
            end: MOTION_SCROLL.end,
            once: true,
            id: `${sectionId}-${suffix}`,
            onEnter: () => playElIn(),
          }),
        );
      } else {
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: MOTION_SCROLL.startHeader,
            end: MOTION_SCROLL.end,
            id: `${sectionId}-${suffix}`,
            onEnter: () => playElIn(),
            onLeaveBack: () => resetElOut(),
            onRefresh: (self) => {
              if (!self.isActive && self.progress === 0) {
                resetElOut();
              }
            },
          }),
        );
      }
    });
  });

  return triggers;
}
