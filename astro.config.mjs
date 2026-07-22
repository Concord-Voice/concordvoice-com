// @ts-check
import { rm } from 'node:fs/promises';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// Static output (default) — deploys directly to Cloudflare Pages.
// Tailwind v4 uses the official Vite plugin.

/**
 * Draft pages live in src/pages/drafts/. They render normally in `astro dev`
 * for local preview, but this integration removes them from the build output —
 * so they can never be published by any deploy path: Cloudflare's Git build or
 * a manual `wrangler pages deploy dist`.
 * @returns {import('astro').AstroIntegration}
 */
function excludeDraftsFromBuild() {
  return {
    name: 'exclude-drafts-from-build',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        await rm(new URL('./drafts/', dir), { recursive: true, force: true });
        logger.info('Removed draft pages (src/pages/drafts/) from build output');
      },
    },
  };
}

export default defineConfig({
  site: 'https://concordvoice.com',
  integrations: [excludeDraftsFromBuild()],

  vite: {
    plugins: [tailwindcss()]
  }
});