import type { StorybookConfig } from '@storybook/svelte-vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

/**
 * Alias d'import dérivés de tsconfig.json (SSOT, mêmes alias qu'Astro) :
 * `@x/*` → préfixe de dossier, `@x` → fichier exact.
 */
const tsconfig = JSON.parse(readFileSync(new URL('../tsconfig.json', import.meta.url), 'utf8')) as {
  compilerOptions: { paths: Record<string, string[]> };
};
const escapeRe = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const tsconfigAliases = Object.entries(tsconfig.compilerOptions.paths).map(([key, [target]]) => {
  const absolute = fileURLToPath(new URL(`../${target.replace(/^\.\//, '')}`, import.meta.url));
  return key.endsWith('/*')
    ? {
        find: new RegExp(`^${escapeRe(key.slice(0, -2))}/`),
        replacement: absolute.replace(/\*$/, ''),
      }
    : { find: new RegExp(`^${escapeRe(key)}$`), replacement: absolute };
});

const config: StorybookConfig = {
  stories: [
    {
      directory: '../src/core/stories',
      files: '**/*.@(mdx|stories.@(js|ts|svelte))',
      titlePrefix: 'Foundations',
    },
    {
      directory: '../src/ui',
      files: '**/*.stories.@(js|ts|svelte)',
      titlePrefix: 'UI',
    },
    {
      directory: '../src/blocks',
      files: '**/*.stories.@(js|ts|svelte)',
      titlePrefix: 'Blocks',
    },
    {
      directory: '../src/domains',
      files: '**/*.stories.@(js|ts|svelte)',
      titlePrefix: 'Domains',
    },
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-svelte-csf'],
  framework: {
    name: '@storybook/svelte-vite',
    options: {},
  },
  async viteFinal(config, { configType }) {
    config.publicDir = configType === 'DEVELOPMENT' ? '../public' : false;
    config.plugins = [svelte(), tailwindcss(), ...(config.plugins || [])];
    config.resolve = config.resolve || {};
    const existing = config.resolve.alias ?? [];
    config.resolve.alias = [
      ...tsconfigAliases,
      ...(Array.isArray(existing)
        ? existing
        : Object.entries(existing).map(([find, replacement]) => ({ find, replacement }))),
    ];
    return config;
  },
};

export default config;
