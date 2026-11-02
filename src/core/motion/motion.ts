/**
 * Motion Tokens (SSOT) — Source unique de vérité des animations GSAP & ScrollTrigger.
 * Aligné sur tokens.css.
 */

export const MOTION_DURATION = {
  /** Micro-interactions, feedback instantané : 0.15s */
  instant: 0.15,
  /** Transitions rapides (loaders, hovers) : 0.25s */
  fast: 0.25,
  /** Rythme standard (badges, étiquettes) : 0.5s */
  normal: 0.5,
  /** Titres de section, filets, blocs éditoriaux : 0.7s */
  moderate: 0.7,
  /** Vol fluide des grilles de cartes et cascades : 0.85s */
  glide: 0.85,
  /** Révélations amples, premières vagues d'en-tête, hero : 1.1s */
  epic: 1.1,
} as const;

export const MOTION_EASE = {
  /** Décélération naturelle type "glide" (cartes, listes, entrées standard) */
  out: 'power3.out',
  /** Mouvement symétrique pour rideaux, volets */
  inOut: 'power3.inOut',
  /** Amortissement doux et progressif pour titres et textes */
  smooth: 'power2.out',
  /** Décélération percutante "snap-glide" (filets, barres) */
  expo: 'expo.out',
} as const;

export const MOTION_DISTANCE = {
  /** Décalage discret (badges, eyebrows) : 14px */
  sm: 14,
  /** Décalage intermédiaire (paragraphes, sous-titres) : 28px */
  md: 28,
  /** Décalage standard pour grilles de cartes : 42px */
  lg: 42,
  /** Décalage ample pour grands titres et entrées majeures : 52px */
  xl: 52,
} as const;

const MOTION_STAGGER = {
  /** Cascade ultra-rapide (caractères / mots de titre) : 0.016s */
  micro: 0.016,
  /** Cascade resserrée (éléments d'en-tête, listes) : 0.05s */
  tight: 0.05,
  /** Standard pour grilles de cartes et mosaïques : 0.085s */
  cards: 0.085,
  /** Cascade éditoriale aérée : 0.12s */
  relaxed: 0.12,
} as const;

export const MOTION_SCROLL = {
  /** Seuil de déclenchement au bord inférieur exact du viewport */
  start: 'top bottom',
  startFraction: 1,
  /** Seuil de déclenchement pour en-têtes de section */
  startHeader: 'top bottom',
  startHeaderFraction: 1,
  /** Fin de la zone de visibilité */
  end: 'bottom top',
  endFraction: 0,
} as const;

export const MOTION_STACK = {
  /** Échelle finale du contenu recouvert (le fond reste pleine largeur) */
  scale: 0.92,
  /** Opacité finale du voile d'assombrissement */
  dim: 0.55,
  /** Remontée du contenu recouvert en fraction de la hauteur de section */
  drift: -0.22,
  /** Lissage du scrub (s) */
  scrub: 0.28,
} as const;

export const MOTION_PARALLAX = {
  /** Zoom de sécurité et course verticale (%) des cadres médias */
  fit: { scale: 1.06, travel: 3 },
  /** Seuil haut de document (px) pour démarrer la course à scroll 0 */
  topThreshold: 90,
} as const;

export const MOTION_ORCHESTRATOR = {
  /** Debounce des recalculs liés aux variations de hauteur du document (s) */
  refreshDebounce: 0.15,
  /** Décalage entre deux éléments de la première vague (s) */
  waveStep: 0.075,
  /** Étalement maximal de la première vague (s) */
  waveMaxSpan: 0.95,
  /** Durée du fondu de sortie avant changement de page (s) */
  outroDuration: 0.18,
  /** Barre de progression globale (#global-loader) */
  loader: {
    showDelayMs: 120,
    progressDuration: 3.2,
    finishDuration: 0.22,
    fadeOutDelay: 0.05,
  },
} as const;

export const MOTION_PRESETS = {
  /** Grille de cartes staggée par rangée visuelle */
  staggeredCards: {
    from: { autoAlpha: 0, y: MOTION_DISTANCE.lg, scale: 0.97 },
    to: {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: MOTION_DURATION.glide,
      stagger: MOTION_STAGGER.cards,
      ease: MOTION_EASE.out,
      force3D: true,
    },
    scroll: {
      start: MOTION_SCROLL.start,
      end: MOTION_SCROLL.end,
    },
  },
  /** Eyebrow / badge de section entrant de haut en bas */
  sectionBadge: {
    initial: { autoAlpha: 0 },
    from: { autoAlpha: 0, y: -MOTION_DISTANCE.sm },
    to: {
      autoAlpha: 1,
      y: 0,
      duration: MOTION_DURATION.normal,
      ease: MOTION_EASE.smooth,
    },
  },
  /** Titre de section entrant avec translation douce */
  sectionTitle: {
    initial: { autoAlpha: 0 },
    from: { autoAlpha: 0, y: MOTION_DISTANCE.md },
    to: {
      autoAlpha: 1,
      y: 0,
      duration: MOTION_DURATION.moderate,
      ease: MOTION_EASE.smooth,
    },
  },
  /** Sous-titre / lead de section entrant de droite à gauche */
  sectionSubtitle: {
    initial: { autoAlpha: 0 },
    from: { autoAlpha: 0, x: MOTION_DISTANCE.md },
    to: {
      autoAlpha: 1,
      x: 0,
      duration: MOTION_DURATION.moderate,
      ease: MOTION_EASE.smooth,
    },
  },
  /** Filet dégradé de section s'étendant pleine largeur */
  sectionBorder: {
    initial: { scaleX: 0, transformOrigin: 'left center' },
    from: { scaleX: 0, transformOrigin: 'left center' },
    to: {
      scaleX: 1,
      duration: 0.75,
      ease: MOTION_EASE.expo,
    },
  },
  /** Révélation typographique des titres (mots/caractères masqués) */
  splitTitle: {
    chars: {
      initial: { autoAlpha: 0, yPercent: 118 },
      from: { autoAlpha: 0, yPercent: 118 },
      to: {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.62,
        stagger: MOTION_STAGGER.micro,
        ease: MOTION_EASE.out,
        force3D: true,
      },
    },
  },
  /** Tracé périmétrique vectoriel SVG sur les boutons (stroke-dashoffset) */
  vectorBorderDraw: {
    stroke: {
      duration: 0.7,
      ease: 'power2.inOut',
    },
    label: {
      initial: { autoAlpha: 0, y: 6 },
      from: { autoAlpha: 0, y: 6 },
      to: {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
        ease: MOTION_EASE.smooth,
      },
    },
  },
} as const;

/** Indique si l'utilisateur préfère un mouvement réduit */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
