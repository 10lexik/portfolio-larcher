/**
 * Chorégraphie globale des pages (SSOT du cycle de vie des animations GSAP).
 *
 *  - Neutralisation temporaire des translations GSAP (`x`, `y`) pendant `ScrollTrigger.refresh()`
 *    via les événements `refreshInit` / `refresh` afin d'éliminer tout faux `onLeaveBack` / flash.
 *  - Règle stricte « 1 élément = 1 seul événement » :
 *      - Ce qui est dans le viewport initial (`top < viewportH`) entre dans l'unique timeline
 *        de première vague (`introTl`) au chargement et ne reçoit AUCUN `ScrollTrigger`.
 *      - Ce qui est sous la ligne de flottaison (`top >= viewportH`) reste à `autoAlpha: 0`
 *        et reçoit son `ScrollTrigger` (`start: 'top bottom'`) après la pose et le `refresh()`
 *        des pins de layout (`initStacking`).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  MOTION_DISTANCE,
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_ORCHESTRATOR,
  MOTION_SCROLL,
  prefersReducedMotion,
} from './motion';
import { createParallax, prepareParallax } from './parallax';
import { initCounters } from './counter';
import {
  cancelDeferredReset,
  clearAllDeferredResets,
  playSmartEntrance,
  resetOrDeferBelowFold,
} from './scrollEntrance';
import { initSectionTimelines, prepareSectionTimelines } from './sectionTimeline';
import { initStacking } from './stacking';
import { initAllStaggeredGrids, prepareStaggeredGrids } from './staggeredGrid';
import { animateSplitTitle, prepareSplitTitle } from './textSplitter';
import { animateVectorBorders, prepareVectorBorders } from './vectorBorder';
import { initVideoPlayback, resetVideoPlayback } from './videoPlayback';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

interface PreparationEvent extends Event {
  from?: URL;
  to?: URL;
  loader?: () => Promise<void>;
}

type ClearScrollMemory = (scrollRestoration?: string, force?: boolean) => void;

const HERO_TITLE_SELECTOR =
  '[data-split-title]:not([data-stl-title]), .home-hero__title, .cs-hero__title, .ds-hero__title, .about-hero__title';

const STANDALONE_REVEAL_SELECTOR =
  '[data-reveal]:not([data-section-timeline]):not([data-stagger-item="true"]):not([data-stl-item="true"])';

const ONCE_CONTEXT_SELECTOR =
  '[data-stack], [data-stack-reveal], [data-reveal-once], .ds-split__aside';

/** Déduplication structurelle (1 élément = 1 seul moteur, aucun parent + enfant tous deux animés) */
function isNestedMotionTarget(el: HTMLElement): boolean {
  if (el.matches(HERO_TITLE_SELECTOR) || el.dataset.revealBound === 'true') return true;
  return Boolean(
    el.parentElement?.closest(
      '[data-reveal], [data-section-timeline], [data-stagger-item="true"], [data-split-title], [data-vector-btn]',
    ),
  );
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

// Neutralise temporairement toute translation GSAP (x, y) en cours sur les triggers non-scrubbés
// pendant la passe synchrone de mesure de `ScrollTrigger.refresh()`, puis la restaure aussitôt.
const savedTriggerTransforms = new Map<HTMLElement, { x: number; y: number }>();

ScrollTrigger.addEventListener('refreshInit', () => {
  savedTriggerTransforms.clear();
  ScrollTrigger.getAll().forEach((st) => {
    const el = st.trigger;
    if (el instanceof Element && !el.isConnected) {
      st.kill();
      return;
    }
    if (!(el instanceof HTMLElement)) return;
    if (st.vars.scrub || el.hasAttribute('data-stack') || el.hasAttribute('data-stack-content')) {
      return;
    }
    const x = parseFloat(String(gsap.getProperty(el, 'x') ?? '0')) || 0;
    const y = parseFloat(String(gsap.getProperty(el, 'y') ?? '0')) || 0;
    if (x !== 0 || y !== 0) {
      savedTriggerTransforms.set(el, { x, y });
      gsap.set(el, { x: 0, y: 0 });
    }
  });
});

ScrollTrigger.addEventListener('refresh', () => {
  savedTriggerTransforms.forEach(({ x, y }, el) => {
    gsap.set(el, { x, y });
  });
  savedTriggerTransforms.clear();
});

class LoaderController {
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private activeTween: gsap.core.Tween | null = null;
  private isFinishing = false;

  private getElement(): HTMLElement | null {
    return typeof document !== 'undefined' ? document.getElementById('global-loader') : null;
  }

  start() {
    this.reset(true);
    this.timeout = setTimeout(() => {
      const loader = this.getElement();
      if (!loader) return;
      gsap.killTweensOf(loader);
      gsap.set(loader, { opacity: 1, width: '0%' });
      this.activeTween = gsap.to(loader, {
        width: '85%',
        duration: MOTION_ORCHESTRATOR.loader.progressDuration,
        ease: MOTION_EASE.expo,
      });
    }, MOTION_ORCHESTRATOR.loader.showDelayMs);
  }

  finish() {
    if (this.isFinishing) return;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    const loader = this.getElement();
    if (!loader) return;

    if (this.activeTween) {
      this.activeTween.kill();
      this.activeTween = null;
    }

    const currentOpacity = parseFloat(window.getComputedStyle(loader).opacity || '0');
    if (currentOpacity <= 0.05) {
      this.reset(true);
      return;
    }

    this.isFinishing = true;
    gsap.to(loader, {
      width: '100%',
      duration: MOTION_ORCHESTRATOR.loader.finishDuration,
      ease: MOTION_EASE.smooth,
      onComplete: () => {
        gsap.to(loader, {
          opacity: 0,
          duration: MOTION_ORCHESTRATOR.loader.finishDuration,
          delay: MOTION_ORCHESTRATOR.loader.fadeOutDelay,
          onComplete: () => {
            gsap.set(loader, { width: '0%' });
            this.isFinishing = false;
          },
        });
      },
    });
  }

  reset(force = false) {
    if (this.isFinishing && !force) return;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (this.activeTween) {
      this.activeTween.kill();
      this.activeTween = null;
    }
    this.isFinishing = false;
    const loader = this.getElement();
    if (loader) {
      gsap.killTweensOf(loader);
      gsap.set(loader, { opacity: 0, width: '0%' });
    }
  }
}

class AnimationOrchestrator {
  private generation = 0;
  private startedGeneration = -1;
  private isPrepared = false;
  private headerEntrancePlayed = false;
  private loader = new LoaderController();
  private resizeObserver: ResizeObserver | null = null;
  private refreshCall: gsap.core.Tween | null = null;
  private pendingScrollEnd: (() => void) | null = null;
  private lastDocumentHeight = 0;

  beforePreparation(event?: Event) {
    this.loader.start();
    if (typeof document === 'undefined' || !event || prefersReducedMotion()) return;
    const prepEvent = event as PreparationEvent;
    if (typeof prepEvent.loader !== 'function') return;

    if (prepEvent.from && prepEvent.to) {
      const normalize = (p: string) => p.replace(/\/+$/, '') || '/';
      if (normalize(prepEvent.from.pathname) === normalize(prepEvent.to.pathname)) return;
    }

    const originalLoader = prepEvent.loader.bind(prepEvent);
    prepEvent.loader = async () => {
      await originalLoader();
      this.loader.finish();
      const targets = document.querySelectorAll<HTMLElement>('#main, .site-footer');
      if (!targets.length) return;
      await new Promise<void>((resolve) => {
        gsap.to(targets, {
          opacity: 0,
          duration: MOTION_ORCHESTRATOR.outroDuration,
          ease: MOTION_EASE.smooth,
          overwrite: 'auto',
          onComplete: resolve,
          onInterrupt: resolve,
        });
      });
    };
  }

  afterPreparation() {
    this.loader.finish();
  }

  beginPage() {
    this.generation++;
    this.isPrepared = false;
    if (this.pendingScrollEnd) {
      ScrollTrigger.removeEventListener('scrollEnd', this.pendingScrollEnd);
      this.pendingScrollEnd = null;
    }
    this.lastDocumentHeight = 0;
    this.refreshCall?.kill();
    clearAllDeferredResets();
    resetVideoPlayback();
    ScrollTrigger.getAll().forEach((st) => st.kill());
    this.loader.reset();
    this.resetScroll();
  }

  resetScroll(force = false) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!force && window.location.hash) return;
    (ScrollTrigger.clearScrollMemory as ClearScrollMemory)('manual', true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    ScrollTrigger.getScrollFunc(window)(0);
  }

  preparePage(root: ParentNode = document, force = false) {
    if (this.isPrepared && root === document && !force) return;
    if (root === document) {
      this.isPrepared = true;
      if (!force) this.resetScroll();
    }

    if (prefersReducedMotion()) {
      if (typeof document !== 'undefined') {
        document.documentElement.removeAttribute('data-anim-pending');
      }
      return;
    }

    if (!this.headerEntrancePlayed && root === document && typeof document !== 'undefined') {
      const header = document.querySelector<HTMLElement>('.site-header');
      if (header) {
        gsap.set(header, { autoAlpha: 0, yPercent: -100 });
      }
    }

    // 1. Prépare les grilles staggées (marque leurs enfants data-stagger-item="true")
    prepareStaggeredGrids(root);

    // 2. Prépare les en-têtes de section ([data-section-timeline])
    prepareSectionTimelines(root);

    // 3. Prépare les grands titres Hero ([data-split-title])
    root.querySelectorAll<HTMLElement>(HERO_TITLE_SELECTOR).forEach((title) => {
      prepareSplitTitle(title);
    });

    // 4. Prépare les parallaxes et les contours vectoriels
    prepareParallax(root);
    prepareVectorBorders(root);

    // 5. Masque les éléments [data-reveal] autonomes sans altérer leur géométrie
    root.querySelectorAll<HTMLElement>(STANDALONE_REVEAL_SELECTOR).forEach((el) => {
      if (isNestedMotionTarget(el)) return;
      gsap.set(el, { autoAlpha: 0 });
    });

    if (this.generation > 0 && root === document && typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-anim-pending');
    }
  }

  hasStartedCurrentPage(): boolean {
    return this.startedGeneration === this.generation;
  }

  async startPage(root: ParentNode = document) {
    const isFullDocument = root === document;
    if (isFullDocument) {
      if (this.startedGeneration === this.generation) return;
      this.startedGeneration = this.generation;
    }
    const generation = this.generation;
    const isCurrent = () => !isFullDocument || generation === this.generation;

    this.preparePage(root);

    if (
      isFullDocument &&
      typeof document !== 'undefined' &&
      document.querySelector('astro-island[ssr][client="load"]')
    ) {
      await nextFrame();
      await this.waitForIslands();
      if (!isCurrent()) return;
      this.resetScroll();
      this.preparePage(root, true);
    }

    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-anim-pending');
    }

    initCounters(root);
    initVideoPlayback(root);

    if (prefersReducedMotion()) return;

    // 1. Pins de layout (empilement de sections data-stack + révélation footer)
    // Suivis immédiatement d'un ScrollTrigger.refresh() pour stabiliser tous les pin-spacers
    // avant de mesurer les positions des sections suivantes.
    if (isFullDocument) {
      initStacking(root);
      ScrollTrigger.refresh();
    }

    const introTl = gsap.timeline();
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 900;

    // 2. Entrée descendante du Header (jouée une seule fois à l'arrivée sur le site)
    if (isFullDocument && !this.headerEntrancePlayed && typeof document !== 'undefined') {
      this.headerEntrancePlayed = true;
      const header = document.querySelector<HTMLElement>('.site-header');
      if (header) {
        introTl.fromTo(
          header,
          { autoAlpha: 0, yPercent: -100 },
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: MOTION_DURATION.moderate,
            ease: MOTION_EASE.out,
            clearProps: 'transform,opacity,visibility',
          },
          0,
        );
      }
    }

    // 3. Titres Hero découpés en mots/caractères (1re vague uniquement, aucun ScrollTrigger)
    root.querySelectorAll<HTMLElement>(HERO_TITLE_SELECTOR).forEach((title, idx) => {
      if (title.dataset.heroTitleBound === 'true') return;
      title.dataset.heroTitleBound = 'true';
      animateSplitTitle(title, introTl, 0.04 + idx * 0.06);
    });

    // 4. En-têtes de section & Grilles staggées (1re vague dans introTl OU ScrollTrigger sous le pli)
    initSectionTimelines(root, introTl, viewportH);
    initAllStaggeredGrids(root, introTl, viewportH);
    createParallax(root);

    // 5. Éléments [data-reveal] autonomes (badges, leads, clusters, citations, CaseInsight)
    const standalone = Array.from(
      root.querySelectorAll<HTMLElement>(STANDALONE_REVEAL_SELECTOR),
    ).filter((el) => !isNestedMotionTarget(el));

    // Passe 1 (LECTURE PURE)
    const measuredStandalone = standalone.map((el) => ({
      el,
      rect: el.getBoundingClientRect(),
      isOnce: Boolean(el.closest(ONCE_CONTEXT_SELECTOR)),
    }));

    const waveItems: HTMLElement[] = [];
    const scrollItems: Array<{ el: HTMLElement; isOnce: boolean }> = [];

    // Passe 2 (TRI)
    measuredStandalone.forEach(({ el, rect, isOnce }) => {
      el.dataset.revealBound = 'true';
      if (rect.bottom <= 0) {
        gsap.set(el, { autoAlpha: 1, clearProps: 'transform,opacity,visibility' });
      } else if (rect.top < viewportH) {
        waveItems.push(el);
      } else {
        scrollItems.push({ el, isOnce });
      }
    });

    const step =
      waveItems.length > 1
        ? Math.min(
            MOTION_ORCHESTRATOR.waveStep,
            MOTION_ORCHESTRATOR.waveMaxSpan / (waveItems.length - 1),
          )
        : 0;

    // 1re vague : timeline unique sans ScrollTrigger ni overwrite différé
    waveItems.forEach((el, index) => {
      const mode = el.dataset.reveal;
      const fromVars: gsap.TweenVars =
        mode === 'fade'
          ? { autoAlpha: 0 }
          : mode === 'scale'
            ? { autoAlpha: 0, scale: 0.96 }
            : { autoAlpha: 0, y: MOTION_DISTANCE.md };

      introTl.fromTo(
        el,
        fromVars,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: MOTION_DURATION.moderate,
          ease: MOTION_EASE.out,
          clearProps: 'transform,opacity,visibility',
        },
        0.08 + index * step,
      );
    });

    // Sous la ligne de flottaison : ScrollTrigger uniquement
    scrollItems.forEach(({ el, isOnce }, idx) => {
      const mode = el.dataset.reveal;
      const fromVars: gsap.TweenVars =
        mode === 'fade'
          ? { autoAlpha: 0 }
          : mode === 'scale'
            ? { autoAlpha: 0, scale: 0.96 }
            : { autoAlpha: 0, y: MOTION_DISTANCE.md };

      const toVars: gsap.TweenVars = {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: MOTION_DURATION.moderate,
        ease: MOTION_EASE.out,
        clearProps: 'transform',
      };

      const resetElOut = () => {
        gsap.killTweensOf(el);
        gsap.set(el, { autoAlpha: 0, x: 0, y: 0, scale: 1, clearProps: 'transform' });
      };

      if (isOnce) {
        ScrollTrigger.create({
          trigger: el,
          start: MOTION_SCROLL.start,
          end: MOTION_SCROLL.end,
          once: true,
          id: `reveal-${idx}`,
          onEnter: () => playSmartEntrance(el, fromVars, toVars),
        });
      } else {
        ScrollTrigger.create({
          trigger: el,
          start: MOTION_SCROLL.start,
          end: MOTION_SCROLL.end,
          id: `reveal-${idx}`,
          onEnter: (self) => {
            cancelDeferredReset(self);
            playSmartEntrance(el, fromVars, toVars);
          },
          onLeaveBack: (self) => {
            resetOrDeferBelowFold(self, el, resetElOut);
          },
        });
      }
    });

    // 6. Contours vectoriels SVG sur les boutons isolés ([data-vector-btn])
    animateVectorBorders(root, introTl, 0.12);

    if (isFullDocument) {
      this.lastDocumentHeight = document.documentElement.scrollHeight;
      this.refreshCall?.kill();
      this.observeLayout();
    }
  }

  private async waitForIslands() {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const islands = Array.from(
      document.querySelectorAll<HTMLElement>('astro-island[ssr][client="load"]'),
    );
    if (!islands.length) return;

    await Promise.all(
      islands.map(
        (island) =>
          new Promise<void>((resolve) => {
            if (!island.hasAttribute('ssr')) {
              resolve();
              return;
            }
            const timer = setTimeout(resolve, 180);
            island.addEventListener(
              'astro:hydrate',
              () => {
                clearTimeout(timer);
                resolve();
              },
              { once: true },
            );
          }),
      ),
    );
    await nextFrame();
  }

  safeRefresh() {
    if (typeof window === 'undefined') return;
    const scrollY = window.scrollY;
    const viewportH = window.innerHeight;
    const hasRelevantPinsOrScrubs = ScrollTrigger.getAll().some(
      (st) =>
        (Boolean(st.pin) && (st.isActive || scrollY <= st.end + viewportH * 0.5)) ||
        (Boolean(st.vars.scrub) && st.isActive),
    );
    if (!hasRelevantPinsOrScrubs || !ScrollTrigger.isScrolling()) {
      ScrollTrigger.refresh();
      return;
    }
    if (this.pendingScrollEnd) return;
    const generation = this.generation;
    const onScrollEnd = () => {
      ScrollTrigger.removeEventListener('scrollEnd', onScrollEnd);
      this.pendingScrollEnd = null;
      if (this.generation === generation) ScrollTrigger.refresh();
    };
    this.pendingScrollEnd = onScrollEnd;
    ScrollTrigger.addEventListener('scrollEnd', onScrollEnd);
  }

  private observeLayout() {
    if (this.resizeObserver || typeof ResizeObserver === 'undefined') return;
    this.lastDocumentHeight =
      typeof document !== 'undefined' ? document.documentElement.scrollHeight : 0;

    const refreshIfHeightChanged = () => {
      const currentHeight = document.documentElement.scrollHeight;
      if (Math.abs(currentHeight - this.lastDocumentHeight) < 2) return;
      this.lastDocumentHeight = currentHeight;
      this.refreshCall?.kill();
      this.refreshCall = gsap.delayedCall(MOTION_ORCHESTRATOR.refreshDebounce, () =>
        this.safeRefresh(),
      );
    };

    this.resizeObserver = new ResizeObserver(() => {
      refreshIfHeightChanged();
    });
    this.resizeObserver.observe(document.documentElement);
  }
}

export const orchestrator = new AnimationOrchestrator();
