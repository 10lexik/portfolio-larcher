/**
 * Empilement & révélation de sections en profondeur (`[data-stack]` & `[data-stack-reveal]`).
 *
 * - Une section `[data-stack]` est épinglée (`pin: true, pinSpacing: false`) pendant que la section
 *   suivante glisse par-dessus. Son contenu (`[data-stack-content]`) recule en profondeur (`scale: 0.92`,
 *   dérive `y`) sous un voile d'assombrissement (`[data-stack-dim]`).
 * - Un conteneur `[data-stack-reveal]` (Footer) fait émerger son contenu de la profondeur au scroll.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION_STACK, prefersReducedMotion } from './motion';
import { notifyVideoLayoutChange } from './videoPlayback';

gsap.registerPlugin(ScrollTrigger);

function getStackCover(section: Element): HTMLElement | null {
  const parent = section.parentElement;
  const host = parent?.classList.contains('pin-spacer') ? parent : section;
  return host.nextElementSibling as HTMLElement | null;
}

function createDim(section: HTMLElement, initialOpacity: number): HTMLElement {
  section.querySelectorAll('[data-stack-dim]').forEach((d) => d.remove());
  const dim = document.createElement('div');
  dim.setAttribute('aria-hidden', 'true');
  dim.dataset.stackDim = '';
  Object.assign(dim.style, {
    position: 'absolute',
    inset: '0',
    background: 'var(--color-brand-dark)',
    opacity: String(initialOpacity),
    pointerEvents: 'none',
    zIndex: '20',
  });
  section.appendChild(dim);
  return dim;
}

function createStack(section: HTMLElement) {
  if (section.dataset.stackBound === 'true') return;
  const cover = getStackCover(section);
  if (!cover) return;
  section.dataset.stackBound = 'true';

  if (getComputedStyle(cover).position === 'static') {
    cover.style.position = 'relative';
  }
  cover.style.zIndex = '2';

  if (getComputedStyle(section).position === 'static') {
    section.style.position = 'relative';
  }
  section.style.isolation = 'isolate';

  const dim = createDim(section, 0);
  const content = Array.from(section.querySelectorAll<HTMLElement>('[data-stack-content]'));
  if (content.length) gsap.set(content, { clearProps: 'transform' });

  let occluded = false;
  section.dataset.stackOccluded = 'false';

  const syncOcclusion = (nextOccluded: boolean) => {
    if (nextOccluded === occluded) return;
    occluded = nextOccluded;
    section.dataset.stackOccluded = nextOccluded ? 'true' : 'false';
    notifyVideoLayoutChange();
  };

  const tl = gsap.timeline({
    defaults: { ease: 'power1.in' },
    scrollTrigger: {
      trigger: section,
      start: () => (section.offsetHeight > window.innerHeight ? 'bottom bottom' : 'top top'),
      end: () => `+=${Math.round(Math.min(section.offsetHeight, window.innerHeight) * 0.85)}`,
      pin: true,
      pinSpacing: false,
      scrub: MOTION_STACK.scrub,
      invalidateOnRefresh: true,
      id: `stack-${section.id || 'section'}`,
      onToggle: (self) => {
        content.forEach((el) => {
          el.style.willChange = self.isActive ? 'transform' : '';
        });
        dim.style.willChange = self.isActive ? 'opacity' : '';
      },
      onUpdate: (self) => {
        syncOcclusion(self.progress > 0.08);
      },
      onLeave: () => {
        syncOcclusion(true);
      },
    },
  });

  if (content.length) {
    tl.fromTo(
      content,
      { scale: 1, y: 0, transformOrigin: 'center center' },
      {
        scale: MOTION_STACK.scale,
        y: () =>
          Math.round(MOTION_STACK.drift * Math.min(section.offsetHeight, window.innerHeight)),
        force3D: true,
      },
      0,
    );
  }
  tl.fromTo(dim, { opacity: 0 }, { opacity: MOTION_STACK.dim }, 0);
}

function createFooterReveal(container: HTMLElement) {
  if (container.dataset.stackRevealBound === 'true') return;
  container.dataset.stackRevealBound = 'true';

  const content = Array.from(container.querySelectorAll<HTMLElement>('[data-stack-content]'));
  if (!content.length) return;

  gsap.fromTo(
    content,
    {
      scale: 0.94,
      y: -28,
      autoAlpha: 0.35,
      transformOrigin: 'center bottom',
    },
    {
      scale: 1,
      y: 0,
      autoAlpha: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: MOTION_STACK.scrub,
        invalidateOnRefresh: true,
        id: 'stack-reveal-footer',
      },
    },
  );
}

/** Initialise l'empilement des sections `[data-stack]` et la révélation `[data-stack-reveal]` */
export function initStacking(root: ParentNode = document) {
  if (prefersReducedMotion()) return;
  const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-stack]'));
  sections.forEach(createStack);

  const reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-stack-reveal]'));
  reveals.forEach(createFooterReveal);
}
