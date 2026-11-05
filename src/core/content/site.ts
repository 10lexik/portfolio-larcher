import assets from './assets.json';
import type { Locale } from './types';
import { getDictionary } from '@core/i18n/t';

type BrandAssetKey = keyof typeof assets.media.brands;

interface HeroBrandMedia {
  id: string;
  name: string;
  videoDesk: string;
  videoMob: string;
  posterDesk: string;
  posterMob: string;
}

interface SiteMeta {
  url: string;
  name: string;
  monogram: string;
  themeColor: string;
  role: string;
  title: string;
  description: string;
  ogLocale: string;
  linkedin: string;
  codepen: string;
  favicon: string;
  ogImage: string;
  storybookHref: string;
  homeHref: string;
}

interface NavItem {
  label: string;
  href: string;
  reload?: boolean;
}

interface HomeContent {
  hero: {
    eyebrow: string;
    titlePrefix: string;
    titleEm: string;
    lead: string;
    caseStudyHref: string;
    storybookHref: string;
    desktopVideoLabelPrefix: string;
    mobileVideoLabelPrefix: string;
    ratios: {
      desktop: string;
      mobile: string;
    };
    brands: HeroBrandMedia[];
  };
  operations: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  designSystem: {
    eyebrow: string;
    title: string;
    cardEyebrow: string;
    cardTitle: string;
    cardText: string;
    cardHref: string;
    cardCta: string;
    cardChips: string[];
  };
  skillsSection: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  contact: {
    title: string;
    text: string;
    aboutHref: string;
    aboutLabel: string;
  };
}

interface NotFoundContent {
  title: string;
  eyebrow: string;
  heading: string;
  lead: string;
  ctaLabel: string;
  ctaHref: string;
}

export function getSite(locale: Locale = 'fr'): SiteMeta {
  const dict = getDictionary(locale);
  return {
    url: assets.identity.url,
    name: assets.identity.name,
    monogram: assets.identity.monogram,
    themeColor: assets.identity.themeColor,
    role: dict.site.role,
    title: dict.site.title,
    description: dict.site.description,
    ogLocale: dict.site.ogLocale,
    linkedin: assets.identity.linkedin,
    codepen: assets.identity.codepen,
    favicon: assets.media.favicon,
    ogImage: assets.media.ogImage,
    storybookHref: assets.routes.storybook,
    homeHref: assets.routes[locale].home,
  };
}

export function getNav(locale: Locale = 'fr'): NavItem[] {
  const dict = getDictionary(locale);
  const routes = assets.routes[locale];
  return [
    { label: dict.nav.veepee, href: routes.veepee },
    { label: dict.nav.designSystem, href: routes.designSystem },
    { label: dict.nav.storybook, href: assets.routes.storybook, reload: true },
    { label: dict.nav.about, href: routes.about },
  ];
}

export function getHomeContent(locale: Locale = 'fr'): HomeContent {
  const dict = getDictionary(locale).home;
  const routes = assets.routes[locale];
  const brands: HeroBrandMedia[] = assets.media.heroBrandIds.map((rawId) => {
    const id = rawId as BrandAssetKey;
    const b = assets.media.brands[id];
    return {
      id: rawId,
      name: b.name,
      videoDesk: b.videoDesk,
      videoMob: b.videoMob,
      posterDesk: b.posterDesk,
      posterMob: b.posterMob,
    };
  });

  return {
    hero: {
      ...dict.hero,
      caseStudyHref: routes.veepee,
      storybookHref: assets.routes.storybook,
      ratios: assets.media.ratios,
      brands,
    },
    operations: dict.operations,
    designSystem: {
      ...dict.designSystem,
      cardHref: routes.designSystem,
      cardChips: [...assets.home.designSystemChips],
    },
    skillsSection: dict.skillsSection,
    contact: {
      ...dict.contact,
      aboutHref: routes.about,
    },
  };
}

export function getNotFoundContent(locale: Locale = 'fr'): NotFoundContent {
  const dict = getDictionary(locale).notFound;
  return {
    ...dict,
    ctaHref: assets.routes[locale].home,
  };
}
