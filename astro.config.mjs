// @ts-check
import { defineConfig } from 'astro/config';

// Static output (default) — deploys directly to Cloudflare Pages.
// Tailwind v4 runs via PostCSS (see postcss.config.mjs); the @tailwindcss/vite
// plugin is incompatible with Astro 6's rolldown-vite as of 2026-06.
export default defineConfig({
  site: 'https://concordvoice.com',
});
