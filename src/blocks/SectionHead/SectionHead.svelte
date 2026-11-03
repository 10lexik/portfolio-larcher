<script lang="ts">
  import './SectionHead.css';
  import type { Snippet } from 'svelte';
  import { formatTitleTypography } from '@core/utils/text';

  /**
   * En-tête éditorial normalisé d'une bande `<Section>`.
   * Orchestre sur une timeline GSAP commune (`[data-section-timeline]`) :
   * surtitre (`eyebrow`), titre sémantique typographié (`h1`–`h3`), chapô (`lead`) et filet dégradé.
   */
  interface Props {
    /** Surtitre court en capitales au-dessus du titre */
    eyebrow?: string;
    /** Titre principal (espaces insécables appliquées automatiquement) */
    title: string;
    /** Paragraphe d'introduction optionnel sous le titre */
    lead?: string;
    /** Identifiant HTML du titre (cible de `aria-labelledby` sur `<Section>`) */
    id?: string;
    /** Niveau de titre sémantique */
    as?: 'h1' | 'h2' | 'h3';
    /** Contenu riche optionnel remplaçant `title` (ex. emphase `<em>` dégradée) */
    titleSlot?: Snippet;
    class?: string;
  }

  let { eyebrow, title, lead, id, as = 'h2', titleSlot, class: className = '' }: Props = $props();

  const formattedTitle = $derived(formatTitleTypography(title));
</script>

<!--
  @component
  En-tête éditorial normalisé d'une bande `<Section>`.
  Orchestre sur une timeline GSAP commune (`[data-section-timeline]`) le surtitre (`eyebrow`),
  le titre sémantique typographié (`h1`–`h3`), le chapô (`lead`) et le filet dégradé.
-->
<header class={['section-head', className]} data-section-timeline>
  {#if eyebrow}
    <p class="eyebrow" data-stl-badge>{eyebrow}</p>
  {/if}
  <svelte:element this={as} {id} class="section-head__title" data-stl-title>
    {#if titleSlot}
      {@render titleSlot()}
    {:else}
      {formattedTitle}
    {/if}
  </svelte:element>
  {#if lead}
    <p class="lead" data-stl-subtitle>{lead}</p>
  {/if}
  <span class="section-head__border" data-stl-border aria-hidden="true"></span>
</header>
