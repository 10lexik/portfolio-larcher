<script lang="ts">
  import './Footer.css';
  import type { Locale } from '@core/content/types';
  import { getNav, getSite } from '@core/content/site';
  import { t } from '@core/i18n/t';

  /**
   * Pied de page global en trois colonnes (identité, exploration, colophon).
   * S'intègre au moteur GSAP `Stacking` via `data-stack-reveal` et `data-stack-content`.
   */
  interface Props {
    /** Langue courante */
    locale?: Locale;
    /** Année affichée dans le copyright (par défaut année courante) */
    year?: number;
    class?: string;
  }

  let { locale = 'fr', year = new Date().getFullYear(), class: className = '' }: Props = $props();

  const site = $derived(getSite(locale));
  const nav = $derived(getNav(locale));
</script>

<!--
  @component
  Pied de page global en trois colonnes (identité, exploration, colophon).
  Porte `data-theme="dark"` et s'intègre au moteur GSAP `Stacking` via `data-stack-reveal` et `data-stack-content`.
-->
<footer class={['site-footer', className]} data-theme="dark" data-stack-reveal>
  <div class="site-footer__inner" data-stack-content>
    <div class="site-footer__col">
      <p class="site-footer__title">{site.name}</p>
      <p class="site-footer__text">{site.role}</p>
      <a class="site-footer__cta" href={site.linkedin} target="_blank" rel="noopener noreferrer">
        {t('contactLinkedIn', locale)}
      </a>
    </div>
    <nav class="site-footer__col" aria-label={t('footerNavLabel', locale)}>
      <p class="site-footer__title">{t('footerExplore', locale)}</p>
      <ul class="site-footer__list">
        {#each nav as item (item.href)}
          <li>
            <a href={item.href} data-astro-reload={item.reload ? '' : undefined}>
              {item.label}
            </a>
          </li>
        {/each}
        <li>
          <a href={site.codepen} target="_blank" rel="noopener noreferrer">
            {t('creativeLab', locale)}
          </a>
        </li>
      </ul>
    </nav>
    <div class="site-footer__col">
      <p class="site-footer__title">{t('footerColophon', locale)}</p>
      <p class="site-footer__text">{t('footerBuilt', locale)}</p>
      <p class="site-footer__text">© {year} {site.name}</p>
    </div>
  </div>
</footer>
