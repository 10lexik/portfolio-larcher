<script lang="ts">
  import './Figure.css';
  import type { Locale } from '@core/content/types';
  import { t } from '@core/i18n/t';
  import Badge from '@ui/Badge/Badge.svelte';

  /**
   * Cadre média illustré avec légende `<figcaption>` et visionneuse plein écran native (`<dialog>`).
   */
  interface Props {
    src: string;
    alt: string;
    caption?: string;
    /** Rapport largeur / hauteur du cadre (ex. `16 / 10`) ; `auto` conserve le ratio de l'image */
    ratio?: string;
    fit?: 'cover' | 'contain';
    /** Ouvre l'image en grand au clic (boîte de dialogue native) */
    lightbox?: boolean;
    /** Étiquette « Reconstitution » pour les visuels qui n'existent pas en production */
    reconstruction?: boolean;
    /** Image prioritaire (au-dessus de la ligne de flottaison) */
    priority?: boolean;
    /** Langue des libellés d'accessibilité (`zoom`, `close`, `reconstitution`) */
    locale?: Locale;
    class?: string;
  }

  let {
    src,
    alt,
    caption,
    ratio = 'auto',
    fit = 'cover',
    lightbox = true,
    reconstruction = false,
    priority = false,
    locale = 'fr',
    class: className = '',
  }: Props = $props();

  let dialog: HTMLDialogElement | undefined = $state();

  function open() {
    dialog?.showModal();
  }

  function close() {
    dialog?.close();
  }

  function onDialogClick(event: MouseEvent) {
    if (event.target === dialog) close();
  }
</script>

<!--
  @component
  Cadre média sémantique (`<figure>` / `<figcaption>`) avec visionneuse modale native `<dialog>`.
  Gère le focus trap natif du navigateur, la fermeture clavier (`Escape`), le clic sur l'arrière-plan
  et le badge éditorial « Reconstitution » localisé (`FR / EN`).
-->
<figure class={['figure', className]}>
  <div class="figure__frame" style:aspect-ratio={ratio === 'auto' ? undefined : ratio}>
    {#if lightbox}
      <button
        type="button"
        class="figure__open"
        onclick={open}
        aria-label={`${t('zoom', locale)} : ${alt}`}
      >
        <img
          {src}
          {alt}
          class={['figure__img', `figure__img--${fit}`]}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      </button>
    {:else}
      <img
        {src}
        {alt}
        class={['figure__img', `figure__img--${fit}`]}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    {/if}
    {#if reconstruction}
      <span class="figure__tag"
        ><Badge label={t('reconstitution', locale)} variant="outline" size="sm" /></span
      >
    {/if}
  </div>
  {#if caption}<figcaption class="figure__caption">{caption}</figcaption>{/if}
</figure>

{#if lightbox}
  <dialog bind:this={dialog} class="figure__dialog" onclick={onDialogClick} aria-label={alt}>
    <img {src} {alt} class="figure__dialog-img" />
    <button type="button" class="figure__close" onclick={close}>{t('close', locale)}</button>
  </dialog>
{/if}
