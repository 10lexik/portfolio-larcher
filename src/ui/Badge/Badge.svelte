<script lang="ts">
  import './Badge.css';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { safeURL } from '@core/utils/security';

  type BadgeVariant = 'primary' | 'dark' | 'gray' | 'light' | 'outline';
  type BadgeSize = 'sm' | 'md' | 'lg';

  interface Props extends HTMLAttributes<HTMLElement> {
    href?: string;
    label?: string;
    variant?: BadgeVariant;
    size?: BadgeSize;
    class?: string;
    children?: Snippet;
  }

  let {
    href,
    label,
    variant = 'primary',
    size = 'md',
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  const resolvedHref = $derived(href ? safeURL(href) : '');
</script>

<!--
  @component
  Étiquette compacte polymorphe (`<span>` statique ou lien `<a>` sécurisé par `safeURL`).
  Utilisée pour catégoriser les technologies, statuts, livrables et métadonnées de Case Study.
-->
{#if resolvedHref}
  <a
    href={resolvedHref}
    class={['badge', `badge--${variant}`, `badge--${size}`, className]}
    data-astro-prefetch="hover"
    {...rest}
  >
    {#if children}{@render children()}{:else}{label}{/if}
  </a>
{:else}
  <span class={['badge', `badge--${variant}`, `badge--${size}`, className]} {...rest}>
    {#if children}{@render children()}{:else}{label}{/if}
  </span>
{/if}
