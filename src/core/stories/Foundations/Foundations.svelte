<script lang="ts">
  import './Foundations.css';

  interface Props {
    mode?: 'colors' | 'typography' | 'spacing';
  }

  let { mode = 'colors' }: Props = $props();

  const brand = [
    ['primary', '--color-brand-primary'],
    ['primary-light', '--color-brand-primary-light'],
    ['violet', '--color-brand-violet'],
    ['mint', '--color-brand-mint'],
    ['blue', '--color-brand-blue'],
    ['amber', '--color-brand-amber'],
    ['dark', '--color-brand-dark'],
    ['surface', '--color-brand-surface'],
    ['light', '--color-brand-light'],
  ] as const;

  const text = [
    ['text-body', '--color-text-body'],
    ['text-muted', '--color-text-muted'],
    ['text-subtle', '--color-text-subtle'],
    ['text-faint', '--color-text-faint'],
  ] as const;

  const scale = [
    ['hero', '--text-fluid-hero'],
    ['title', '--text-fluid-title'],
    ['h1', '--text-fluid-h1'],
    ['h2', '--text-fluid-h2'],
    ['h3', '--text-fluid-h3'],
    ['h4', '--text-fluid-h4'],
    ['lead', '--text-fluid-lead'],
    ['p', '--text-fluid-p'],
    ['label', '--text-fluid-label'],
  ] as const;

  const spacing = [
    ['spacing-fluid-x', '--spacing-fluid-x'],
    ['spacing-fluid-y', '--spacing-fluid-y'],
    ['grid-gap', '--grid-gap'],
    ['grid-gutter', '--grid-gutter'],
  ] as const;

  const radii = [
    ['radius-tile', '--radius-tile'],
    ['radius-media', '--radius-media'],
    ['radius-chip', '--radius-chip'],
  ] as const;
</script>

<div class="foundations">
  {#if mode === 'colors'}
    <h2 class="foundations__title">Couleurs de marque</h2>
    <ul class="foundations__swatches">
      {#each brand as [name, token] (token)}
        <li>
          <span class="foundations__chip" style:background-color={`var(${token})`}></span>
          <code>{name}</code>
          <small>{token}</small>
        </li>
      {/each}
    </ul>
    <h2 class="foundations__title">Texte</h2>
    <ul class="foundations__list">
      {#each text as [name, token] (token)}
        <li style:color={`var(${token})`}>{name} — <code>{token}</code></li>
      {/each}
    </ul>
  {:else if mode === 'typography'}
    <h2 class="foundations__title">Échelle typographique fluide</h2>
    <ul class="foundations__list">
      {#each scale as [name, token] (token)}
        <li>
          <code>{name}</code>
          <span style:font-size={`var(${token})`} style:line-height="1.1">Design System</span>
        </li>
      {/each}
    </ul>
  {:else}
    <h2 class="foundations__title">Espacements et rayons</h2>
    <ul class="foundations__list">
      {#each spacing as [name, token] (token)}
        <li>
          <code>{name}</code>
          <span class="foundations__bar" style:width={`var(${token})`}></span>
        </li>
      {/each}
      {#each radii as [name, token] (token)}
        <li>
          <code>{name}</code>
          <span class="foundations__radius" style:border-radius={`var(${token})`}></span>
        </li>
      {/each}
    </ul>
  {/if}
</div>
