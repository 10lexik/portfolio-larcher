// @ts-check
import { defineConfig } from 'astro/config';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

/**
 * En mode `astro dev`, Vite intercepte par défaut les fichiers `.html` de `public/`
 * via `indexHtmlMiddleware` et tente de réécrire leurs `<script type="module">`.
 * Ce plugin sert telle quelle l'application statique compilée dans `public/storybook/`.
 */
function serveStorybookStatic() {
  const storybookDir = fileURLToPath(new URL('./public/storybook/', import.meta.url));
  return {
    name: 'serve-storybook-static',
    /** @param {{ middlewares: { use: (fn: (req: { url?: string }, res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b?: Buffer) => void }, next: () => void) => void) => void } }} server */
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url ?? '';
        const pathname = rawUrl.split('?')[0];
        if (pathname === '/storybook') {
          res.statusCode = 302;
          res.setHeader('Location', '/storybook/index.html');
          res.end();
          return;
        }
        if (pathname === '/storybook/' || pathname === '/storybook/index.html') {
          const indexFile = `${storybookDir}index.html`;
          if (existsSync(indexFile)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(readFileSync(indexFile));
            return;
          }
        }
        if (pathname === '/storybook/iframe.html') {
          const iframeFile = `${storybookDir}iframe.html`;
          if (existsSync(iframeFile)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(readFileSync(iframeFile));
            return;
          }
        }
        next();
      });
    },
  };
}

// Sortie 100 % statique : déployable telle quelle sur Vercel (dossier `dist/`).
// Le Storybook est construit dans `public/storybook` (et copié dans `dist/storybook`).
export default defineConfig({
  site: 'https://portfolio-larcher.vercel.app',
  output: 'static',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  vite: {
    plugins: [serveStorybookStatic(), tailwindcss()],
  },
  integrations: [svelte(), sitemap()],
});
