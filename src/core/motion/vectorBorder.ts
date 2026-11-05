/**
 * Moteur de tracé périmétrique vectoriel (SVG stroke-dashoffset) sur les boutons (`[data-vector-btn]`).
 *
 * Utilise `pathLength="100"` pour animer le contour de 0 % à 100 % en parallèle de l'élévation du label.
 * Le rayon `rx = ry = (offsetHeight - 1) / 2` est synchronisé par `ResizeObserver` pour tracer une pilule
 * géométriquement identique à `border-radius: 9999px` (et non une ellipse SVG).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION_PRESETS, MOTION_SCROLL, prefersReducedMotion } from './motion';
import { cancelDeferredReset, playSmartEntrance, resetOrDeferBelowFold } from './scrollEntrance';

gsap.registerPlugin(ScrollTrigger);

function syncPillRadius(element: HTMLElement, rect: SVGRectElement) {
  const h = element.offsetHeight;
  const radius = h > 0 ? Math.max(0, (h - 1) / 2) : 20;
  rect.setAttribute('rx', `${radius}`);
  rect.setAttribute('ry', `${radius}`);
}

const pillResizeObserver =
  typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver((entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const rect = el.querySelector<SVGRectElement>('.vector-border-svg rect');
          if (rect) syncPillRadius(el, rect);
        }
      })
    : null;

function attachVectorBorder(element: HTMLElement): SVGRectElement | null {
  const existing = element.querySelector<SVGRectElement>('.vector-border-svg rect');
  if (existing) {
    syncPillRadius(element, existing);
    return existing;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'vector-border-svg');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '0.5');
  rect.setAttribute('y', '0.5');
  rect.setAttribute('width', 'calc(100% - 1px)');
  rect.setAttribute('height', 'calc(100% - 1px)');
  syncPillRadius(element, rect);
  rect.setAttribute('stroke-width', '1');
  rect.setAttribute('pathLength', '100');
  rect.setAttribute('stroke-dasharray', '100');
  rect.setAttribute('stroke-dashoffset', '100');

  svg.appendChild(rect);
  element.appendChild(svg);
  pillResizeObserver?.observe(element);
  return rect;
}

/** Pose l'état initial masqué sur les boutons vectoriels d'un conteneur */
export function prepareVectorBorders(root: ParentNode = document) {
  if (prefersReducedMotion()) return;
  const buttons = root.querySelectorAll<HTMLElement>('[data-vector-btn]');
  buttons.forEach((btn) => {
    const rect = attachVectorBorder(btn);
    if (rect) {
      gsap.set(rect, { strokeDashoffset: 100 });
    }
    const label = btn.querySelector<HTMLElement>('[data-vector-btn-label]');
    if (label) {
      gsap.set(label, { ...MOTION_PRESETS.vectorBorderDraw.label.initial });
    }
  });
}

function playSingleVectorBorder(
  btn: HTMLElement,
  tl: gsap.core.Timeline,
  offset: number | string = 0,
) {
  const { stroke, label } = MOTION_PRESETS.vectorBorderDraw;
  const rect = attachVectorBorder(btn);

  if (rect) {
    tl.fromTo(
      rect,
      { strokeDashoffset: 100 },
      {
        strokeDashoffset: 0,
        duration: stroke.duration,
        ease: stroke.ease,
      },
      offset,
    );
  }

  const labelEl = btn.querySelector<HTMLElement>('[data-vector-btn-label]');
  if (labelEl) {
    tl.fromTo(
      labelEl,
      { ...label.from },
      {
        ...label.to,
        clearProps: 'transform,opacity,visibility',
      },
      typeof offset === 'number' ? offset + 0.08 : offset,
    );
  }
}

/** Anime les contours vectoriels (1re vague dans `tl`, hors écran via ScrollTrigger) */
export function animateVectorBorders(
  root: ParentNode = document,
  tl?: gsap.core.Timeline,
  at: number | string = 0,
) {
  if (prefersReducedMotion()) return;
  const timeline = tl || gsap.timeline();
  const buttons = root.querySelectorAll<HTMLElement>('[data-vector-btn]');
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 900;
  const waveThreshold = viewportH * MOTION_SCROLL.startFraction;

  let waveIdx = 0;
  buttons.forEach((btn) => {
    if (btn.dataset.vectorInit === 'true') return;
    btn.dataset.vectorInit = 'true';

    const box = btn.getBoundingClientRect();
    if (box.top < waveThreshold) {
      const offset = typeof at === 'number' ? at + waveIdx * 0.08 : at;
      waveIdx += 1;
      playSingleVectorBorder(btn, timeline, offset);
    } else {
      const { stroke, label } = MOTION_PRESETS.vectorBorderDraw;
      const isOnce = Boolean(btn.closest('[data-stack], [data-stack-reveal]'));

      const playBtnIn = () => {
        const rect = attachVectorBorder(btn);
        if (rect) {
          const dashOffset = parseFloat(String(gsap.getProperty(rect, 'strokeDashoffset') ?? '0'));
          if (dashOffset > 5) {
            gsap.fromTo(
              rect,
              { strokeDashoffset: 100 },
              {
                strokeDashoffset: 0,
                duration: stroke.duration,
                ease: stroke.ease,
                overwrite: true,
              },
            );
          } else {
            gsap.to(rect, {
              strokeDashoffset: 0,
              duration: stroke.duration,
              ease: stroke.ease,
              overwrite: true,
            });
          }
        }
        const labelEl = btn.querySelector<HTMLElement>('[data-vector-btn-label]');
        if (labelEl) {
          playSmartEntrance(labelEl, label.from, {
            ...label.to,
            delay: 0.08,
            clearProps: 'transform,opacity,visibility',
          });
        }
      };

      const resetBtnOut = () => {
        const rect = btn.querySelector<SVGRectElement>('.vector-border-svg rect');
        if (rect) {
          gsap.killTweensOf(rect);
          gsap.set(rect, { strokeDashoffset: 100 });
        }
        const labelEl = btn.querySelector<HTMLElement>('[data-vector-btn-label]');
        if (labelEl) {
          gsap.killTweensOf(labelEl);
          gsap.set(labelEl, { ...label.initial, x: 0, y: 0, clearProps: 'transform' });
        }
      };

      if (isOnce) {
        ScrollTrigger.create({
          trigger: btn,
          start: MOTION_SCROLL.start,
          end: MOTION_SCROLL.end,
          once: true,
          onEnter: () => playBtnIn(),
        });
      } else {
        ScrollTrigger.create({
          trigger: btn,
          start: MOTION_SCROLL.start,
          end: MOTION_SCROLL.end,
          onEnter: (self) => {
            cancelDeferredReset(self);
            playBtnIn();
          },
          onLeaveBack: (self) => {
            resetOrDeferBelowFold(self, btn, resetBtnOut);
          },
        });
      }
    }
  });
}
