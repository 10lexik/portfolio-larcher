<script lang="ts">
  import './Stats.css';
  import type { Kpi } from '@core/content/types';
  import Counter from '@ui/Counter/Counter.svelte';

  interface Props {
    items: Kpi[];
    class?: string;
  }

  let { items, class: className = '' }: Props = $props();
</script>

<!--
  @component
  Bandeau d'indicateurs clés de performance (KPI) combinant valeurs animées (`<Counter>`)
  et plages textuelles formatées (`display`), avec libellé et note contextuelle.
-->
<ul class={['stats', className]}>
  {#each items as item (item.label)}
    <li class="stats__item" data-reveal>
      {#if item.display}
        <span class="counter stats__value">{item.display}</span>
      {:else}
        <Counter
          class="stats__value"
          value={item.value}
          prefix={item.prefix}
          suffix={item.suffix}
        />
      {/if}
      <p class="stats__label">{item.label}</p>
      {#if item.note}<p class="stats__note">{item.note}</p>{/if}
    </li>
  {/each}
</ul>
