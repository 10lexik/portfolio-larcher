import type { Preview } from '@storybook/svelte-vite';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '../src/core/styles/global.css';
import { initReveal } from '../src/core/motion/reveal';
import { initPrintGrain } from '../src/core/utils/grain';

/**
 * Fonds de story : couleur posée sur <body> (jamais sur <html>), alignée sur les tokens de marque.
 * Les entrées au scroll (`data-reveal`) sont rejouées à chaque story.
 */
const BG_BY_KEY: Record<string, { color: string; theme: 'dark' | 'raised' }> = {
  dark: { color: '#090912', theme: 'dark' },
  raised: { color: '#181826', theme: 'raised' },
};

let revealObserverAttached = false;

const preview: Preview = {
  decorators: [
    (story, context) => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('js');
        const key = String(
          context.globals?.backgrounds?.value ?? context.parameters?.backgrounds?.default ?? 'dark',
        );
        const resolved = BG_BY_KEY[key] ?? BG_BY_KEY['dark'];
        document.body.dataset.theme = resolved.theme;
        document.body.style.backgroundColor = resolved.color;
        initPrintGrain();
        requestAnimationFrame(() => initReveal());
        if (!revealObserverAttached && typeof MutationObserver !== 'undefined') {
          revealObserverAttached = true;
          const mo = new MutationObserver(() => initReveal());
          mo.observe(document.body, { childList: true, subtree: true });
        }
      }
      return story();
    },
  ],
  parameters: {
    options: {
      storySort: {
        order: ['Foundations', 'UI', 'Blocks'],
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
          name: 'Tablet (768×1024 — seuil md)',
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
      values: [
        { name: 'dark', value: '#090912' },
        { name: 'raised', value: '#181826' },
      ],
    },
    layout: 'padded',
  },
};

export default preview;
