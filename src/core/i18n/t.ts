import type { Locale } from '@core/content/types';
import assets from '@core/content/assets.json';
import frJson from './fr.json';
import enJson from './en.json';

type Dictionary = typeof frJson;
type UiLabelKey = keyof Dictionary['ui'];

const DICTIONARIES: Record<Locale, Dictionary> = {
  fr: frJson,
  en: enJson,
};

export function getDictionary(locale: Locale = 'fr'): Dictionary {
  return DICTIONARIES[locale];
}

export function t(key: UiLabelKey, locale: Locale = 'fr'): string {
  return DICTIONARIES[locale].ui[key];
}

const ROUTE_KEYS = ['home', 'veepee', 'designSystem', 'about'] as const;

export function getAlternatePath(pathname: string, targetLocale: Locale): string {
  const clean = pathname.replace(/\/$/, '') || '/';
  for (const key of ROUTE_KEYS) {
    if (assets.routes.fr[key] === clean || assets.routes.en[key] === clean) {
      return assets.routes[targetLocale][key];
    }
  }
  return assets.routes[targetLocale].home;
}
