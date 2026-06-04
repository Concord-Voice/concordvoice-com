# Concord Voice — Marketing Site

The public site for [concordvoice.com](https://concordvoice.com). Static, privacy-first,
self-hosted brand assets, **zero third-party trackers**. Built to replace the Squarespace
site and fold the public face into the same Git/CI discipline as the rest of Concord.

## Stack

- **[Astro](https://astro.build)** — static site generator (no server, no runtime)
- **[Tailwind CSS v4](https://tailwindcss.com)** — utility styling + bespoke design tokens
- **Cloudflare Pages** — edge hosting (free tier; unlimited bandwidth)

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
```

## Build & preview

```bash
npm run build      # → ./dist (static)
npm run preview    # serve the build locally
```

## Deploy (Cloudflare Pages)

```bash
npx wrangler login              # one-time, OAuth in browser
npm run build
npx wrangler pages deploy dist  # → https://concordvoice-preview.pages.dev
```

## Legal docs are rendered from canonical Markdown

`/terms` and `/privacy-policy` are generated from `src/legal/*.md`. In the canonical
setup these are the same Markdown files maintained in the Concord repo (synced or
symlinked), so the published pages can never drift from source — no copy-paste, no Termly.

## Layout

```
src/
  layouts/Layout.astro      # <head>, atmosphere (aurora/grain/stars), scroll-reveal
  components/Header.astro    # symbol + wordmark + CTA
  components/Footer.astro    # contact, legal links
  pages/index.astro          # the landing page
  pages/terms.astro          # renders src/legal/terms-of-service.md
  pages/privacy-policy.astro # renders src/legal/privacy-policy.md
  legal/*.md                 # canonical legal source
  styles/global.css          # design system (brand tokens, components, motion)
public/brand/                # logos + moon-and-two-stars symbol
public/fonts/Droidiga.otf    # display font (freeware, commercial-OK)
```
