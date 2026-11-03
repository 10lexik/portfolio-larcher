<script lang="ts">
  import './FigmaChain.css';
  import { t } from '@core/i18n/t';
  import type { Accent, Locale } from '@core/content/types';
  import { getVeepeeContent } from '../veepee';

  interface ChainStep {
    label: string;
    accent: Exclude<Accent, 'none'>;
    items: string[];
  }

  /**
   * Chaîne séquentielle de gouvernance Design-to-Code (Figma → Tokens → Composants → Documentation).
   * Rend une liste ordonnée `<ol>` accessible avec connecteurs directionnels sur grand écran.
   */
  interface Props {
    /** Langue d'affichage */
    locale?: Locale;
    /** Étapes personnalisées optionnelles */
    steps?: ChainStep[];
    class?: string;
  }

  let { locale = 'fr', steps, class: className = '' }: Props = $props();

  const chain = $derived(steps ?? getVeepeeContent(locale).figmaChain);
</script>

<!--
  @component
  Chaîne séquentielle de gouvernance Design-to-Code (Figma → Tokens → Composants → Documentation).
  Rend une liste ordonnée `<ol>` accessible avec connecteurs directionnels sur grand écran (`>= 900px`).
-->
<ol class={['chain', className]} aria-label={t('figmaChainAria', locale)}>
  {#each chain as step, i (step.label)}
    <li class={['chain__step', `chain__step--${step.accent}`]} data-reveal style:--reveal-index={i}>
      <p class="chain__label">{step.label}</p>
      <ul class="chain__items">
        {#each step.items as item (item)}
          <li>{item}</li>
        {/each}
      </ul>
    </li>
  {/each}
</ol>
