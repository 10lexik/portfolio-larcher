<script lang="ts">
  import './Counter.css';
  import { onMount } from 'svelte';
  import { prefersReducedMotion } from '@core/motion/reveal';

  interface Props {
    /** Valeur finale */
    value: number;
    prefix?: string;
    suffix?: string;
    /** Durée de l'animation en millisecondes */
    duration?: number;
    class?: string;
  }

  let { value, prefix = '', suffix = '', duration = 1400, class: className = '' }: Props = $props();

  // Rendu serveur et sans JavaScript : la valeur finale est déjà visible.
  let current = $state<number | null>(null);
  let root: HTMLElement | undefined = $state();

  const shown = $derived(Math.round(current ?? value));

  onMount(() => {
    if (!root || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;
    let frame = 0;
    current = 0;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        current = value * eased;
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  });
</script>

<span bind:this={root} class={['counter', className]} aria-label={`${prefix}${value}${suffix}`}>
  <span aria-hidden="true">{prefix}{shown}{suffix}</span>
</span>
