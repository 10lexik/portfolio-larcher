/**
 * Géométrie statique — source unique des mesures de ScrollTrigger.
 *
 * Toutes les mesures portent sur la boîte de mise en page (offsetTop / offsetHeight) et ignorent
 * les transforms posés par les entrées (fade-up, y), les parallaxes ou les zooms de survol.
 */

/** Position verticale dans le document de la boîte de mise en page (transforms ignorés) */
export function documentTop(el: HTMLElement): number {
  let top = 0;
  let last = el;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    last = node;
    const parent = node.offsetParent as HTMLElement | null;
    if (parent) top += parent.clientTop;
    node = parent;
  }
  if (typeof window !== 'undefined' && getComputedStyle(last).position === 'fixed') {
    top += window.scrollY;
  }
  return top;
}
