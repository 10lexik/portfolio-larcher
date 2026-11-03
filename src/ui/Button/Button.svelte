<script lang="ts">
  import './Button.css';
  import type { ButtonProp } from '@ui/types';
  import { safeURL, sanitizeSvg } from '@core/utils/security';

  let {
    label,
    href,
    link,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    target,
    rel,
    icon,
    iconPosition = 'left',
    class: className = '',
    type = 'button',
    children,
    onClick,
    ...rest
  }: ButtonProp = $props();

  const rawHref = $derived.by(() => {
    if (href) return href;
    if (!link) return '';
    if (typeof link === 'string') return link;
    return link.url ?? link.href ?? '';
  });

  const resolvedHref = $derived(safeURL(rawHref));

  const classes = $derived([
    'btn',
    `btn--${variant}`,
    variant !== 'unstyled' && `btn--${size}`,
    fullWidth ? 'btn--full' : 'btn--auto',
    className,
  ]);

  function handleClick(e: MouseEvent) {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  }
</script>

<!--
  @component
  Primitive d'action polymorphe (`<button>` ou `<a>` selon `href`/`link` et `disabled`).
  Assainit systématiquement les URL (`safeURL`) et icônes SVG inline (`sanitizeSvg`), et expose
  `data-vector-btn-label` pour les contours vectoriels animés.
-->
{#snippet contentSnippet()}
  {#if icon && iconPosition === 'left'}
    <span class="btn__icon btn__icon--left">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <span class="btn__icon-svg">{@html sanitizeSvg(icon)}</span>
    </span>
  {/if}

  {#if children}
    <span class="btn__label" data-vector-btn-label>{@render children()}</span>
  {:else if label}
    <span class="btn__label" data-vector-btn-label>{label}</span>
  {/if}

  {#if icon && iconPosition === 'right'}
    <span class="btn__icon btn__icon--right">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <span class="btn__icon-svg">{@html sanitizeSvg(icon)}</span>
    </span>
  {/if}
{/snippet}

{#if resolvedHref && !disabled}
  <a
    href={resolvedHref}
    class={classes}
    {target}
    {rel}
    data-astro-reload={resolvedHref.startsWith('/storybook') ? '' : undefined}
    onclick={handleClick}
    {...rest}
  >
    {@render contentSnippet()}
  </a>
{:else}
  <button {type} class={classes} {disabled} onclick={handleClick} {...rest}>
    {@render contentSnippet()}
  </button>
{/if}
