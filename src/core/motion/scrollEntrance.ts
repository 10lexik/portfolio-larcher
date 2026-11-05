/**
 * Contrôleur partagé d'entrée et de réinitialisation hors-écran pour `ScrollTrigger`.
 *
 * Résout deux écarts critiques sur mobile (iOS Safari / Chrome Android) lorsque
 * `ScrollTrigger.config({ ignoreMobileResize: true })` est actif :
 *
 *  1. **Écart `svh` ↔ `lvh` au retour de scroll rapide (`onLeaveBack`)** :
 *     Au chargement initial (`scrollY = 0`), la barre d'adresse mobile est dépliée (`svh`, ex. `660px`),
 *     donc `ScrollTrigger` fige `st.start = docTop - 660`. Une fois la barre repliée au scroll (`lvh`,
 *     ex. `790px`), `onLeaveBack` se déclenche dès que l'élément repasse sous `660px` alors que
 *     `window.innerHeight` vaut `790px`. Au lieu d'abandonner définitivement la remise à zéro (ce qui
 *     laissait l'élément à `autoAlpha: 1` hors écran), `resetOrDeferBelowFold` attend de façon passive
 *     la frame exacte où l'élément quitte réellement le bas du viewport (`naturalTop >= innerHeight - 1`)
 *     pour le remettre à `autoAlpha: 0` hors de vue.
 *
 *  2. **Garde anti-flash à la ré-entrée (`playSmartEntrance`, alignée sur `norml-refonte/entrances.ts`)** :
 *     Si un élément n'a jamais quitté l'écran (inversion de scroll dans la bande `[svh, lvh]` ou en plein
 *     tween) et possède déjà `opacity >= 0.05` (ou `scaleX >= 0.05` pour un filet), on anime en continuité
 *     via `gsap.to()` depuis son état courant au lieu de `gsap.fromTo({ autoAlpha: 0 })`, interdisant
 *     structurellement toute disparition brusque à l'écran.
 */
import gsap from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

interface DeferredResetEntry {
  st: ScrollTrigger;
  trigger: HTMLElement;
  resetFn: () => void;
}

const pendingExitResets = new Map<ScrollTrigger, DeferredResetEntry>();
let listenersAttached = false;
let rafId = 0;

/** Position verticale statique du bord haut de `el` dans le viewport (hors translation GSAP `y` en cours) */
function getNaturalTop(el: HTMLElement): number {
  const currentY = parseFloat(String(gsap.getProperty(el, 'y') ?? '0')) || 0;
  return el.getBoundingClientRect().top - currentY;
}

function flushPendingExitResets(): void {
  rafId = 0;
  if (typeof window === 'undefined' || pendingExitResets.size === 0) {
    detachListeners();
    return;
  }

  const vh = window.innerHeight;
  for (const [st, entry] of pendingExitResets.entries()) {
    const { trigger, resetFn } = entry;
    if (!trigger.isConnected || st.isActive) {
      pendingExitResets.delete(st);
      continue;
    }
    if (getNaturalTop(trigger) >= vh - 1) {
      pendingExitResets.delete(st);
      resetFn();
    }
  }

  if (pendingExitResets.size === 0) {
    detachListeners();
  }
}

function scheduleCheck(): void {
  if (rafId !== 0 || typeof window === 'undefined') return;
  rafId = window.requestAnimationFrame(flushPendingExitResets);
}

function attachListeners(): void {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;
  window.addEventListener('scroll', scheduleCheck, { passive: true });
  window.addEventListener('resize', scheduleCheck, { passive: true });
  window.visualViewport?.addEventListener('resize', scheduleCheck, { passive: true });
}

function detachListeners(): void {
  if (!listenersAttached || typeof window === 'undefined') return;
  listenersAttached = false;
  window.removeEventListener('scroll', scheduleCheck);
  window.removeEventListener('resize', scheduleCheck);
  window.visualViewport?.removeEventListener('resize', scheduleCheck);
  if (rafId !== 0) {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

/** Annule toute remise à zéro différée en attente pour ce `ScrollTrigger` (ex. lors d'un `onEnter`) */
export function cancelDeferredReset(st?: ScrollTrigger | null): void {
  if (!st) return;
  pendingExitResets.delete(st);
  if (pendingExitResets.size === 0) {
    detachListeners();
  }
}

/** Purge toutes les remises à zéro différées lors d'un changement de page (`beginPage`) */
export function clearAllDeferredResets(): void {
  pendingExitResets.clear();
  detachListeners();
}

/**
 * Réinitialise immédiatement la cible si elle est déjà sous le bas réel du viewport (`window.innerHeight`),
 * ou arme une surveillance passive ultra-légère jusqu'à sa sortie effective de l'écran.
 */
export function resetOrDeferBelowFold(
  st: ScrollTrigger,
  trigger: HTMLElement,
  resetFn: () => void,
): void {
  if (typeof window === 'undefined') return;
  if (getNaturalTop(trigger) >= window.innerHeight - 1) {
    pendingExitResets.delete(st);
    resetFn();
    if (pendingExitResets.size === 0) detachListeners();
    return;
  }

  pendingExitResets.set(st, { st, trigger, resetFn });
  attachListeners();
}

function isElementHidden(el: HTMLElement, fromVars: gsap.TweenVars): boolean {
  if ('autoAlpha' in fromVars || 'opacity' in fromVars) {
    const computedVisibility = typeof window !== 'undefined' ? getComputedStyle(el).visibility : '';
    if (computedVisibility === 'hidden') return true;
    const currentOpacity = parseFloat(String(gsap.getProperty(el, 'opacity') ?? '0'));
    return currentOpacity < 0.05;
  }
  if ('scaleX' in fromVars) {
    const currentScaleX = parseFloat(String(gsap.getProperty(el, 'scaleX') ?? '0'));
    return currentScaleX < 0.05;
  }
  return true;
}

/**
 * Joue une entrée `ScrollTrigger` sans jamais faire clignoter un élément déjà visible à l'écran :
 *  - les cibles réellement masquées (`opacity < 0.05` / `visibility: hidden`) partent de `fromVars` (`fromTo`) ;
 *  - les cibles déjà visibles ou en cours d'entrée convergent vers `toVars` (`to`) sans repasser par `0`.
 */
export function playSmartEntrance(
  targets: HTMLElement | HTMLElement[],
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
): void {
  const list = Array.isArray(targets) ? targets : [targets];
  const connected = list.filter((el) => el.isConnected);
  if (connected.length === 0) return;

  const hidden: HTMLElement[] = [];
  const visible: HTMLElement[] = [];

  for (const el of connected) {
    if (isElementHidden(el, fromVars)) {
      hidden.push(el);
    } else {
      visible.push(el);
    }
  }

  if (hidden.length > 0) {
    gsap.fromTo(hidden, { ...fromVars }, { ...toVars, overwrite: true });
  }

  if (visible.length > 0) {
    gsap.to(visible, { ...toVars, overwrite: true });
  }
}
