<script lang="ts">
  import './Heading.css';
  import type { HeadingProp, HeadingVariant } from '@ui/types';
  import { formatTitleTypography, splitTitle } from '@core/utils/text';

  let {
    text = '',
    children,
    as = 'h2',
    variant,
    tone = 'default',
    splitTone = false,
    subtitle = '',
    subtitleClass = '',
    appear = false,
    class: className = '',
  }: HeadingProp = $props();

  const variantClass = $derived.by(() => {
    if (variant) {
      return `heading--${variant}`;
    }
    if (!className && !splitTone) {
      const fallback: HeadingVariant =
        as === 'h1' || as === 'h2' || as === 'h3' || as === 'h4' ? as : 'body';
      return `heading--${fallback}`;
    }
    return '';
  });

  const toneClass = $derived(
    tone === 'accent' || tone === 'muted' || tone === 'inverse' ? `heading--${tone}` : '',
  );

  const parsed = $derived.by(() => {
    if (!splitTone || !text) {
      return {
        mainTitle: formatTitleTypography(text),
        subTitle: subtitle ? formatTitleTypography(subtitle) : null,
      };
    }
    const res = splitTitle(text);
    return {
      mainTitle: res.mainTitle,
      subTitle: subtitle ? formatTitleTypography(subtitle) : res.subTitle,
    };
  });

  const animAttrs = $derived(appear ? { 'data-reveal': '' } : {});
</script>

{#snippet contentSnippet()}
  {#if children}
    {@render children()}
  {:else if splitTone}
    {#if splitTone === 'badge' && parsed.subTitle}
      <span class="heading__block">
        <span class="heading__badge-pill">
          {parsed.mainTitle}
        </span>
      </span>
      <span
        class={[
          'heading__subtitle',
          'heading__subtitle--clamped',
          !subtitleClass && 'heading__subtitle--accent',
          subtitleClass,
        ]}
      >
        {parsed.subTitle}
      </span>
    {:else}
      <span class="heading__main-clamp">{parsed.mainTitle}</span>
      {#if parsed.subTitle}
        <span
          class={[
            'heading__subtitle',
            'heading__subtitle--clamped',
            !subtitleClass && 'heading__subtitle--accent',
            subtitleClass,
          ]}
        >
          {parsed.subTitle}
        </span>
      {/if}
    {/if}
  {:else if parsed.subTitle}
    <span class="heading__block">{parsed.mainTitle}</span>
    <span
      class={['heading__subtitle', !subtitleClass && 'heading__subtitle--accent', subtitleClass]}
    >
      {parsed.subTitle}
    </span>
  {:else}
    {parsed.mainTitle}
  {/if}
{/snippet}

<svelte:element this={as} class={['heading', variantClass, toneClass, className]} {...animAttrs}>
  {@render contentSnippet()}
</svelte:element>
