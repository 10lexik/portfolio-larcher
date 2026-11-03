<script lang="ts">
  import './VariantMatrix.css';
  import { t } from '@core/i18n/t';
  import type { Locale } from '@core/content/types';
  import { getVeepeeContent } from '../veepee';

  interface VariantItem {
    id: string;
    folder: string;
    desc: string;
    example: string;
  }

  /**
   * Matrice des variantes d'architecture d'un composant modulaire (domaine `work` · Case Study Veepee).
   * Documente la correspondance 1:1 entre prop littérale (`variant="..."`), sous-dossier isolé et campagnes livrées.
   */
  interface Props {
    /** Langue d'affichage (alimente le dictionnaire par défaut et le préfixe « Déployé sur : ») */
    locale?: Locale;
    /** Surcharge optionnelle de la liste des variants (utile en test Storybook) */
    items?: VariantItem[];
    class?: string;
  }

  let { locale = 'fr', items, class: className = '' }: Props = $props();

  const variants = $derived(items ?? getVeepeeContent(locale).variantItems);
</script>

<!--
  @component
  Matrice des variantes d'architecture d'un composant modulaire (domaine `work` · Case Study Veepee).
  Documente la correspondance 1:1 entre prop littérale (`variant="..."`), sous-dossier isolé et campagnes livrées.
-->
<ul class={['variants', className]}>
  {#each variants as item, i (item.id)}
    <li class="variants__item" data-reveal style:--reveal-index={i}>
      <div class="variants__head">
        <code class="variants__tag">variant="{item.id}"</code>
        <span class="variants__folder">{item.folder}</span>
      </div>
      <p class="variants__desc">{item.desc}</p>
      <p class="variants__example">
        <span>{t('variantInProd', locale)}</span>
        {item.example}
      </p>
    </li>
  {/each}
</ul>
