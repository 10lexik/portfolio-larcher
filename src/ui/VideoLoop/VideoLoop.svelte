<script lang="ts">
  import './VideoLoop.css';
  import { onMount } from 'svelte';
  import { prefersReducedMotion } from '@core/motion/reveal';

  interface Props {
    src: string;
    /** Description de la vidéo pour les technologies d'assistance */
    label: string;
    caption?: string;
    ratio?: string;
    poster?: string;
    class?: string;
  }

  let { src, label, caption, ratio = '9 / 16', poster, class: className = '' }: Props = $props();

  let video: HTMLVideoElement | undefined = $state();
  let reduced = $state(false);

  onMount(() => {
    reduced = prefersReducedMotion();
    if (!video || reduced || typeof IntersectionObserver === 'undefined') return;
    const el = video;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) void el.play().catch(() => {});
          else el.pause();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  });
</script>

<figure class={['video-loop', className]}>
  <div class="video-loop__frame" style:aspect-ratio={ratio}>
    <video
      bind:this={video}
      class="video-loop__media"
      {src}
      {poster}
      aria-label={label}
      muted
      loop
      playsinline
      preload="metadata"
      controls={reduced}
    ></video>
  </div>
  {#if caption}<figcaption class="video-loop__caption">{caption}</figcaption>{/if}
</figure>
