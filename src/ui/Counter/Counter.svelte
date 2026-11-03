<script lang="ts">
  import './Counter.css';
  import { onMount } from 'svelte';
  import { bindCounterElement } from '@core/motion/counter';

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

  let root: HTMLElement | undefined = $state();

  onMount(() => {
    if (!root) return;
    return bindCounterElement(root);
  });
</script>

<!--
  @component
  Compteur numérique progressif déclenché à l'entrée dans le viewport (`IntersectionObserver`).
  Affiche immédiatement la valeur finale en SSR, sans JS ou lorsque `prefers-reduced-motion: reduce` est actif,
  tout en exposant la valeur cible complète aux lecteurs d'écran via `aria-label`.
-->
<span
  bind:this={root}
  class={['counter', className]}
  aria-label={`${prefix}${value}${suffix}`}
  data-counter-value={value}
  data-counter-prefix={prefix || undefined}
  data-counter-suffix={suffix || undefined}
  data-counter-duration={duration}
>
  <span data-counter-text aria-hidden="true">{prefix}{Math.round(value)}{suffix}</span>
</span>
