<script lang="ts">
  import './VideoLoop.css';
  import { onMount } from 'svelte';
  import { prefersReducedMotion } from '@core/motion/reveal';
  import { registerManagedVideo } from '@core/motion/videoPlayback';

  interface Props {
    src: string;
    /** Description de la vidéo pour les technologies d'assistance */
    label: string;
    caption?: string;
    ratio?: string;
    poster?: string;
    /** Diffère le chargement du poster et du flux vidéo hors écran */
    lazy?: boolean;
    /** Priorité réseau explicite du poster (`high` pour le candidat LCP, `low` pour une miniature secondaire) */
    posterPriority?: 'high' | 'low';
    /** Sur mobile (< 768 px), affiche uniquement le poster WebP sans télécharger ni décoder le MP4 */
    desktopOnly?: boolean;
    class?: string;
  }

  let {
    src,
    label,
    caption,
    ratio = '9 / 16',
    poster,
    lazy = false,
    posterPriority,
    desktopOnly = false,
    class: className = '',
  }: Props = $props();

  function parseIntrinsicDimensions(aspectRatio: string): { width: number; height: number } {
    const parts = aspectRatio.split('/').map((part) => Number.parseFloat(part.trim()));
    if (
      parts.length === 2 &&
      Number.isFinite(parts[0]) &&
      Number.isFinite(parts[1]) &&
      parts[0] > 0 &&
      parts[1] > 0
    ) {
      if (parts[0] >= parts[1]) {
        return { width: 960, height: Math.round((960 * parts[1]) / parts[0]) };
      }
      return { width: 360, height: Math.round((360 * parts[1]) / parts[0]) };
    }
    return { width: 360, height: 640 };
  }

  const dims = $derived(parseIntrinsicDimensions(ratio));
  const deferVideoSrc = $derived(lazy || desktopOnly);
  const lazyVideoAttrs = $derived(
    lazy ? ({ loading: 'lazy' } as Record<string, string>) : ({} as Record<string, string>),
  );

  let video: HTMLVideoElement | undefined = $state();
  let reduced = $state(false);
  let ready = $state(false);

  onMount(() => {
    reduced = prefersReducedMotion();
    if (!video) return;
    if (reduced && video.dataset.src && !desktopOnly) {
      video.src = video.dataset.src;
      delete video.dataset.src;
      ready = true;
      return;
    }
    return registerManagedVideo(video, {
      desktopOnly,
      onReady: () => {
        ready = true;
      },
    });
  });
</script>

<!--
  @component
  Boucle vidéo muette accessible optimisée pour les Core Web Vitals mobiles et desktop :
  dimensions intrinsèques anti-CLS, poster WebP prioritaire, chargement différé hors écran (`lazy`),
  mode `desktopOnly` zéro transfert vidéo sur mobile et bascule en lecteur natif sous `prefers-reduced-motion`.
-->
<figure class={['video-loop', desktopOnly && 'video-loop--desktop-only', className]}>
  <div class="video-loop__frame" style:aspect-ratio={ratio}>
    {#if poster}
      <img
        class="video-loop__poster"
        src={poster}
        alt=""
        width={dims.width}
        height={dims.height}
        loading={lazy ? 'lazy' : undefined}
        fetchpriority={lazy ? undefined : posterPriority}
        decoding={posterPriority === 'high' ? 'sync' : 'async'}
      />
    {/if}
    <video
      bind:this={video}
      class={['video-loop__media', (!poster || ready) && 'is-ready']}
      src={deferVideoSrc ? undefined : src}
      data-src={deferVideoSrc ? src : undefined}
      width={dims.width}
      height={dims.height}
      aria-label={label}
      muted
      loop
      playsinline
      preload={deferVideoSrc ? 'none' : 'metadata'}
      controls={reduced}
      onloadeddata={() => {
        ready = true;
      }}
      {...lazyVideoAttrs}
    ></video>
  </div>
  {#if caption}<figcaption class="video-loop__caption">{caption}</figcaption>{/if}
</figure>
