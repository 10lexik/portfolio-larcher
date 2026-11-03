/**
 * Orchestrateur partagé de chargement différé et de lecture des boucles `<video>`.
 *
 * Principes de fluidité 60/120 fps :
 * 1. **Zéro îlot Svelte requis en SSR** : `initVideoPlayback()` découvre automatiquement tous les
 *    `<video data-video-loop>` du document (tout en restant idempotent avec `registerManagedVideo`
 *    utilisé par `onMount` dans Storybook).
 * 2. **Défaut d'exécution hors scroll (`scrollend`)** : aucun `video.load()` ni nouveau `video.play()`
 *    n'est exécuté pendant un geste de défilement actif ; l'hydratation des sources H.264 est étalée
 *    séquentiellement une vidéo à la fois une fois le scroll stabilisé et le premier paint effectué.
 * 3. **Budget matériel de décodeurs GPU** :
 *    - Mise en pause immédiate de toute section `[data-stack]` dès qu'elle commence à être recouverte
 *      (`data-stack-occluded="true"`).
 *    - Plafond strict de flux H.264 simultanés dans les grilles sous le pli (`6` décodeurs max sur
 *      desktop = 1 rangée complète de 3 cartes Desktop+Mobile ou les 4 démos GSAP ; `2` décodeurs max
 *      sur mobile = la carte centrée Desktop+Mobile), évitant toute bascule en décodage logiciel CPU.
 */
import { prefersReducedMotion } from './motion';

interface ManagedVideoOptions {
  desktopOnly?: boolean;
  onReady?: () => void;
}

interface VideoEntry {
  video: HTMLVideoElement;
  desktopOnly: boolean;
  isHeroCollage: boolean;
  onReady?: () => void;
  hydrated: boolean;
  centerRatio: number;
  viewportRatio: number;
  cleanup: () => void;
}

interface NavigatorConnection {
  saveData?: boolean;
}

const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';
const MAX_GRID_DECODERS_DESKTOP = 6;
const MAX_GRID_DECODERS_MOBILE = 2;
const BOOT_SETTLE_MS = 280;
const SCROLL_FALLBACK_IDLE_MS = 140;
const HYDRATION_STEP_MS = 70;

const entries = new Map<HTMLVideoElement, VideoEntry>();
const hydrationQueue: VideoEntry[] = [];

let preloadObserver: IntersectionObserver | null = null;
let viewportObserver: IntersectionObserver | null = null;
let centerObserver: IntersectionObserver | null = null;
let listenersBound = false;
let syncScheduled = false;
let isScrolling = false;
let initialBootSettled = true;
let scrollIdleTimer: ReturnType<typeof setTimeout> | null = null;
let bootSettleTimer: ReturnType<typeof setTimeout> | null = null;
let hydrationStepTimer: ReturnType<typeof setTimeout> | null = null;

function isDesktopViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

function isSaveDataEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { connection?: NavigatorConnection };
  return Boolean(nav.connection?.saveData);
}

function pauseSafely(video: HTMLVideoElement): void {
  if (!video.paused) {
    video.pause();
  }
}

function playSafely(video: HTMLVideoElement): void {
  if (!video.paused) return;
  void video.play().catch((err: unknown) => {
    void err;
  });
}

function isOccludedByStack(video: HTMLVideoElement): boolean {
  const stackSection = video.closest<HTMLElement>('[data-stack]');
  return stackSection?.dataset.stackOccluded === 'true';
}

function isHiddenByMosaicView(video: HTMLVideoElement): boolean {
  const showcase = video.closest<HTMLElement>('[data-mosaic-showcase]');
  if (!showcase) return false;
  const view = showcase.dataset.view ?? 'combined';
  if (view === 'desktop' && video.closest('[data-mosaic-mob-card]')) {
    return true;
  }
  // En vue 'mobile', le calque desktop est flouté/assombri à l'arrière-plan : inutile de le décoder
  if (view === 'mobile' && video.closest('[data-mosaic-desk]')) {
    return true;
  }
  return false;
}

function getLogicalGroup(video: HTMLVideoElement): Element {
  return video.closest('[data-mosaic-stage], .cs-videos__item') ?? video;
}

function hydrateVideoSourceNow(entry: VideoEntry): void {
  if (entry.hydrated || !entry.video.isConnected) return;
  if (entry.desktopOnly && !isDesktopViewport()) return;

  const { video } = entry;
  const deferredSrc = video.dataset.src;
  if (deferredSrc) {
    video.preload = 'metadata';
    video.src = deferredSrc;
    delete video.dataset.src;
    video.load();
  }
  entry.hydrated = Boolean(video.currentSrc || video.getAttribute('src'));
}

function pumpHydrationQueue(): void {
  hydrationStepTimer = null;
  if (isScrolling || !initialBootSettled || prefersReducedMotion()) return;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

  while (hydrationQueue.length > 0) {
    const next = hydrationQueue.shift();
    if (!next || !entries.has(next.video) || next.hydrated) continue;
    if (next.desktopOnly && !isDesktopViewport()) continue;
    if (isOccludedByStack(next.video) || isHiddenByMosaicView(next.video)) continue;
    if (next.viewportRatio <= 0 && !next.isHeroCollage) continue;

    hydrateVideoSourceNow(next);
    scheduleSync();

    if (hydrationQueue.length > 0) {
      hydrationStepTimer = setTimeout(pumpHydrationQueue, HYDRATION_STEP_MS);
    }
    return;
  }
}

function enqueueHydration(entry: VideoEntry): void {
  if (entry.hydrated || isSaveDataEnabled()) return;
  if (entry.desktopOnly && !isDesktopViewport()) return;
  if (!hydrationQueue.includes(entry)) {
    // Priorise les vidéos actuellement visibles sur le simple préchargement en marge
    if (entry.viewportRatio >= 0.2) {
      hydrationQueue.unshift(entry);
    } else {
      hydrationQueue.push(entry);
    }
  }
  if (!hydrationStepTimer && !isScrolling && initialBootSettled) {
    hydrationStepTimer = setTimeout(pumpHydrationQueue, 16);
  }
}

function syncReducedMotionMode(): void {
  const isDesktop = isDesktopViewport();
  entries.forEach((entry) => {
    const { video } = entry;
    pauseSafely(video);
    video.controls = true;
    if (!entry.hydrated && video.dataset.src && !(entry.desktopOnly && !isDesktop)) {
      if (entry.viewportRatio > 0) {
        hydrateVideoSourceNow(entry);
        video.classList.add('is-ready');
      }
    }
  });
}

function syncNow(): void {
  syncScheduled = false;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const hiddenTab = document.visibilityState === 'hidden';
  if (hiddenTab) {
    entries.forEach(({ video }) => pauseSafely(video));
    return;
  }

  if (prefersReducedMotion()) {
    syncReducedMotionMode();
    return;
  }

  const isDesktop = isDesktopViewport();
  const saveData = isSaveDataEnabled();
  const canStartPlayback = !isScrolling && initialBootSettled && !saveData;

  // 1. Sélectionne les groupes actifs sous le pli selon leur proximité au centre du viewport
  const groupMap = new Map<Element, { entries: VideoEntry[]; score: number }>();

  entries.forEach((entry) => {
    const { video } = entry;
    if (video.controls) video.controls = false;

    // Mise en pause immédiate des vidéos hors écran, masquées ou recouvertes par un stack
    if (
      (entry.desktopOnly && !isDesktop) ||
      isOccludedByStack(video) ||
      isHiddenByMosaicView(video) ||
      entry.viewportRatio < 0.2
    ) {
      pauseSafely(video);
      return;
    }

    // Collage Hero (hors recouvrement) : animé sur mobile et desktop après le premier rendu
    if (entry.isHeroCollage) {
      if (!entry.hydrated) {
        enqueueHydration(entry);
      } else if (canStartPlayback) {
        playSafely(video);
      }
      return;
    }

    const group = getLogicalGroup(video);
    const entryScore = entry.centerRatio > 0 ? 1 + entry.centerRatio : entry.viewportRatio * 0.6;
    const existing = groupMap.get(group);
    if (existing) {
      existing.entries.push(entry);
      if (entryScore > existing.score) existing.score = entryScore;
    } else {
      groupMap.set(group, { entries: [entry], score: entryScore });
    }
  });

  // 2. Plafonne le nombre de décodeurs matériels actifs dans les grilles (6 desktop / 2 mobile)
  const maxDecoders = isDesktop ? MAX_GRID_DECODERS_DESKTOP : MAX_GRID_DECODERS_MOBILE;
  const rankedGroups = Array.from(groupMap.values()).sort((a, b) => b.score - a.score);
  const allowedEntries = new Set<VideoEntry>();
  let usedDecoders = 0;

  for (const group of rankedGroups) {
    if (group.score < 0.15) continue;
    const needed = group.entries.length;
    if (usedDecoders + needed <= maxDecoders || usedDecoders === 0) {
      group.entries.forEach((e) => allowedEntries.add(e));
      usedDecoders += needed;
    }
    if (usedDecoders >= maxDecoders) break;
  }

  groupMap.forEach(({ entries: groupEntries }) => {
    for (const entry of groupEntries) {
      if (allowedEntries.has(entry)) {
        if (!entry.hydrated) {
          enqueueHydration(entry);
        } else if (canStartPlayback) {
          playSafely(entry.video);
        }
      } else {
        pauseSafely(entry.video);
      }
    }
  });
}

function scheduleSync(): void {
  if (syncScheduled || typeof window === 'undefined') return;
  syncScheduled = true;
  requestAnimationFrame(syncNow);
}

function markScrollFinished(): void {
  if (scrollIdleTimer) {
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = null;
  }
  if (!isScrolling) return;
  isScrolling = false;
  scheduleSync();
  if (hydrationQueue.length > 0 && !hydrationStepTimer) {
    hydrationStepTimer = setTimeout(pumpHydrationQueue, 24);
  }
}

function handlePassiveScroll(): void {
  isScrolling = true;
  if (hydrationStepTimer) {
    clearTimeout(hydrationStepTimer);
    hydrationStepTimer = null;
  }
  if (scrollIdleTimer) clearTimeout(scrollIdleTimer);
  scrollIdleTimer = setTimeout(markScrollFinished, SCROLL_FALLBACK_IDLE_MS);
}

function ensureObservers(): void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

  if (!preloadObserver) {
    preloadObserver = new IntersectionObserver(
      (ioEntries) => {
        for (const ioEntry of ioEntries) {
          if (!ioEntry.isIntersecting) continue;
          const managed = entries.get(ioEntry.target as HTMLVideoElement);
          if (!managed) continue;
          if (managed.desktopOnly && !isDesktopViewport()) continue;
          enqueueHydration(managed);
          preloadObserver?.unobserve(managed.video);
        }
      },
      { rootMargin: '180px 0px' },
    );
  }

  if (!viewportObserver) {
    viewportObserver = new IntersectionObserver(
      (ioEntries) => {
        for (const ioEntry of ioEntries) {
          const managed = entries.get(ioEntry.target as HTMLVideoElement);
          if (!managed) continue;
          managed.viewportRatio = ioEntry.isIntersecting ? ioEntry.intersectionRatio : 0;
        }
        scheduleSync();
      },
      { threshold: [0, 0.2, 0.55] },
    );
  }

  if (!centerObserver) {
    centerObserver = new IntersectionObserver(
      (ioEntries) => {
        for (const ioEntry of ioEntries) {
          const managed = entries.get(ioEntry.target as HTMLVideoElement);
          if (!managed) continue;
          managed.centerRatio = ioEntry.isIntersecting ? ioEntry.intersectionRatio : 0;
        }
        scheduleSync();
      },
      { rootMargin: '-20% 0px -20% 0px', threshold: [0, 0.35, 0.75] },
    );
  }

  if (!listenersBound) {
    listenersBound = true;
    window.addEventListener('scroll', handlePassiveScroll, { passive: true });
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', markScrollFinished, { passive: true });
    }
    const desktopMq = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    desktopMq.addEventListener('change', scheduleSync);
    reducedMq.addEventListener('change', scheduleSync);
    document.addEventListener('visibilitychange', scheduleSync);
  }
}

/** Notifie le gestionnaire qu'un changement de vue ou de recouvrement (`stack`) a eu lieu */
export function notifyVideoLayoutChange(): void {
  scheduleSync();
}

/** Enregistre un élément `<video>` auprès du coordinateur de chargement et de lecture */
export function registerManagedVideo(
  video: HTMLVideoElement,
  options: ManagedVideoOptions = {},
): () => void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return () => {};
  }

  const existing = entries.get(video);
  if (existing) {
    if (options.onReady && video.readyState >= 2) {
      options.onReady();
    }
    return existing.cleanup;
  }

  ensureObservers();

  const hasInitialSrc = Boolean(video.getAttribute('src'));
  const desktopOnly = Boolean(options.desktopOnly || video.dataset.desktopOnly === 'true');
  const isHeroCollage = Boolean(video.closest('.home-hero__collage'));

  const markReady = () => {
    video.classList.add('is-ready');
    entry.onReady?.();
  };

  const cleanup = () => {
    video.removeEventListener('loadeddata', markReady);
    preloadObserver?.unobserve(video);
    viewportObserver?.unobserve(video);
    centerObserver?.unobserve(video);
    pauseSafely(video);
    entries.delete(video);
    const qIdx = hydrationQueue.indexOf(entry);
    if (qIdx !== -1) hydrationQueue.splice(qIdx, 1);
    scheduleSync();
  };

  const entry: VideoEntry = {
    video,
    desktopOnly,
    isHeroCollage,
    onReady: options.onReady,
    hydrated: hasInitialSrc,
    centerRatio: 0,
    viewportRatio: 0,
    cleanup,
  };

  if (video.readyState >= 2) {
    markReady();
  } else {
    video.addEventListener('loadeddata', markReady, { once: true });
  }

  entries.set(video, entry);

  if (!hasInitialSrc && !isHeroCollage) {
    preloadObserver?.observe(video);
  }

  viewportObserver?.observe(video);
  centerObserver?.observe(video);

  return cleanup;
}

/** Découvre et orchestre tous les `<video data-video-loop>` rendus en SSR dans `root` */
export function initVideoPlayback(root: ParentNode = document): void {
  if (typeof window === 'undefined') return;

  if (root === document) {
    initialBootSettled = false;
    if (bootSettleTimer) clearTimeout(bootSettleTimer);
    bootSettleTimer = setTimeout(() => {
      bootSettleTimer = null;
      initialBootSettled = true;
      scheduleSync();
      if (hydrationQueue.length > 0 && !hydrationStepTimer && !isScrolling) {
        hydrationStepTimer = setTimeout(pumpHydrationQueue, 16);
      }
    }, BOOT_SETTLE_MS);
  }

  const videos = root.querySelectorAll<HTMLVideoElement>('video[data-video-loop]');
  videos.forEach((video) => {
    registerManagedVideo(video, {
      desktopOnly: video.dataset.desktopOnly === 'true',
    });
  });

  scheduleSync();
}

/** Libère proprement les observateurs et flux de la page précédente lors d'une navigation ClientRouter */
export function resetVideoPlayback(): void {
  if (bootSettleTimer) {
    clearTimeout(bootSettleTimer);
    bootSettleTimer = null;
  }
  if (hydrationStepTimer) {
    clearTimeout(hydrationStepTimer);
    hydrationStepTimer = null;
  }
  if (scrollIdleTimer) {
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = null;
  }
  isScrolling = false;
  hydrationQueue.length = 0;

  const snapshot = Array.from(entries.values());
  snapshot.forEach((entry) => {
    entry.cleanup();
  });
}
