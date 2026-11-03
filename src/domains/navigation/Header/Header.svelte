<script lang="ts">
  import './Header.css';
  import type { Locale } from '@core/content/types';
  import { getNav, getSite } from '@core/content/site';
  import { getAlternatePath, t } from '@core/i18n/t';

  /**
   * En-tête global persistant du site (domaine transversal `navigation`).
   * Porte `data-theme="dark"` (vérifié par `lint:themes`), gère l'état actif `aria-current="page"`,
   * le sélecteur bilingue `FR / EN` (`hreflang`) et le rechargement hors routeur sur `/storybook`.
   */
  interface Props {
    /** Langue courante de la page */
    locale?: Locale;
    /** Chemin URL courant (résout l'entrée active et les liens alternatifs FR/EN) */
    pathname?: string;
    class?: string;
  }

  let { locale = 'fr', pathname = '/', class: className = '' }: Props = $props();

  const site = $derived(getSite(locale));
  const nav = $derived(getNav(locale));
  const current = $derived(pathname.replace(/\/$/, '') || '/');
  const frHref = $derived(getAlternatePath(pathname, 'fr'));
  const enHref = $derived(getAlternatePath(pathname, 'en'));
</script>

<!--
  @component
  En-tête global persistant du site (domaine transversal `navigation`).
  Porte `data-theme="dark"` (vérifié par `lint:themes`), gère l'état actif `aria-current="page"`,
  le sélecteur bilingue `FR / EN` (`hreflang`) et le rechargement hors routeur sur `/storybook`.
-->
<header class={['site-header', className]} data-theme="dark">
  <div class="site-header__bar">
    <a
      class="site-header__brand"
      href={site.homeHref}
      aria-label={`${site.name} — ${t('homeAriaLabel', locale)}`}
    >
      <span class="site-header__mark" aria-hidden="true">{site.monogram}</span>
      <span class="site-header__name">{site.name}</span>
    </a>

    <nav class="site-header__nav" aria-label={t('navLabel', locale)}>
      <ul class="site-header__list">
        {#each nav as item (item.href)}
          <li>
            <a
              class="site-header__link"
              href={item.href}
              data-astro-reload={item.reload ? '' : undefined}
              aria-current={current === item.href ? 'page' : undefined}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="site-header__actions">
      <div class="site-header__lang" role="group" aria-label={t('langSwitchLabel', locale)}>
        <a
          class="site-header__lang-link"
          href={frHref}
          hreflang="fr"
          aria-current={locale === 'fr' ? 'true' : undefined}
        >
          {t('langFr', locale)}
        </a>
        <a
          class="site-header__lang-link"
          href={enHref}
          hreflang="en"
          aria-current={locale === 'en' ? 'true' : undefined}
        >
          {t('langEn', locale)}
        </a>
      </div>

      <a
        class="site-header__cta"
        href={site.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        data-vector-btn
      >
        <span data-vector-btn-label>{t('headerCta', locale)}</span>
      </a>
    </div>
  </div>
</header>
