/**
 * Point d'entrée unique du moteur d'animation GSAP (`src/core/motion/reveal.ts`).
 *
 * Respecte le contrat `data-reveal` tout en orchestrant l'ensemble des moteurs GSAP :
 *  - `AnimationOrchestrator` (cycle de vie ClientRouter, Loader, 1re vague, ScrollTriggers)
 *  - `sectionTimeline` (`[data-section-timeline]`)
 *  - `staggeredGrid` (grilles en cascade par rangée visuelle)
 *  - `textSplitter` (découpage typographique accessible des titres)
 *  - `stacking` (`[data-stack]` & `[data-stack-reveal]`)
 *  - `parallax` & `vectorBorder`
 */
import { orchestrator } from './AnimationOrchestrator';
import { prefersReducedMotion } from './motion';

export { orchestrator, prefersReducedMotion };

/** Initialise les animations GSAP et ScrollTrigger sur `root` (document complet ou canevas Storybook) */
export function initReveal(root: ParentNode = document): () => void {
  orchestrator.startPage(root);
  return () => {};
}
