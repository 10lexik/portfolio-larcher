<script lang="ts">
  import './CaseInsight.css';
  import type { Locale } from '@core/content/types';
  import { t } from '@core/i18n/t';

  export interface CaseInsightData {
    problem: string;
    decision: string;
    resolution: string;
    role?: string;
  }

  interface Props {
    insight: CaseInsightData;
    locale?: Locale;
    class?: string;
  }

  let { insight, locale = 'fr', class: className = '' }: Props = $props();
</script>

<!--
  @component
  Encadré narratif d'étude de cas structuré en trois temps : Constat terrain (`01`), Décision d'architecture (`02`)
  et Résultat en production (`03`), entièrement bilingue (`FR / EN`) via les clés UI globales.
-->
<aside class={['case-insight', className]} aria-label={t('insightTag', locale)} data-reveal>
  {#if insight.role}
    <div class="case-insight__bar">
      <span class="case-insight__tag">{t('insightTag', locale)}</span>
      <span class="case-insight__role">{insight.role}</span>
    </div>
  {/if}
  <ol class="case-insight__grid">
    <li class="case-insight__step case-insight__step--problem">
      <p class="case-insight__label">{t('insightStep1', locale)}</p>
      <p class="case-insight__text">{insight.problem}</p>
    </li>
    <li class="case-insight__step case-insight__step--decision">
      <p class="case-insight__label">{t('insightStep2', locale)}</p>
      <p class="case-insight__text">{insight.decision}</p>
    </li>
    <li class="case-insight__step case-insight__step--resolution">
      <p class="case-insight__label">{t('insightStep3', locale)}</p>
      <p class="case-insight__text">{insight.resolution}</p>
    </li>
  </ol>
</aside>
