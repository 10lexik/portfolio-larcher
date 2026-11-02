// @ts-check
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig(
  {
    ignores: [
      'dist/',
      '.astro/',
      '.vercel/',
      'node_modules/',
      'sanity/',
      'scratch/',
      'public/',
      'storybook-static/',
      'coverage/',
    ],
  },

  js.configs.recommended,
  ts.configs.recommended,
  astro.configs.recommended,
  svelte.configs.recommended,

  // Le style est l'affaire de Prettier : on coupe les règles ESLint qui se chevauchent.
  prettier,
  svelte.configs.prettier,

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: { parser: ts.parser },
    },
  },

  // Typage strict (Lot B) : aucun `any`, aucune variable morte, aucun bloc vide.
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true, argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-empty': 'error',
      'no-useless-assignment': 'error',
      'prefer-const': 'error',
    },
  },

  // Svelte 5 : `let { … } = $props()` est la forme idiomatique ; la règle Svelte ignore les runes.
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    rules: {
      'prefer-const': 'off',
      'svelte/prefer-const': 'error',
    },
  },

  // Composants (Lot C) : clés de liste obligatoires, réactivité Svelte explicite.
  {
    rules: {
      'svelte/require-each-key': 'error',
      'svelte/prefer-svelte-reactivity': 'error',
      'preserve-caught-error': 'error',
    },
  },
);
