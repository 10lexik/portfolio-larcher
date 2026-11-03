<script lang="ts">
  import './Split.css';
  import type { Snippet } from 'svelte';

  /**
   * Mise en page asymétrique ou équilibrée à deux colonnes (empilées en mobile-first, côte à côte dès `768px`).
   * Associe une colonne éditoriale (`children`) et une colonne visuelle ou technique (`media`).
   */
  interface Props {
    /** Place la colonne `media` à gauche sur grand écran (`>= 768px`) */
    reverse?: boolean;
    /** Aligne verticalement les deux colonnes au centre */
    center?: boolean;
    /** Colonne principale (texte, code ou arborescence) */
    children?: Snippet;
    /** Colonne secondaire (média, extrait de code ou pile de cartes) */
    media?: Snippet;
    class?: string;
  }

  let { reverse = false, center = true, children, media, class: className = '' }: Props = $props();
</script>

<!--
  @component
  Mise en page à deux colonnes (empilées en mobile-first, côte à côte dès `768px`).
  Associe une colonne éditoriale (`children: Snippet`) et une colonne visuelle ou technique (`media: Snippet`),
  avec inversion d'ordre desktop (`reverse`) et centrage vertical optionnel (`center`).
-->
<div class={['split', reverse && 'split--reverse', center && 'split--center', className]}>
  <div class="split__text" data-reveal>
    {#if children}{@render children()}{/if}
  </div>
  <div class="split__media" data-reveal>
    {#if media}{@render media()}{/if}
  </div>
</div>
