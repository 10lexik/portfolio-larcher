<script lang="ts">
  import './CaseCard.css';
  import { formatTitleTypography } from '@core/utils/text';
  import { safeURL } from '@core/utils/security';

  /**
   * Carte d'accroche d'étude de cas (domaine `work`).
   * Étend la zone cliquable du CTA à toute la tuile via un pseudo-élément `::after` tout en conservant
   * un unique lien focalisable au clavier.
   */
  interface Props {
    /** Surtitre de catégorie (ex. `Architecture Front-End · Storybook`) */
    eyebrow: string;
    /** Titre principal de l'étude de cas */
    title: string;
    /** Résumé éditorial */
    text: string;
    /** URL cible vers le Case Study */
    href: string;
    /** Libellé du bouton d'action */
    cta: string;
    /** Chemin public d'un visuel d'aperçu optionnel */
    image?: string;
    /** Texte alternatif du visuel */
    imageAlt?: string;
    /** Mise en page large en deux colonnes à partir de `900px` */
    featured?: boolean;
    /** Liste des technologies ou mots-clés affichés en pastilles */
    chips?: string[];
    class?: string;
  }

  let {
    eyebrow,
    title,
    text,
    href,
    cta,
    image,
    imageAlt = '',
    featured = false,
    chips = [],
    class: className = '',
  }: Props = $props();

  const formattedTitle = $derived(formatTitleTypography(title));
  const resolvedHref = $derived(safeURL(href) || '/');
</script>

<!--
  @component
  Carte d'accroche d'étude de cas (domaine `work`).
  Étend la zone cliquable du CTA à toute la tuile via un pseudo-élément `::after` tout en conservant
  un unique lien focalisable au clavier, et bascule en deux colonnes dès `900px` en mode `featured`.
-->
<article class={['case-card', featured && 'case-card--featured', className]} data-reveal>
  <div class="case-card__body">
    <p class="eyebrow">{eyebrow}</p>
    <h3 class="case-card__title">{formattedTitle}</h3>
    <p class="case-card__text">{text}</p>
    {#if chips.length > 0}
      <ul class="case-card__chips">
        {#each chips as chip (chip)}
          <li>{chip}</li>
        {/each}
      </ul>
    {/if}
    <a class="case-card__cta" href={resolvedHref}>
      {cta} <span aria-hidden="true">→</span>
    </a>
  </div>
  {#if image}
    <div class="case-card__media">
      <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
    </div>
  {/if}
</article>
