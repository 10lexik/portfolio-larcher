<script lang="ts">
  import './ProofTable.css';
  import { t } from '@core/i18n/t';
  import { safeURL } from '@core/utils/security';
  import type { Locale } from '@core/content/types';
  import type { Proof } from '../veepee';

  /**
   * Tableau sémantique responsive des opérations de marque vérifiables en ligne (domaine `work`).
   * Repose sur `<table>`, `<thead>`, `<th scope="col|row">` et bascule en cartes empilées par `@container`
   * sur conteneur étroit tout en préservant l'accessibilité clavier (`role="region"`, `tabindex="0"`).
   */
  interface Props {
    /** Liste des preuves de déploiement (marque, URL, affichage court, composants mobilisés) */
    proofs: Proof[];
    /** Langue des en-têtes de colonnes et de l'étiquette accessible */
    locale?: Locale;
    class?: string;
  }

  let { proofs, locale = 'fr', class: className = '' }: Props = $props();

  const colBrand = $derived(t('proofColBrand', locale));
  const colUrl = $derived(t('proofColUrl', locale));
  const captionText = $derived(t('proofTableCaption', locale));
</script>

<!--
  @component
  Tableau sémantique responsive des opérations de marque vérifiables en ligne (domaine `work`).
  Repose sur `<table>`, `<thead>`, `<th scope="col|row">` et bascule en cartes empilées par `@container`
  sous `36rem` tout en préservant l'accessibilité clavier (`role="region"`, `tabindex="0"`).
-->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class={['proofs', className]}
  role="region"
  tabindex="0"
  aria-label={captionText}
  style:--proof-col-url={`"${colUrl}"`}
>
  <table class="proofs__table">
    <caption class="sr-only">{captionText}</caption>
    <thead class="proofs__head">
      <tr>
        <th scope="col">{colBrand}</th>
        <th scope="col">{colUrl}</th>
      </tr>
    </thead>
    <tbody>
      {#each proofs as proof (proof.brand)}
        <tr class="proofs__row">
          <th scope="row" class="proofs__brand">{proof.brand}</th>
          <td class="proofs__cell">
            <a href={safeURL(proof.href)} target="_blank" rel="noopener noreferrer">
              {proof.display} <span aria-hidden="true">↗</span>
            </a>
            {#if proof.note}
              <small>{proof.note}</small>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
