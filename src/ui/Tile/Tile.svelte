<script lang="ts">
  import './Tile.css';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Accent } from '@core/content/types';
  import { formatTitleTypography } from '@core/utils/text';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** Étiquette en capitales au-dessus du contenu */
    label?: string;
    /** Titre de la carte */
    title?: string;
    /** Filet de couleur en haut de la carte */
    accent?: Accent;
    /** Légère élévation au survol (cartes cliquables) */
    interactive?: boolean;
    /** Supprime le padding (média plein cadre) */
    flush?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    label,
    title,
    accent = 'none',
    interactive = false,
    flush = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
</script>

<div
  class={[
    'tile',
    accent !== 'none' && 'tile--accent',
    accent !== 'none' && `tile--accent-${accent}`,
    interactive && 'tile--interactive',
    flush && 'tile--flush',
    className,
  ]}
  {...rest}
>
  {#if label}<p class="tile__label">{label}</p>{/if}
  {#if title}<h3 class="tile__title">{formatTitleTypography(title)}</h3>{/if}
  {#if children}{@render children()}{/if}
</div>
