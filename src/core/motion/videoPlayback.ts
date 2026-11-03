/**
 * Orchestrateur partagé de chargement différé et de lecture des boucles `<video>`.
 *
 * - Sur mobile (< 768 px) :
 *   - Les vidéos `desktopOnly` (collage Hero) ne sont ni téléchargées ni décodées.
 *   - Dans la mosaïque et les démonstrations sous le pli, seule la carte la plus centrée
 *     dans la bande médiane du viewport est lue simultanément (zéro écouteur `scroll` JS :
 *     calcul 100 % délégué au moteur natif `IntersectionObserver`).
 * - Sur les navigateurs dépourvus du support natif `<video loading="lazy">` (Safari iOS, Firefox),
 *   un `IntersectionObserver` de préchargement (`rootMargin: '260px 0px'`) restaure `src` et
 *   `preload="metadata"` juste avant l'entrée dans le viewport.
 */
import { prefersReducedMotion } from './motion';

interface ManagedVideoOptions {
  desktopOnly?: boolean;
  onReady?: () => void;
}

interface VideoEntry {
  video: HTMLVideoElement;
  desktopOnly: boolean;
  onReady?: () => void;
  hydrated: boolean;
  centerRatio: number;
  viewportRatio: number;
}

const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

const entries = new Map<HTMLVideoElement, VideoEntry>();

let preloadObserver: IntersectionObserver | null = null;
let viewportObserver: IntersectionObserver | null = null;
let centerObserver: IntersectionObserver | null = null;
let listenersBound = false;
let syncScheduled = false;

function isDesktopViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

function supportsNativeLazyMedia(): boolean {
  return (
    typeof HTMLMediaElement !== 'undefined' && Object.hasOwn(HTMLMediaElement.prototype, 'loading')
  );
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

function hydrateVideoSource(entry: VideoEntry): void {
  if (entry.hydrated) return;
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

function isHiddenByMosaicView(video: HTMLVideoElement, isDesktop: boolean): boolean {
  const showcase = video.closest<HTMLElement>('[data-mosaic-showcase]');
  if (!showcase) return false;
  const view = showcase.dataset.view ?? 'combined';
  if (view === 'desktop' && video.closest('[data-mosaic-mob-card]')) {
    return true;
  }
  if (view === 'mobile' && !isDesktop && video.closest('[data-mosaic-desk]')) {
    return true;
  }
  return false;
}

function getLogicalGroup(video: HTMLVideoElement): Element {
  return video.closest('[data-mosaic-stage], .cs-videos__item') ?? video;
}

function syncNow(): void {
  syncScheduled = false;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const hiddenTab = document.visibilityState === 'hidden';
  const reduced = prefersReducedMotion();
  const isDesktop = isDesktopViewport();

  if (hiddenTab || reduced) {
    entries.forEach(({ video }) => pauseSafely(video));
    return;
  }

  if (isDesktop) {
    entries.forEach((entry) => {
      const { video } = entry;
      if (isHiddenByMosaicView(video, true) || entry.viewportRatio < 0.25) {
        pauseSafely(video);
        return;
      }
      hydrateVideoSource(entry);
      if (entry.hydrated) {
        playSafely(video);
      }
    });
    return;
  }

  // Mobile (< 768 px) : 0 lecture sur `desktopOnly`, et 1 seule carte active au centre du viewport
  const groupScores = new Map<Element, number>();

  entries.forEach((entry) => {
    if (entry.desktopOnly) {
      pauseSafely(entry.video);
      return;
    }
    if (isHiddenByMosaicView(entry.video, false)) {
      pauseSafely(entry.video);
      return;
    }
    const score = entry.centerRatio > 0 ? entry.centerRatio + 1 : entry.viewportRatio * 0.5;
    if (score < 0.2) return;
    const group = getLogicalGroup(entry.video);
    const prev = groupScores.get(group) ?? 0;
    if (score > prev) {
      groupScores.set(group, score);
    }
  });

  let activeGroup: Element | null = null;
  let bestScore = 0;
  groupScores.forEach((score, group) => {
    if (score > bestScore) {
      bestScore = score;
      activeGroup = group;
    }
  });

  entries.forEach((entry) => {
    if (entry.desktopOnly) {
      pauseSafely(entry.video);
      return;
    }
    const group = getLogicalGroup(entry.video);
    if (activeGroup && group === activeGroup && !isHiddenByMosaicView(entry.video, false)) {
      hydrateVideoSource(entry);
      if (entry.hydrated) {
        playSafely(entry.video);
      }
    } else {
      pauseSafely(entry.video);
    }
  });
}

function scheduleSync(): void {
  if (syncScheduled || typeof window === 'undefined') return;
  syncScheduled = true;
  requestAnimationFrame(syncNow);
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
          hydrateVideoSource(managed);
          if (managed.hydrated) {
            preloadObserver?.unobserve(managed.video);
          }
        }
      },
      { rootMargin: '260px 0px' },
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
      { threshold: [0, 0.25, 0.6] },
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
      { rootMargin: '-22% 0px -22% 0px', threshold: [0, 0.35, 0.75] },
    );
  }

  if (!listenersBound) {
    listenersBound = true;
    const desktopMq = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    desktopMq.addEventListener('change', () => {
      if (isDesktopViewport()) {
        entries.forEach((entry) => {
          if (entry.desktopOnly && entry.viewportRatio > 0) {
            hydrateVideoSource(entry);
          }
        });
      }
      scheduleSync();
    });
    reducedMq.addEventListener('change', scheduleSync);
    document.addEventListener('visibilitychange', scheduleSync);
  }
}

/** Notifie le gestionnaire qu'un changement de vue (ex. switch BrandMosaic) a modifié la visibilité des calques */
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

  ensureObservers();

  const hasInitialSrc = Boolean(video.getAttribute('src'));
  const entry: VideoEntry = {
    video,
    desktopOnly: Boolean(options.desktopOnly),
    onReady: options.onReady,
    hydrated: hasInitialSrc,
    centerRatio: 0,
    viewportRatio: 0,
  };

  const handleReady = () => {
    entry.onReady?.();
  };

  if (video.readyState >= 2) {
    entry.onReady?.();
  } else {
    video.addEventListener('loadeddata', handleReady, { once: true });
  }

  entries.set(video, entry);

  // Sur les navigateurs supportant nativement `<video loading="lazy">`, on peut exposer `src`
  // directement hors mode `desktopOnly` mobile ; sinon l'IntersectionObserver diffère la requête.
  if (
    !hasInitialSrc &&
    video.dataset.src &&
    supportsNativeLazyMedia() &&
    !(entry.desktopOnly && !isDesktopViewport())
  ) {
    hydrateVideoSource(entry);
  } else if (!hasInitialSrc) {
    preloadObserver?.observe(video);
  }

  viewportObserver?.observe(video);
  centerObserver?.observe(video);

  return () => {
    video.removeEventListener('loadeddata', handleReady);
    preloadObserver?.unobserve(video);
    viewportObserver?.unobserve(video);
    centerObserver?.unobserve(video);
    pauseSafely(video);
    entries.delete(video);
    scheduleSync();
  };
}
