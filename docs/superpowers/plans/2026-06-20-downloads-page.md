# Downloads Page + Header Download Button — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public `/download` page that auto-detects the visitor's OS/architecture and recommends the right v0.2.0 desktop build, plus replace the header's "Coming Soon" label with a Download button.

**Architecture:** Static-first, progressive enhancement. A build-time data module (`src/data/downloads.ts`) is the single source of truth. The page server-renders the complete platform matrix; a small bundled client script (`src/lib/detect.ts` + inline render) swaps in a "recommended for you" button. No runtime third-party requests — links point at the public `Concord-Voice/Concord-Voice` GitHub release mirror.

**Tech Stack:** Astro 6 (static output), Tailwind v4 (via PostCSS), vanilla TS/JS (zero deps). Tests use Node 25's built-in `node --test` with native TypeScript type-stripping — **no new dependencies**.

---

## Verification model (read first)

This repo has **no test-runner dependency** and we are **not adding one**. The two pure,
logic-bearing modules — the data module (exact asset filenames; a typo = a 404) and the
detection function (many UA edge cases) — get real automated tests via Node's built-in
runner (`node --test`, zero install). The Astro page and the header markup are verified by
`npm run build` plus a scripted manual UA-spoof pass (Task 5). This matches the approved
spec's intent ("`pickTarget` is pure to allow a future unit test") — Node 25 already
provides the runner, so we use it.

Run all tests with: `npm test`

## File structure

- **Create** `src/data/downloads.ts` — version constants, asset-URL helper, `PLATFORMS`
  data, `recommendedBuild()` / `platform()` lookups. Single source of truth.
- **Create** `src/data/downloads.test.ts` — asserts exact recommended filenames + URL shape.
- **Create** `src/lib/detect.ts` — pure `pickTarget(nav)` → `{ os, arch, supported }`.
- **Create** `src/lib/detect.test.ts` — UA/arch classification cases.
- **Create** `src/pages/download.astro` — the page (hero + recommendation slot + matrix +
  scoped styles + bundled detection/render script).
- **Modify** `src/components/Header.astro` — swap line 69 "Coming Soon" span for a Download
  CTA button (+ scoped styles).
- **Modify** `package.json` — add a `test` script.

Each asset filename embeds `VERSION`, so a future release bump = edit `VERSION` +
`RELEASE_TAG` only.

---

## Task 1: Download data module (source of truth)

**Files:**
- Create: `src/data/downloads.ts`
- Test: `src/data/downloads.test.ts`
- Modify: `package.json` (add `test` script)

- [ ] **Step 1: Add the `test` script to `package.json`**

Edit the `"scripts"` block (after the existing `"optimize:shots"` line) to add:

```json
    "optimize:shots": "node scripts/optimize-shots.mjs",
    "test": "node --test \"src/**/*.test.ts\""
```

(Keep the trailing comma correct — `optimize:shots` now needs a comma after it.)

The glob is quoted so the shell leaves it to Node's test runner to expand — it matches
only the test files that currently exist, so each TDD step below fails for the intended
reason (missing module), not "file not found". Node 25 runs `.ts` test files natively.

- [ ] **Step 2: Write the failing test**

Create `src/data/downloads.test.ts`. These filenames are the exact strings confirmed to
return HTTP 206 from the public mirror — the test locks them so a version bump can't
silently typo a 404:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assetUrl, recommendedBuild, platform, VERSION, RELEASE_TAG, MIRROR_REPO } from './downloads.ts';

test('version + tag constants are wired', () => {
  assert.equal(VERSION, '0.2.0');
  assert.equal(RELEASE_TAG, 'desktop-v0.2.0');
  assert.equal(MIRROR_REPO, 'Concord-Voice/Concord-Voice');
});

test('assetUrl builds the public mirror download URL', () => {
  assert.equal(
    assetUrl('ConcordVoice-0.2.0-macos-arm64.zip'),
    'https://github.com/Concord-Voice/Concord-Voice/releases/download/desktop-v0.2.0/ConcordVoice-0.2.0-macos-arm64.zip',
  );
});

test('recommended builds resolve to the exact mirrored filenames', () => {
  assert.equal(recommendedBuild('mac', 'arm64')?.filename, 'ConcordVoice-0.2.0-macos-arm64.zip');
  assert.equal(recommendedBuild('mac', 'x64')?.filename, 'ConcordVoice-0.2.0-macos-x64.zip');
  assert.equal(recommendedBuild('windows', 'x64')?.filename, 'ConcordVoice-0.2.0-windows-x64-Setup.exe');
  assert.equal(recommendedBuild('windows', 'arm64')?.filename, 'ConcordVoice-0.2.0-windows-arm64-Setup.exe');
  assert.equal(recommendedBuild('linux', 'x64')?.filename, 'ConcordVoice-0.2.0-linux-x64.AppImage');
  assert.equal(recommendedBuild('linux', 'arm64')?.filename, 'ConcordVoice-0.2.0-linux-arm64.AppImage');
});

test('linux exposes deb + rpm alternates per arch', () => {
  const lx = platform('linux')!;
  const x64 = lx.arches.find((a) => a.id === 'x64')!;
  const kinds = x64.builds.map((b) => b.kind).sort();
  assert.deepEqual(kinds, ['AppImage', 'deb', 'rpm']);
  assert.equal(x64.builds.find((b) => b.kind === 'deb')?.filename, 'concord-voice_0.2.0_linux-x64.deb');
  assert.equal(x64.builds.find((b) => b.kind === 'rpm')?.filename, 'concord-voice-0.2.0-linux-x64.rpm');
});

test('every build has exactly one recommended format per arch', () => {
  for (const p of [platform('mac')!, platform('windows')!, platform('linux')!]) {
    for (const a of p.arches) {
      assert.equal(a.builds.filter((b) => b.recommended).length, 1, `${p.id}/${a.id}`);
    }
  }
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './downloads.ts'` (module not created yet).

- [ ] **Step 4: Implement the data module**

Create `src/data/downloads.ts`:

```ts
// Single source of truth for the desktop download links shown on /download.
//
// Per-release update: bump VERSION + RELEASE_TAG below. Asset filenames are derived
// from VERSION + arch, so nothing else changes unless the mirror alters the naming
// scheme. Binaries are mirrored from the private Concord-Voice-Alpha repo to the PUBLIC
// Concord-Voice/Concord-Voice repo, whose release assets download anonymously.

export const VERSION = '0.2.0';
export const RELEASE_TAG = 'desktop-v0.2.0';
export const MIRROR_REPO = 'Concord-Voice/Concord-Voice';

export const RELEASE_NOTES_URL = `https://github.com/${MIRROR_REPO}/releases/tag/${RELEASE_TAG}`;

/** Absolute download URL for a release asset on the public mirror. */
export function assetUrl(filename: string): string {
  return `https://github.com/${MIRROR_REPO}/releases/download/${RELEASE_TAG}/${filename}`;
}

export type OsId = 'mac' | 'windows' | 'linux';
export type ArchId = 'arm64' | 'x64';
export type FormatKind = 'zip' | 'exe' | 'AppImage' | 'deb' | 'rpm';

export interface Build {
  kind: FormatKind;
  label: string;     // short format label, e.g. ".AppImage · universal"
  filename: string;
  url: string;
  recommended: boolean; // the lead format for this arch
}

export interface Arch {
  id: ArchId;
  label: string;     // "Apple Silicon", "Intel", "ARM64", "x64"
  builds: Build[];
}

export interface Platform {
  id: OsId;
  label: string;     // "macOS", "Windows", "Linux"
  installHint: string;
  arches: Arch[];
}

// Per-format filename templates — encoded individually because the real asset names are
// inconsistent (PascalCase+hyphen for AppImage, kebab+underscore for .deb, kebab+hyphen
// for .rpm).
const fn = {
  macZip: (a: ArchId) => `ConcordVoice-${VERSION}-macos-${a}.zip`,
  winExe: (a: ArchId) => `ConcordVoice-${VERSION}-windows-${a}-Setup.exe`,
  appImage: (a: ArchId) => `ConcordVoice-${VERSION}-linux-${a}.AppImage`,
  deb: (a: ArchId) => `concord-voice_${VERSION}_linux-${a}.deb`,
  rpm: (a: ArchId) => `concord-voice-${VERSION}-linux-${a}.rpm`,
};

function build(kind: FormatKind, label: string, filename: string, recommended = false): Build {
  return { kind, label, filename, url: assetUrl(filename), recommended };
}

export const PLATFORMS: Platform[] = [
  {
    id: 'mac',
    label: 'macOS',
    installHint: 'Unzip, then drag Concord Voice into your Applications folder.',
    arches: [
      { id: 'arm64', label: 'Apple Silicon', builds: [build('zip', '.zip', fn.macZip('arm64'), true)] },
      { id: 'x64', label: 'Intel', builds: [build('zip', '.zip', fn.macZip('x64'), true)] },
    ],
  },
  {
    id: 'windows',
    label: 'Windows',
    installHint: 'Run the Setup installer and follow the prompts.',
    arches: [
      { id: 'x64', label: 'x64', builds: [build('exe', 'Installer (.exe)', fn.winExe('x64'), true)] },
      { id: 'arm64', label: 'ARM64', builds: [build('exe', 'Installer (.exe)', fn.winExe('arm64'), true)] },
    ],
  },
  {
    id: 'linux',
    label: 'Linux',
    installHint: 'Make the AppImage executable (chmod +x) and run it, or install the .deb / .rpm with your package manager.',
    arches: [
      {
        id: 'x64',
        label: 'x64',
        builds: [
          build('AppImage', '.AppImage · universal', fn.appImage('x64'), true),
          build('deb', '.deb · Debian/Ubuntu', fn.deb('x64')),
          build('rpm', '.rpm · Fedora/RHEL', fn.rpm('x64')),
        ],
      },
      {
        id: 'arm64',
        label: 'ARM64',
        builds: [
          build('AppImage', '.AppImage · universal', fn.appImage('arm64'), true),
          build('deb', '.deb · Debian/Ubuntu', fn.deb('arm64')),
          build('rpm', '.rpm · Fedora/RHEL', fn.rpm('arm64')),
        ],
      },
    ],
  },
];

/** The platform entry for an OS. */
export function platform(os: OsId): Platform | undefined {
  return PLATFORMS.find((p) => p.id === os);
}

/** The recommended (lead) build for an os/arch, falling back to the first available. */
export function recommendedBuild(os: OsId, arch: ArchId): Build | undefined {
  const p = platform(os);
  const a = p?.arches.find((x) => x.id === arch) ?? p?.arches[0];
  return a?.builds.find((b) => b.recommended) ?? a?.builds[0];
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all `downloads.test.ts` assertions green. (The glob matches only
`downloads.test.ts` so far; `detect.test.ts` doesn't exist until Task 2.)

- [ ] **Step 6: Commit**

```bash
git add src/data/downloads.ts src/data/downloads.test.ts package.json
git commit -m "feat: add download data module with mirrored asset URLs"
```

---

## Task 2: OS/architecture detection function

**Files:**
- Create: `src/lib/detect.ts`
- Test: `src/lib/detect.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/detect.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickTarget } from './detect.ts';

test('Chromium high-entropy: Apple Silicon Mac', () => {
  assert.deepEqual(pickTarget({ uaPlatform: 'macOS', uaArch: 'arm' }), { os: 'mac', arch: 'arm64', supported: true });
});

test('Chromium high-entropy: Intel Mac', () => {
  assert.deepEqual(pickTarget({ uaPlatform: 'macOS', uaArch: 'x86' }), { os: 'mac', arch: 'x64', supported: true });
});

test('Safari Mac (no hints) defaults to Apple Silicon', () => {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
  assert.deepEqual(pickTarget({ userAgent: ua, platform: 'MacIntel', maxTouchPoints: 0 }), { os: 'mac', arch: 'arm64', supported: true });
});

test('Windows x64 via hints', () => {
  assert.deepEqual(pickTarget({ uaPlatform: 'Windows', uaArch: 'x86' }), { os: 'windows', arch: 'x64', supported: true });
});

test('Windows on ARM via hints', () => {
  assert.deepEqual(pickTarget({ uaPlatform: 'Windows', uaArch: 'arm' }), { os: 'windows', arch: 'arm64', supported: true });
});

test('Windows (no hints) defaults to x64', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: 'windows', arch: 'x64', supported: true });
});

test('Windows on ARM detected from UA token when no hints', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; ARM64) AppleWebKit/537.36 (KHTML, like Gecko)';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: 'windows', arch: 'arm64', supported: true });
});

test('Linux x86_64', () => {
  const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: 'linux', arch: 'x64', supported: true });
});

test('Linux aarch64', () => {
  const ua = 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko)';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: 'linux', arch: 'arm64', supported: true });
});

test('Android is unsupported (not classified as Linux)', () => {
  const ua = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: null, arch: 'x64', supported: false });
});

test('iPhone is unsupported', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: null, arch: 'x64', supported: false });
});

test('iPadOS 13+ (poses as Mac, has touch) is unsupported', () => {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
  assert.deepEqual(pickTarget({ userAgent: ua, platform: 'MacIntel', maxTouchPoints: 5 }), { os: null, arch: 'x64', supported: false });
});

test('ChromeOS is unsupported', () => {
  const ua = 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko)';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: null, arch: 'x64', supported: false });
});

test('empty/unknown navigator is unsupported', () => {
  assert.deepEqual(pickTarget({}), { os: null, arch: 'x64', supported: false });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './detect.ts'`.

- [ ] **Step 3: Implement the detection function**

Create `src/lib/detect.ts`:

```ts
import type { OsId, ArchId } from '../data/downloads';

export interface DetectResult {
  os: OsId | null;   // null => unsupported (mobile / unknown)
  arch: ArchId;      // best guess; spec defaults applied
  supported: boolean;
}

/** Minimal navigator shape we read — kept tiny so the function is pure + testable. */
export interface NavLike {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
  uaArch?: string;     // navigator.userAgentData high-entropy "architecture" (e.g. 'arm', 'x86')
  uaPlatform?: string; // navigator.userAgentData "platform" (e.g. 'macOS', 'Windows', 'Linux', 'Android')
}

/**
 * Classify the visitor's OS + architecture. Pure + synchronous: any async high-entropy
 * client hint is resolved by the caller and passed in via uaArch / uaPlatform.
 *
 * Rules (design 2026-06-20):
 *  - macOS: default arm64 (Apple Silicon) when arch is unknowable.
 *  - Windows: default x64 unless hints / UA token say ARM64.
 *  - Linux (non-Android): default x64 unless aarch64 / arm64 present.
 *  - iOS / iPadOS / Android / ChromeOS / unknown: unsupported (desktop only).
 */
export function pickTarget(nav: NavLike): DetectResult {
  const ua = (nav.userAgent ?? '').toLowerCase();
  const plat = (nav.platform ?? '').toLowerCase();
  const hintPlat = (nav.uaPlatform ?? '').toLowerCase();
  const hintArch = (nav.uaArch ?? '').toLowerCase();
  const unsupported: DetectResult = { os: null, arch: 'x64', supported: false };

  const isAndroid = hintPlat === 'android' || /android/.test(ua);
  // iPadOS 13+ reports a Mac UA; the touch points give it away (no Mac has a touchscreen).
  const isIpadOS = /mac/.test(ua) && (nav.maxTouchPoints ?? 0) > 1;
  const isIOS = /iphone|ipad|ipod/.test(ua) || isIpadOS;
  const isChromeOS = hintPlat === 'chrome os' || /cros/.test(ua);
  if (isAndroid || isIOS || isChromeOS) return unsupported;

  const archFromHint = (): ArchId | null => {
    if (!hintArch) return null;
    if (hintArch.includes('arm')) return 'arm64';
    if (hintArch.includes('x86') || hintArch.includes('x64') || hintArch.includes('amd')) return 'x64';
    return null;
  };

  if (hintPlat === 'macos' || /mac/.test(ua) || /mac/.test(plat)) {
    return { os: 'mac', arch: archFromHint() ?? 'arm64', supported: true };
  }
  if (hintPlat === 'windows' || /win/.test(ua) || /win/.test(plat)) {
    const arch = archFromHint() ?? (/arm64|aarch64/.test(ua) ? 'arm64' : 'x64');
    return { os: 'windows', arch, supported: true };
  }
  if (hintPlat === 'linux' || /linux/.test(ua) || /linux/.test(plat)) {
    const arch = archFromHint() ?? (/aarch64|arm64/.test(ua) ? 'arm64' : 'x64');
    return { os: 'linux', arch, supported: true };
  }
  return unsupported;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all `detect.test.ts` and `downloads.test.ts` tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/detect.ts src/lib/detect.test.ts
git commit -m "feat: add pure OS/arch detection for the downloads page"
```

---

## Task 3: The downloads page

**Files:**
- Create: `src/pages/download.astro`

Note: `innerHTML` in the script below interpolates ONLY values from our own static data
module (URLs, labels) — never user input — so there is no XSS surface.

- [ ] **Step 1: Create the page**

Create `src/pages/download.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { PLATFORMS, VERSION, RELEASE_TAG, RELEASE_NOTES_URL } from '../data/downloads';
---

<Layout
  title="Download Concord Voice"
  description="Download the Concord Voice desktop app for macOS, Windows, and Linux. End-to-end encrypted voice, video, and messaging — private by default."
>
  <Header />

  <main class="dl mx-auto max-w-6xl px-6 pb-24 pt-6">
    <section class="dl-hero reveal">
      <p class="eyebrow text-gold">Desktop App · v{VERSION} Beta</p>
      <h1 class="display dl-h1">Download Concord Voice</h1>
      <p class="text-mist dl-sub">
        Private by default, on every desktop. End-to-end encrypted voice, video, and
        messaging for macOS, Windows, and Linux.
      </p>

      <!-- Recommendation slot: this server-rendered fallback is replaced by the script
           below once the visitor's OS/arch is known. With JS off it stays as-is and the
           full matrix below remains fully usable. -->
      <div class="dl-pick" id="dl-pick" data-state="detecting">
        <p class="dl-pick__detecting text-mist">
          Detecting your system… <a class="dl-link" href="#all-downloads">or choose your platform ↓</a>
        </p>
      </div>
    </section>

    <section id="all-downloads" class="dl-all reveal">
      <h2 class="display dl-all__h">All platforms</h2>
      <div class="dl-grid">
        {PLATFORMS.map((p) => (
          <article class="dl-card" data-os={p.id}>
            <h3 class="dl-card__h">{p.label}</h3>
            <div class="dl-card__arches">
              {p.arches.map((a) => (
                <div class="dl-arch">
                  <p class="eyebrow text-mist dl-arch__label">{a.label}</p>
                  <ul class="dl-builds">
                    {a.builds.map((b) => (
                      <li>
                        <a class="dl-build" href={b.url} data-os={p.id} data-arch={a.id}>
                          <span class="dl-build__fmt">{b.label}</span>
                          <span class="dl-build__dl" aria-hidden="true">↓</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p class="dl-card__hint text-mist">{p.installHint}</p>
          </article>
        ))}
      </div>

      <p class="dl-foot text-mist">
        Looking for checksums or other builds? See the
        <a class="dl-link" href={RELEASE_NOTES_URL} target="_blank" rel="noopener noreferrer">{RELEASE_TAG} release notes</a>.
        Prefer to self-host or build from source? Everything's on
        <a class="dl-link" href="https://github.com/Concord-Voice" target="_blank" rel="noopener noreferrer">GitHub</a>.
      </p>
    </section>
  </main>

  <Footer />
</Layout>

<style>
  .dl-hero { text-align: center; max-width: 46rem; margin: 0 auto; padding: 2.5rem 0 1rem; }
  .dl-h1 { font-size: clamp(2.2rem, 5vw, 3.4rem); margin: 0.4rem 0 0.8rem; }
  .dl-sub { font-size: 1.05rem; line-height: 1.6; margin: 0 auto 1.8rem; max-width: 38rem; }

  /* Recommendation slot — reserve height so the JS swap doesn't shift layout. */
  .dl-pick { min-height: 7.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
  .dl-pick__detecting { font-size: 0.95rem; }
  .dl-pick__cta {
    display: inline-flex; flex-direction: column; align-items: center; gap: 0.15rem;
    padding: 1rem 2rem; min-width: 18rem;
  }
  .dl-pick__big { font-size: 1.1rem; }
  .dl-pick__meta { font-size: 0.8rem; font-weight: 600; opacity: 0.8; }
  .dl-pick__alts { font-size: 0.9rem; }
  .dl-pick__hint { font-size: 0.85rem; max-width: 30rem; }
  .dl-pick__msg { font-size: 1rem; }

  .dl-link { color: var(--color-coral); font-weight: 600; }
  .dl-link:hover, .dl-link:focus-visible { color: var(--color-gold); text-decoration: underline; }

  .dl-all { margin-top: 3.5rem; }
  .dl-all__h { font-size: 1.4rem; text-align: center; margin-bottom: 1.5rem; }
  .dl-grid { display: grid; grid-template-columns: 1fr; gap: 1.1rem; }
  @media (min-width: 768px) { .dl-grid { grid-template-columns: repeat(3, 1fr); } }

  .dl-card {
    display: flex; flex-direction: column; gap: 0.9rem;
    padding: 1.4rem; border-radius: 1rem;
    background: color-mix(in oklab, var(--color-paper) 4%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-paper) 14%, transparent);
  }
  .dl-card__h { font-size: 1.15rem; margin: 0; }
  .dl-card__arches { display: flex; flex-direction: column; gap: 0.9rem; flex: 1; }
  .dl-arch__label { margin: 0 0 0.4rem; }
  .dl-builds { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }

  .dl-build {
    display: flex; align-items: center; justify-content: space-between; gap: 0.6rem;
    padding: 0.6rem 0.85rem; border-radius: 0.6rem;
    background: color-mix(in oklab, var(--color-paper) 5%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-paper) 12%, transparent);
    color: var(--color-paper); font-weight: 600; font-size: 0.9rem;
    transition: border-color 0.2s, background 0.2s, transform 0.2s;
  }
  .dl-build:hover, .dl-build:focus-visible {
    border-color: var(--color-coral);
    background: color-mix(in oklab, var(--color-coral) 14%, transparent);
    transform: translateY(-1px);
  }
  .dl-build__dl { color: var(--color-coral); }
  .dl-card__hint { font-size: 0.82rem; line-height: 1.5; margin: 0; }

  .dl-foot { text-align: center; font-size: 0.9rem; line-height: 1.6; margin-top: 2rem; }
</style>

<script>
  // Progressive enhancement: detect the visitor's OS/arch and replace #dl-pick with a
  // recommended-for-you button. All interpolated values come from our own static data
  // module (no user input), so innerHTML is safe here. Any failure leaves the SSR
  // fallback + the always-present matrix below.
  import { pickTarget } from '../lib/detect';
  import type { NavLike } from '../lib/detect';
  import { recommendedBuild, platform, VERSION } from '../data/downloads';
  import type { OsId, ArchId } from '../data/downloads';

  const OS_LABEL: Record<OsId, string> = { mac: 'macOS', windows: 'Windows', linux: 'Linux' };

  async function resolveNav(): Promise<NavLike> {
    const uaData = (navigator as any).userAgentData;
    const nav: NavLike = {
      userAgent: navigator.userAgent,
      platform: (navigator as any).platform,
      maxTouchPoints: navigator.maxTouchPoints,
      uaPlatform: uaData?.platform,
    };
    if (uaData?.getHighEntropyValues) {
      try {
        const hv = await uaData.getHighEntropyValues(['architecture', 'bitness', 'platform']);
        nav.uaArch = hv.architecture;
        if (hv.platform) nav.uaPlatform = hv.platform;
      } catch {
        // Keep UA fallback.
      }
    }
    return nav;
  }

  function archNote(os: OsId, arch: ArchId): string {
    if (os === 'mac') return arch === 'arm64' ? 'Apple Silicon' : 'Intel';
    return arch === 'arm64' ? 'ARM64' : '64-bit';
  }

  function render(slot: HTMLElement, nav: NavLike): void {
    const { os, arch, supported } = pickTarget(nav);

    if (!supported || !os) {
      slot.dataset.state = 'unsupported';
      slot.innerHTML =
        '<p class="dl-pick__msg text-mist">Concord Voice desktop is built for <strong>macOS</strong>, <strong>Windows</strong> &amp; <strong>Linux</strong>. Pick a build below.</p>' +
        '<a class="btn btn-primary dl-pick__cta" href="#all-downloads"><span class="dl-pick__big">See all downloads ↓</span></a>';
      return;
    }

    const primary = recommendedBuild(os, arch);
    const plat = platform(os);
    if (!primary || !plat) { slot.dataset.state = 'fallback'; return; }

    const alts: string[] = [];
    if (os === 'mac') {
      const otherArch: ArchId = arch === 'arm64' ? 'x64' : 'arm64';
      const other = recommendedBuild('mac', otherArch);
      if (other) alts.push(`<a class="dl-link" href="${other.url}">${archNote('mac', otherArch)} Mac?</a>`);
    } else if (os === 'linux') {
      const a = plat.arches.find((x) => x.id === arch) ?? plat.arches[0];
      for (const b of a.builds) {
        if (!b.recommended) alts.push(`<a class="dl-link" href="${b.url}">${b.label}</a>`);
      }
    }

    slot.dataset.state = 'ready';
    slot.innerHTML =
      `<a class="btn btn-primary dl-pick__cta" href="${primary.url}">` +
        `<span class="dl-pick__big">Download for ${OS_LABEL[os]}</span>` +
        `<span class="dl-pick__meta">${archNote(os, arch)} · ${primary.label} · v${VERSION}</span>` +
      `</a>` +
      (alts.length ? `<p class="dl-pick__alts text-mist">${alts.join(' &nbsp;·&nbsp; ')}</p>` : '') +
      `<p class="dl-pick__hint text-mist">${plat.installHint}</p>`;
  }

  const slot = document.getElementById('dl-pick');
  if (slot) {
    resolveNav()
      .then((nav) => render(slot, nav))
      .catch(() => { slot.dataset.state = 'fallback'; });
  }
</script>
```

- [ ] **Step 2: Build and verify the page renders with all asset URLs**

Run: `npm run build`
Expected: build succeeds; log includes "Removed draft pages…". Then verify the static
matrix shipped every build (14 binary links) and the page exists:

Run: `test -f dist/download/index.html && grep -o 'releases/download/desktop-v0.2.0/[^"]*' dist/download/index.html | sort -u | wc -l`
Expected: `10` (2 mac + 2 windows + 2×3 linux = 2+2+6). If the number is lower, a link is missing.
(The Intel-Mac / .deb / .rpm *alternate* links in the recommendation slot are generated
client-side, so they are correctly absent from the static HTML.)

- [ ] **Step 3: Commit**

```bash
git add src/pages/download.astro
git commit -m "feat: add /download page with OS-aware recommendation and full matrix"
```

---

## Task 4: Header Download button

**Files:**
- Modify: `src/components/Header.astro` (replace line 69; add scoped styles)

- [ ] **Step 1: Replace the "Coming Soon" span**

In `src/components/Header.astro`, replace this line (currently line 69):

```astro
    <span class="eyebrow text-mist hidden sm:inline">Coming Soon</span>
```

with:

```astro
    <a href="/download" class="dl-cta" aria-label="Download Concord Voice">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" />
      </svg>
      <span class="dl-cta__label">Download</span>
    </a>
```

- [ ] **Step 2: Add the button styles**

In the same file, inside the existing `<style>` block, append (just before the closing
`</style>` / the `@media (prefers-reduced-motion: reduce)` rule):

```css
  /* Header Download CTA — compact primary button (replaces the old "Coming Soon" label).
     Icon-only below sm so it stays usable on mobile; label appears from sm up. */
  .dl-cta {
    display: inline-flex; align-items: center; gap: 0.45rem;
    padding: 0.5rem 0.8rem; border-radius: 9999px;
    font-family: inherit; font-weight: 700; font-size: 0.9rem; line-height: 1;
    color: #1a0b2e;
    background: linear-gradient(100deg, var(--color-gold), var(--color-coral));
    box-shadow: 0 8px 28px -14px var(--color-coral);
    transition: transform 0.2s, filter 0.2s, box-shadow 0.2s;
  }
  .dl-cta:hover, .dl-cta:focus-visible { transform: translateY(-1px); filter: brightness(1.05); }
  .dl-cta:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 2px; }
  .dl-cta svg { width: 1rem; height: 1rem; }
  .dl-cta__label { display: none; }
  @media (min-width: 640px) { .dl-cta__label { display: inline; } }
```

- [ ] **Step 3: Build to verify**

Run: `npm run build`
Expected: build succeeds. Confirm the button shipped and the old label is gone:

Run: `grep -c 'class="dl-cta"' dist/index.html && ! grep -q 'Coming Soon' dist/index.html && echo "label removed"`
Expected: `1` then `label removed`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: replace header Coming Soon label with Download button"
```

---

## Task 5: Manual verification pass

**Files:** none (verification only; commit only if a tweak is needed).

The unit tests already prove the detection logic and the exact URLs. This task proves the
wiring, the visual result, and the no-JS / unsupported paths in a real browser.

- [ ] **Step 1: Build and preview**

```bash
npm run build && npm run preview
```

Open the printed URL + `/download`.

- [ ] **Step 2: Default (your real OS) check**

Confirm: hero renders; `#dl-pick` shows a single primary "Download for <your OS>" button
with an arch/format/version sub-line and an install hint; the "All platforms" grid shows
three cards (macOS / Windows / Linux) with every arch + format and per-OS install hints;
the footer release-notes link points to the `desktop-v0.2.0` page.

- [ ] **Step 3: UA-spoof checks (Chrome DevTools → ⋮ → More tools → Network conditions →
  User agent → uncheck "Use browser default")**

Paste each UA, reload `/download`, confirm the recommendation:

| Set User-Agent to | Expected `#dl-pick` |
|---|---|
| `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36` | "Download for **Windows**" |
| `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36` | "Download for **Linux**" + .deb/.rpm alternates |
| `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17 Safari/605.1.15` | "Download for **macOS**" · Apple Silicon + "Intel Mac?" link |
| `Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36` | "desktop is built for macOS, Windows & Linux" unsupported message |

(Restore "Use browser default" when done.)

- [ ] **Step 4: No-JS check**

DevTools → Command palette (Ctrl/Cmd+Shift+P) → "Disable JavaScript" → reload `/download`.
Confirm `#dl-pick` shows the "Detecting your system… or choose your platform ↓" fallback
and the full matrix is still present and clickable. Re-enable JS.

- [ ] **Step 5: Header button + real download**

On the home page, confirm the header shows the gradient **Download** button (icon-only on
a narrow window, icon+label ≥640px) and that it links to `/download`. On `/download`, click
one real build and confirm a download starts from `github.com` / its CDN (or a 206/200 in
the Network tab).

- [ ] **Step 6: Capture a screenshot for the record (optional) and finish**

If everything passes, the feature is complete. If a visual tweak was needed, commit it:

```bash
git add -A && git commit -m "fix: polish downloads page after manual verification"
```

---

## Self-review notes

- **Spec coverage:** data module (§Components 1) → Task 1; detection incl. macOS-default-
  Apple-Silicon, Windows/Linux defaults, unsupported handling (§Components 3) → Task 2;
  full page hero + recommendation slot + matrix + footer + scoped styles (§Components 2) →
  Task 3; header swap (§Components 4) → Task 4; build + manual UA-spoof + no-JS verification
  (§Testing) → Task 5. Build-time data / zero third-party requests preserved (no runtime
  fetch anywhere). Per-release update = bump two constants (§Per-release maintenance).
- **Type consistency:** `OsId`/`ArchId`/`Build`/`Platform`, `recommendedBuild()`,
  `platform()`, `assetUrl()`, `pickTarget()`, `NavLike`, `DetectResult` are defined in
  Tasks 1–2 and used with identical names/signatures in Tasks 3.
- **No placeholders:** every step has concrete code/commands and expected output.
```
