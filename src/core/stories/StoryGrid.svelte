<script lang="ts">
  import './StoryGrid.css';
  import type { StoryCell } from './storyHelpers';

  interface Props {
    cells: StoryCell[];
    /** Empile chaque variante sur toute la largeur (ex. titres, séparateurs, tuiles larges) */
    stack?: boolean;
    /** Largeur minimale d'une cellule CSS (ex. `13rem`) */
    minWidth?: string;
  }

  let { cells, stack = false, minWidth = '14rem' }: Props = $props();
</script>

<!--
  @component
  Grille interne de présentation multi-variantes (`AllVariants` / `ScaleMatrix`) pour Storybook.
-->
<ul class={['story-grid', stack && 'story-grid--stack']} style:--story-grid-min={minWidth}>
  {#each cells as cell (cell.caption)}
    {@const CellComponent = cell.component}
    <li class="story-grid__cell">
      <div class="story-grid__stage">
        <CellComponent {...cell.props} />
      </div>
      <p class="story-grid__caption">{cell.caption}</p>
    </li>
  {/each}
</ul>

