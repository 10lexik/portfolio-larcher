<script lang="ts">
  import './Bento.css';
  import type { Accent } from '@core/content/types';
  import Tile from '@ui/Tile/Tile.svelte';

  export interface BentoItem {
    label?: string;
    title: string;
    text: string;
    accent?: Accent;
    /** Largeur de la carte en colonnes (grille de 3 colonnes à partir de 768px) */
    span?: 1 | 2 | 3;
  }

  interface Props {
    items: BentoItem[];
    class?: string;
  }

  let { items, class: className = '' }: Props = $props();
</script>

<!--
  @component
  Grille éditoriale modulaire 3 colonnes (`>= 768px`) assemblant des primitives `<Tile>`.
  Chaque cellule contrôle son étendue horizontale (`span: 1 | 2 | 3`) et son entrée séquencée (`--reveal-index`).
-->
<div class={['bento', className]}>
  {#each items as item, i (item.title)}
    <div
      class={['bento__cell', `bento__cell--span-${item.span ?? 1}`]}
      data-reveal
      style:--reveal-index={i}
    >
      <Tile
        label={item.label}
        title={item.title}
        accent={item.accent ?? 'none'}
        class="bento__tile"
      >
        <p>{item.text}</p>
      </Tile>
    </div>
  {/each}
</div>
