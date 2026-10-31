# concordvoice.com

<a href="https://sonarcloud.io/summary/new_code?id=Concord-Voice_concordvoice-com"><img align="right" src="https://sonarcloud.io/api/project_badges/quality_gate?project=Concord-Voice_concordvoice-com" alt="Quality gate" /></a>

[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Concord-Voice_concordvoice-com&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=Concord-Voice_concordvoice-com)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Concord-Voice_concordvoice-com&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Concord-Voice_concordvoice-com)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Concord-Voice_concordvoice-com&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Concord-Voice_concordvoice-com)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Concord-Voice_concordvoice-com&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Concord-Voice_concordvoice-com)

[![AI Code Assurance](https://sonarcloud.io/api/project_badges/ai_code_assurance?project=Concord-Voice_concordvoice-com)](https://sonarcloud.io/summary/new_code?id=Concord-Voice_concordvoice-com)
[![trackers](https://img.shields.io/badge/trackers-zero-success)](#technical-overview)
[![hosting](https://img.shields.io/badge/hosting-Cloudflare%20Pages-orange?logo=cloudflare)](#deploy-cloudflare-pages)
[![built with](https://img.shields.io/badge/built%20with-Astro-blueviolet?logo=astro)](https://astro.build)
[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-dark.svg)](https://sonarcloud.io/summary/new_code?id=Concord-Voice_concordvoice-com)

The source of the public Concord Voice website.

**Website:** [www.concordvoice.com](https://www.concordvoice.com) | **Wiki:** [concordvoice-com wiki](https://github.com/Concord-Voice/concordvoice-com/wiki) | **Security:** security@concordvoice.com

---

## Introduction

Concord Voice is a privacy-first place to talk with your friends, your community, or your team. It gives you voice calls, video, screen sharing, and chat. Your device encrypts each message before it leaves, so our servers store your messages only as scrambled data that we cannot read. You can use our hosted service, or you can run the same software on your own hardware.

This repository builds the website at [concordvoice.com](https://www.concordvoice.com).
The site is static, and it has no third-party trackers, so a visit stays between you and us.

The terms of service and the privacy policy on the site come from the same Markdown files that we keep in source control.
What you read on the site is what we wrote, word for word.

For guides and background, see the [concordvoice-com wiki](https://github.com/Concord-Voice/concordvoice-com/wiki).

---

## Technical overview

The public site for [concordvoice.com](https://concordvoice.com). Static, privacy-first,
self-hosted brand assets, **zero third-party trackers**. Built to replace the Squarespace
site and fold the public face into the same Git/CI discipline as the rest of Concord.

### Stack

- **[Astro](https://astro.build)** — static site generator (no server, no runtime)
- **[Tailwind CSS v4](https://tailwindcss.com)** — utility styling + bespoke design tokens
- **Cloudflare Pages** — edge hosting (free tier; unlimited bandwidth)

### Develop

```bash
npm install
npm run dev        # http://localhost:4321
```

### Build & preview

```bash
npm run build      # → ./dist (static)
npm run preview    # serve the build locally
```

### Deploy (Cloudflare Pages)

Pushes to `main` build and deploy automatically (Cloudflare Pages Git integration; build
command `npm run build`, output directory `dist`). Pull requests get their own preview URL.

Manual deploy (fallback):

```bash
npx wrangler login              # one-time OAuth — use Chrome (Safari HTTPS-Only blocks the localhost callback)
npm run build
npx wrangler pages deploy dist
```

### Legal docs are rendered from canonical Markdown

`/terms` and `/privacy-policy` are generated from `src/legal/*.md`. In the canonical
setup these are the same Markdown files maintained in the Concord repo (synced or
symlinked), so the published pages can never drift from source — no copy-paste, no Termly.

### Layout

```
src/
  layouts/Layout.astro      # <head>, atmosphere (aurora/grain/stars), scroll-reveal
  components/Header.astro    # symbol + wordmark + CTA
  components/Footer.astro    # contact, legal, social row + WebGL "dusk fog" canvas
  pages/index.astro          # the landing page
  pages/terms.astro          # renders src/legal/terms-of-service.md
  pages/privacy-policy.astro # renders src/legal/privacy-policy.md
  legal/*.md                 # canonical legal source
  styles/global.css          # design system (brand tokens, components, motion)
public/brand/                # logos + moon-and-two-stars symbol
public/fonts/Droidiga.otf    # display font (freeware, commercial-OK)
```

---

## Security

Report a vulnerability by email to security@concordvoice.com. Do not open a public issue for it. The [security policy](https://github.com/Concord-Voice/.github/blob/main/SECURITY.md) describes the disclosure process.

---

## Contributing

We welcome help. Read the [contributing guide](https://github.com/Concord-Voice/.github/blob/main/CONTRIBUTING.md) and the [code of conduct](https://github.com/Concord-Voice/.github/blob/main/CODE_OF_CONDUCT.md) before you open a pull request. Report bugs and request features in our [feedback repository](https://github.com/Concord-Voice/Concord-Voice/issues).

---

## License

This repository has no license file yet. Concord Voice LLC keeps all rights to its content and brand assets. Third-party fonts and libraries keep their own licenses.

---

## Contact

- **Website:** [www.concordvoice.com](https://www.concordvoice.com)
- **Security:** security@concordvoice.com
- **Privacy:** privacy@concordvoice.com
- **General:** contact-us@concordvoice.com
