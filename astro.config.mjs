// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Static output (default) — deploys directly to Cloudflare Pages.
export default defineConfig({
  site: 'https://www.concordvoice.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
