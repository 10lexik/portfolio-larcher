import type { Preview } from '@storybook/svelte-vite';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '../src/core/styles/global.css';
import './storybook-docs.css';
import type { Locale } from '../src/core/content/types';
import { initReveal } from '../src/core/motion/reveal';
import { initPrintGrain } from '../src/core/utils/grain';
import { portfolioTheme } from './theme';

/**
 * Surfaces thématiques alignées sur `src/core/styles/tokens.css` et `lint:themes`.
 * Accepte indifféremment la clé (`dark`, `raised`, `surface`) ou la valeur hexadécimale.
 */
const SURFACES: Record<string, { color: string; theme: 'dark' | 'raised' }> = {
  dark: { color: '#090912', theme: 'dark' },
  '#090912': { color: '#090912', theme: 'dark' },
  surface: { color: '#12121c', theme: 'dark' },
  '#12121c': { color: '#12121c', theme: 'dark' },
  raised: { color: '#181826', theme: 'raised' },
  '#181826': { color: '#181826', theme: 'raised' },
};

type LocalizedArgsMap = Partial<Record<Locale, Record<string, unknown>>>;

const preview: Preview = {
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Active content dictionary (src/core/i18n/{fr,en}.json)',
      toolbar: {
        icon: 'globe',
        dynamicTitle: true,
        items: [
          { value: 'fr', right: 'FR', title: 'Français (fr.json)' },
          { value: 'en', right: 'EN', title: 'English (en.json)' },
        ],
      },
    },
  },
  initialGlobals: {
    locale: 'fr',
    backgrounds: { value: 'dark' },
  },
  decorators: [
    (story, context) => {
      const activeLocale: Locale = context.globals?.locale === 'en' ? 'en' : 'fr';

      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('js');
        document.documentElement.lang = activeLocale;

        const rawBg = String(
          context.globals?.backgrounds?.value ?? context.parameters?.backgrounds?.default ?? 'dark',
        ).toLowerCase();
        const surface = SURFACES[rawBg] ?? SURFACES.dark;
        document.body.dataset.theme = surface.theme;
        document.body.style.backgroundColor = surface.color;

        initPrintGrain();
        requestAnimationFrame(() => initReveal());
      }

      const nextArgs: Record<string, unknown> = { ...context.args };
      let hasOverrides = false;

      if ('locale' in (context.argTypes ?? {}) && context.initialArgs?.locale === undefined) {
        if (context.args.locale === undefined) {
          nextArgs.locale = activeLocale;
          hasOverrides = true;
        }
      }

      const localizedArgs = context.parameters?.localizedArgs as LocalizedArgsMap | undefined;
      const localeBundle = localizedArgs?.[activeLocale];
      if (localeBundle) {
        for (const [key, localizedVal] of Object.entries(localeBundle)) {
          if (context.args[key] === context.initialArgs?.[key]) {
            nextArgs[key] = localizedVal;
            hasOverrides = true;
          }
        }
      }

      return hasOverrides ? story({ args: nextArgs }) : story();
    },
  ],
  parameters: {
    options: {
      storySort: {
        order: [
          'Foundations',
          ['Overview', 'Design Tokens'],
          'UI',
          'Blocks',
          'Domains',
          ['Navigation', 'Work', 'About'],
        ],
      },
    },
    docs: {
      theme: portfolioTheme,
      toc: {
        headingSelector: 'h2, h3',
        title: 'On this page',
      },
    },
    controls: {
      expanded: true,
      sort: 'requiredFirst',
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
      },
    },
    viewport: {
      options: {
        mobile: {
          name: 'Mobile (375×700)',
          styles: { width: '375px', height: '700px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (768×1024 — md breakpoint)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        laptop: {
          name: 'Laptop (1280×800)',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
        desktop: {
          name: 'Desktop (1440×900)',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },
    backgrounds: {
      default: 'dark',
      options: {
        dark: { name: 'Dark (#090912 · data-theme="dark")', value: '#090912' },
        raised: { name: 'Raised (#181826 · data-theme="raised")', value: '#181826' },
        surface: { name: 'Surface (#12121c · card base)', value: '#12121c' },
      },
    },
    layout: 'padded',
  },
};

export default preview;
