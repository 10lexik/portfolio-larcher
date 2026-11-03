<script lang="ts">
  import './Foundations.css';
  import { onMount } from 'svelte';
  import type { Locale } from '@core/content/types';

  interface Props {
    /** Catégorie de tokens inspectée */
    mode?: 'colors' | 'typography' | 'spacing' | 'motion';
    /** Langue de l'inspecteur (`fr` | `en`) */
    locale?: Locale;
  }

  let { mode = 'colors', locale = 'fr' }: Props = $props();

  const COPY = {
    fr: {
      source: 'Source unique : src/core/styles/tokens.css',
      viewport: ' Fenêtre :',
      colorsTitle: 'Palette de marque, texte sémantique et contrastes WCAG 2.1',
      colorsNote:
        'Les valeurs hexadécimales/alpha et les ratios de contraste sont calculés en direct via getComputedStyle() sur les deux surfaces du système : dark (#090912) et raised (#181826).',
      brandGroup: 'Couleurs de marque et d’accent',
      textGroup: 'Hiérarchie typographique et surfaces',
      onDark: 'sur dark',
      onRaised: 'sur raised',
      decorative: '— Surface / Décor',
      typoTitle: 'Échelle typographique fluide (clamp)',
      typoNote:
        'Redimensionnez le viewport Storybook (375 px → 768 px → 1280 px → 1440 px) pour observer la taille et l’interligne recalculés en pixels.',
      colToken: 'Token CSS',
      colFormula: 'Formule @theme',
      colComputed: 'Rendu (px)',
      colSpecimen: 'Spécimen',
      sampleText: 'Architecture & Design System',
      spacingTitle: 'Espacements fluides, conteneurs, rayons et élévation',
      spacingSub: 'Gouttières fluides et largeurs de conteneurs',
      radiiSub: 'Rayons, bordures verre et ombres d’élévation',
      motionTitle: 'Courbes d’animation, durées et texture grain papier',
      motionNote:
        'Miroir CSS strict de motionTokens.ts et paramètres procéduraux lus par src/core/utils/grain.ts (Domain-Warped fBm 2D).',
      replayBtn: 'Tester les courbes en direct ⇄',
      durationsSub: 'Échelle de durées (--duration-*)',
      easingsSub: 'Courbes d’accélération (--ease-*)',
      grainSub: 'Paramètres procéduraux du grain d’impression (--grain-*)',
      colValue: 'Valeur active',
    },
    en: {
      source: 'Single source: src/core/styles/tokens.css',
      viewport: 'Viewport:',
      colorsTitle: 'Brand Palette, Semantic Text & Live WCAG 2.1 Contrast',
      colorsNote:
        'Hex/alpha values and WCAG 2.1 contrast ratios are computed live via getComputedStyle() against both system surfaces: dark (#090912) and raised (#181826).',
      brandGroup: 'Brand & Accent Tokens',
      textGroup: 'Semantic Text & Surface Tokens',
      onDark: 'on dark',
      onRaised: 'on raised',
      decorative: '— Surface / Decor',
      typoTitle: 'Fluid Typographic Scale (clamp)',
      typoNote:
        'Switch the Storybook viewport (375px → 768px → 1280px → 1440px) to inspect real-time computed pixel font-size and line-height.',
      colToken: 'CSS Token',
      colFormula: '@theme Formula',
      colComputed: 'Computed (px)',
      colSpecimen: 'Live Specimen',
      sampleText: 'Architecture & Design System',
      spacingTitle: 'Fluid Spacing, Containers, Radii & Elevation',
      spacingSub: 'Fluid Gutters & Container Max-Widths',
      radiiSub: 'Border Radii, Glass Borders & Shadows',
      motionTitle: 'Motion Curves, Durations & Procedural Paper Grain',
      motionNote:
        'Strict CSS mirror of motionTokens.ts alongside the 2D Domain-Warped fBm parameters read by src/core/utils/grain.ts.',
      replayBtn: 'Replay Motion Curves ⇄',
      durationsSub: 'Duration Scale (--duration-*)',
      easingsSub: 'Easing Curves (--ease-*)',
      grainSub: 'Procedural Print Grain Tokens (--grain-*)',
      colValue: 'Computed Value',
    },
  } as const;

  const ui = $derived(COPY[locale]);

  const BRAND_COLORS = [
    ['Brand Primary', '--color-brand-primary', true],
    ['Primary Light', '--color-brand-primary-light', true],
    ['Brand Violet', '--color-brand-violet', true],
    ['Brand Mint', '--color-brand-mint', true],
    ['Brand Blue', '--color-brand-blue', true],
    ['Brand Amber', '--color-brand-amber', true],
  ] as const;

  const SEMANTIC_COLORS: ReadonlyArray<readonly [string, string, boolean]> = [
    ['White', '--color-white', true],
    ['Text Body', '--color-text-body', true],
    ['Text Muted', '--color-text-muted', true],
    ['Text Subtle', '--color-text-subtle', true],
    ['Danger Text', '--color-danger-text', true],
    ['Brand Dark', '--color-brand-dark', false],
    ['Brand Surface', '--color-brand-surface', false],
    ['Surface Raised', '--color-surface-raised', false],
    ['Code Background', '--color-code-bg', false],
  ];

  const colorGroups = $derived([
    { title: ui.brandGroup, entries: BRAND_COLORS },
    { title: ui.textGroup, entries: SEMANTIC_COLORS },
  ]);

  const TYPE_ROLES = [
    ['--text-fluid-hero', 'Hero Display'],
    ['--text-fluid-title', 'Page Title'],
    ['--text-fluid-h1', 'Heading 1'],
    ['--text-fluid-h2', 'Heading 2'],
    ['--text-fluid-h3', 'Heading 3'],
    ['--text-fluid-h4', 'Heading 4'],
    ['--text-fluid-quote', 'Editorial Quote'],
    ['--text-fluid-lead', 'Lead Paragraph'],
    ['--text-fluid-p', 'Body Copy'],
    ['--text-fluid-sm', 'Small UI'],
    ['--text-fluid-xs', 'Caption / Chip'],
    ['--text-fluid-label', 'Uppercase Eyebrow'],
  ] as const;

  const SPACING_TOKENS = [
    '--spacing-fluid-x',
    '--spacing-fluid-y',
    '--grid-gap',
    '--grid-gutter',
    '--header-height',
    '--container-narrow',
    '--container-medium',
    '--container-default',
    '--container-wide',
  ] as const;

  const RADIUS_TOKENS = ['--radius-tile', '--radius-media', '--radius-chip'] as const;
  const BORDER_TOKENS = ['--border-edge-thin', '--border-edge-md', '--border-edge-lg'] as const;
  const SHADOW_TOKENS = [
    '--shadow-edge-sm',
    '--shadow-edge-md',
    '--shadow-edge-lg',
    '--shadow-glow-primary',
  ] as const;

  const DURATION_TOKENS = [
    '--duration-instant',
    '--duration-fast',
    '--duration-base',
    '--duration-normal',
    '--duration-moderate',
    '--duration-glide',
    '--duration-epic',
  ] as const;

  const EASE_TOKENS = [
    '--ease-standard',
    '--ease-out',
    '--ease-out-glide',
    '--ease-in-out',
    '--ease-smooth',
    '--ease-expo',
    '--ease-bounce',
  ] as const;

  const GRAIN_TOKENS = [
    '--grain-tile-size',
    '--grain-scale',
    '--grain-paper-opacity',
    '--grain-ink-opacity',
    '--grain-gradient-contrast',
    '--grain-density-min',
    '--grain-density-max',
  ] as const;

  interface ColorMetrics {
    hex: string;
    darkRatio: number;
    raisedRatio: number;
  }

  interface TypeMetrics {
    formula: string;
    computed: string;
  }

  type Rgba = [number, number, number, number];

  let viewportWidth = $state(0);
  let motionShifted = $state(false);
  let colorMetrics = $state<Record<string, ColorMetrics>>({});
  let typeMetrics = $state<Record<string, TypeMetrics>>({});
  let rawValues = $state<Record<string, string>>({});
  let computedPx = $state<Record<string, string>>({});
  let rootEl: HTMLDivElement | undefined = $state();

  function parseCssColor(cssValue: string): Rgba {
    const nums = cssValue.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
    if (cssValue.startsWith('color(')) {
      return [
        Math.round((nums[0] ?? 0) * 255),
        Math.round((nums[1] ?? 0) * 255),
        Math.round((nums[2] ?? 0) * 255),
        nums[3] ?? 1,
      ];
    }
    return [nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0, nums[3] ?? 1];
  }

  function blendOn(fg: Rgba, bg: Rgba): [number, number, number] {
    const a = fg[3];
    return [
      Math.round(fg[0] * a + bg[0] * (1 - a)),
      Math.round(fg[1] * a + bg[1] * (1 - a)),
      Math.round(fg[2] * a + bg[2] * (1 - a)),
    ];
  }

  function luminance([r, g, b]: [number, number, number]): number {
    const channel = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }

  function contrastRatio(fg: Rgba, bg: Rgba): number {
    const l1 = luminance(blendOn(fg, bg));
    const l2 = luminance([bg[0], bg[1], bg[2]]);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
  }

  function toHexLabel([r, g, b, a]: Rgba): string {
    const hex = [r, g, b]
      .map((n) =>
        Math.max(0, Math.min(255, Math.round(n)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
    return a < 0.999 ? `#${hex} (${Math.round(a * 100)}%)` : `#${hex}`;
  }

  function wcagBadge(ratio: number): { label: string; tier: 'pass' | 'large' | 'low' } {
    if (ratio >= 7) return { label: `✓ AAA ${ratio}:1`, tier: 'pass' };
    if (ratio >= 4.5) return { label: `✓ AA ${ratio}:1`, tier: 'pass' };
    if (ratio >= 3) return { label: `◐ AA 18pt+ ${ratio}:1`, tier: 'large' };
    return { label: `${ratio}:1`, tier: 'low' };
  }

  function inspectTokens() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    viewportWidth = Math.round(window.innerWidth);
    const rootStyle = getComputedStyle(document.documentElement);

    const probe = document.createElement('span');
    probe.style.position = 'fixed';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    document.body.appendChild(probe);

    const resolveRgba = (token: string): Rgba => {
      probe.style.color = `var(${token})`;
      return parseCssColor(getComputedStyle(probe).color);
    };

    const darkBg = resolveRgba('--color-brand-dark');
    const raisedBg = resolveRgba('--color-surface-raised');

    const nextColors: Record<string, ColorMetrics> = {};
    for (const [, token] of [...BRAND_COLORS, ...SEMANTIC_COLORS]) {
      const rgba = resolveRgba(token);
      nextColors[token] = {
        hex: toHexLabel(rgba),
        darkRatio: contrastRatio(rgba, darkBg),
        raisedRatio: contrastRatio(rgba, raisedBg),
      };
    }

    const nextRaw: Record<string, string> = {};
    const nextPx: Record<string, string> = {};
    const allVarTokens = [
      ...SPACING_TOKENS,
      ...RADIUS_TOKENS,
      ...BORDER_TOKENS,
      ...SHADOW_TOKENS,
      ...DURATION_TOKENS,
      ...EASE_TOKENS,
      ...GRAIN_TOKENS,
    ];
    for (const token of allVarTokens) {
      nextRaw[token] = rootStyle.getPropertyValue(token).trim();
    }
    for (const token of SPACING_TOKENS) {
      probe.style.width = `var(${token})`;
      nextPx[token] = `${Math.round(Number.parseFloat(getComputedStyle(probe).width) || 0)}px`;
    }

    document.body.removeChild(probe);

    const nextType: Record<string, TypeMetrics> = {};
    for (const [token] of TYPE_ROLES) {
      const formula = rootStyle.getPropertyValue(token).trim();
      const sampleEl = rootEl?.querySelector<HTMLElement>(`[data-type-sample="${token}"]`);
      if (sampleEl) {
        const cs = getComputedStyle(sampleEl);
        const fs = Number.parseFloat(cs.fontSize).toFixed(1);
        const lh = Number.parseFloat(cs.lineHeight).toFixed(1);
        nextType[token] = { formula, computed: `${fs}px / ${lh}px` };
      } else {
        nextType[token] = { formula, computed: '—' };
      }
    }

    colorMetrics = nextColors;
    rawValues = nextRaw;
    computedPx = nextPx;
    typeMetrics = nextType;
  }

  onMount(() => {
    inspectTokens();
    const onResize = () => inspectTokens();
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  });

  $effect(() => {
    void mode;
    requestAnimationFrame(() => inspectTokens());
  });
</script>

<!--
  @component
  Inspecteur interactif en temps réel de `src/core/styles/tokens.css`.
  Lit les propriétés personnalisées CSS compilées via `getComputedStyle()`, calcule les ratios WCAG 2.1 AA/AAA
  sur `dark` et `raised`, affiche les tailles fluides `px` au redimensionnement et anime les courbes de mouvement.
-->
<div bind:this={rootEl} class="foundations">
  <header class="foundations__intro">
    <h2 class="foundations__heading">
      {#if mode === 'colors'}
        {ui.colorsTitle}
      {:else if mode === 'typography'}
        {ui.typoTitle}
      {:else if mode === 'spacing'}
        {ui.spacingTitle}
      {:else}
        {ui.motionTitle}
      {/if}
    </h2>
    <span class="foundations__meta">
      {ui.source} · {ui.viewport}
      {viewportWidth}px
    </span>
  </header>

  {#if mode === 'colors'}
    <p class="foundations__note">{ui.colorsNote}</p>

    {#each colorGroups as group (group.title)}
      <section class="foundations__section">
        <h3 class="foundations__subtitle">{group.title}</h3>
        <ul class="foundations__swatches">
          {#each group.entries as [name, token, checkContrast] (token)}
            {@const metrics = colorMetrics[token]}
            <li class="foundations__card">
              <span class="foundations__chip" style:background-color={`var(${token})`}></span>
              <div class="foundations__card-head">
                <span class="foundations__name">{name}</span>
                <span class="foundations__hex">{metrics?.hex ?? '…'}</span>
              </div>
              <code class="foundations__token">{token}</code>
              <div class="foundations__contrasts">
                {#if checkContrast && metrics}
                  {@const darkBadge = wcagBadge(metrics.darkRatio)}
                  {@const raisedBadge = wcagBadge(metrics.raisedRatio)}
                  <div class="foundations__contrast-row">
                    <span>{ui.onDark}</span>
                    <span class={['foundations__pill', `foundations__pill--${darkBadge.tier}`]}>
                      {darkBadge.label}
                    </span>
                  </div>
                  <div class="foundations__contrast-row">
                    <span>{ui.onRaised}</span>
                    <span class={['foundations__pill', `foundations__pill--${raisedBadge.tier}`]}>
                      {raisedBadge.label}
                    </span>
                  </div>
                {:else}
                  <div class="foundations__contrast-row">
                    <span>WCAG</span>
                    <span>{ui.decorative}</span>
                  </div>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {:else if mode === 'typography'}
    <p class="foundations__note">{ui.typoNote}</p>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="foundations__table-wrap" role="region" tabindex="0" aria-label={ui.typoTitle}>
      <table class="foundations__table">
        <thead>
          <tr>
            <th scope="col">{ui.colToken}</th>
            <th scope="col">{ui.colFormula}</th>
            <th scope="col">{ui.colComputed}</th>
            <th scope="col">{ui.colSpecimen}</th>
          </tr>
        </thead>
        <tbody>
          {#each TYPE_ROLES as [token, roleLabel] (token)}
            {@const metric = typeMetrics[token]}
            <tr>
              <th scope="row">
                <div>{token}</div>
                <div class="foundations__formula">{roleLabel}</div>
              </th>
              <td class="foundations__formula">{metric?.formula ?? '…'}</td>
              <td class="foundations__computed">{metric?.computed ?? '…'}</td>
              <td>
                <span
                  class="foundations__specimen"
                  data-type-sample={token}
                  style:font-size={`var(${token})`}
                  style:line-height="1.15"
                >
                  {ui.sampleText}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else if mode === 'spacing'}
    <section class="foundations__section">
      <h3 class="foundations__subtitle">{ui.spacingSub}</h3>
      <ul class="foundations__bars">
        {#each SPACING_TOKENS as token (token)}
          <li class="foundations__bar-row">
            <code class="foundations__token">{token}</code>
            <span class="foundations__computed">{computedPx[token] ?? '…'}</span>
            <div>
              <div class="foundations__bar-track">
                <span class="foundations__bar-fill" style:width={`var(${token})`}></span>
              </div>
              <span class="foundations__formula">{rawValues[token] ?? ''}</span>
            </div>
          </li>
        {/each}
      </ul>
    </section>

    <section class="foundations__section">
      <h3 class="foundations__subtitle">{ui.radiiSub}</h3>
      <ul class="foundations__surfaces">
        {#each RADIUS_TOKENS as token (token)}
          <li class="foundations__surface-box" style:border-radius={`var(${token})`}>
            <code class="foundations__token">{token}</code>
            <span class="foundations__computed">{rawValues[token] ?? '…'}</span>
          </li>
        {/each}
        {#each BORDER_TOKENS as token (token)}
          <li class="foundations__surface-box" style:border={`var(${token})`}>
            <code class="foundations__token">{token}</code>
            <span class="foundations__formula">{rawValues[token] ?? '…'}</span>
          </li>
        {/each}
        {#each SHADOW_TOKENS as token (token)}
          <li class="foundations__surface-box" style:box-shadow={`var(${token})`}>
            <code class="foundations__token">{token}</code>
            <span class="foundations__formula">{rawValues[token] ?? '…'}</span>
          </li>
        {/each}
      </ul>
    </section>
  {:else}
    <p class="foundations__note">{ui.motionNote}</p>
    <div class="foundations__motion-toolbar">
      <button
        type="button"
        class="foundations__replay"
        onclick={() => {
          motionShifted = !motionShifted;
        }}
      >
        {ui.replayBtn}
      </button>
    </div>

    <section class="foundations__section">
      <h3 class="foundations__subtitle">{ui.easingsSub}</h3>
      <ul class="foundations__motion-list">
        {#each EASE_TOKENS as token (token)}
          <li class="foundations__motion-item">
            <code class="foundations__token">{token}</code>
            <span class="foundations__formula">{rawValues[token] ?? '…'}</span>
            <div class="foundations__motion-track-wrap">
              <div class="foundations__motion-track">
                <span
                  class={['foundations__motion-dot', motionShifted && 'is-shifted']}
                  style:transition-duration="var(--duration-glide)"
                  style:transition-timing-function={`var(${token})`}
                ></span>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </section>

    <section class="foundations__section">
      <h3 class="foundations__subtitle">{ui.durationsSub}</h3>
      <ul class="foundations__motion-list">
        {#each DURATION_TOKENS as token (token)}
          <li class="foundations__motion-item">
            <code class="foundations__token">{token}</code>
            <span class="foundations__computed">{rawValues[token] ?? '…'}</span>
            <div class="foundations__motion-track-wrap">
              <div class="foundations__motion-track">
                <span
                  class={['foundations__motion-dot', motionShifted && 'is-shifted']}
                  style:transition-duration={`var(${token})`}
                  style:transition-timing-function="var(--ease-out-glide)"
                ></span>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </section>

    <section class="foundations__section">
      <h3 class="foundations__subtitle">{ui.grainSub}</h3>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="foundations__table-wrap" role="region" tabindex="0" aria-label={ui.grainSub}>
        <table class="foundations__table">
          <thead>
            <tr>
              <th scope="col">{ui.colToken}</th>
              <th scope="col">{ui.colValue}</th>
            </tr>
          </thead>
          <tbody>
            {#each GRAIN_TOKENS as token (token)}
              <tr>
                <th scope="row">{token}</th>
                <td class="foundations__computed">{rawValues[token] ?? '…'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {/if}
</div>
