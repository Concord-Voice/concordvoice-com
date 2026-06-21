# Downloads Page + Header Download Button — Design

**Date:** 2026-06-20
**Status:** Approved (design); pending implementation plan
**Repo:** `concordvoice-com` (Astro + Cloudflare Pages, static output)

## Goal

Ship a public **downloads page** for the Concord Voice desktop app (v0.2.0 Beta) and
replace the header's **"Coming Soon"** label with a **Download** button. The page
auto-detects the visitor's OS and architecture and recommends the right build, while
still listing every platform/arch/format.

## Context & constraints

- The site is **fully static** (`astro build`, `output: 'static'`) deployed to
  Cloudflare Pages. There is **no server runtime** — OS/arch detection must be
  **client-side**.
- The site makes **zero third-party requests** ("zero cookies, nothing tracked"). The
  downloads page must preserve this — **no `api.github.com` calls at runtime**.
- The v0.2.0 binaries are built in the **private** `Concord-Voice-Alpha` repo
  (tag `desktop-v0.2.0`). Anonymous downloads from a private repo **404**.
- **Decided:** a release mirror copies each cut from the private repo to the **public**
  `Concord-Voice/Concord-Voice` repo, **asset names unchanged**. The page links to:
  `https://github.com/Concord-Voice/Concord-Voice/releases/download/<tag>/<asset>`.
- No test framework exists in this repo; adding one is out of scope.

### Confirmed v0.2.0 assets (names mirror the private repo exactly)

| OS | Arches | Formats (filenames) |
|----|--------|---------------------|
| macOS | arm64, x64 | `ConcordVoice-0.2.0-macos-<arch>.zip` |
| Windows | x64, arm64 | `ConcordVoice-0.2.0-windows-<arch>-Setup.exe` |
| Linux | x64, arm64 | `ConcordVoice-0.2.0-linux-<arch>.AppImage`, `concord-voice_0.2.0_linux-<arch>.deb`, `concord-voice-0.2.0-linux-<arch>.rpm` |

`<arch>` ∈ `{arm64, x64}`. Note the **inconsistent** naming across Linux formats
(PascalCase+hyphen for AppImage, kebab+underscore for `.deb`, kebab+hyphen for `.rpm`) —
this is why filenames are encoded as **per-format templates**, not one global pattern.

## Approach: static-first, progressive enhancement

Server-render the **complete platform matrix** plus a neutral recommendation slot. A
tiny, dependency-free client script detects OS/arch and swaps in a "recommended for you"
button. A single build-time data module is the source of truth for both. Chosen over
edge detection (would force SSR on a deliberately static site) and client-only render
(empty hero with JS off, worse SEO).

## Decisions (from brainstorming)

- **Route:** `/download` (singular). Live page at repo root — **not** a gitignored draft.
- **macOS arch:** smart-detect via Chromium high-entropy client hints; when unknowable
  (Safari/Firefox), **default Apple Silicon** and always show an **Intel Mac** alternate.
- **Page scope:** **full page** — smart hero + complete OS/arch/format matrix + release-
  notes link + a short self-host/build-from-source pointer.
- **Version source:** **build-time data file** updated per release. No runtime third-party
  requests. (GitHub's `/releases/latest` excludes prereleases anyway, so a runtime fetch
  would also be wrong here.)
- **Linux default:** lead with **AppImage** (most universal); `.deb`/`.rpm` as alternates.
- **Header button:** filled **primary** CTA (gold→coral gradient) with a download glyph.

## Components

### 1. `src/data/downloads.ts` — single source of truth

Exports:

- `VERSION = '0.2.0'`
- `RELEASE_TAG = 'desktop-v0.2.0'`
- `MIRROR_REPO = 'Concord-Voice/Concord-Voice'`
- `RELEASE_NOTES_URL` — derived: `https://github.com/${MIRROR_REPO}/releases/tag/${RELEASE_TAG}`
- `assetUrl(filename)` → `https://github.com/${MIRROR_REPO}/releases/download/${RELEASE_TAG}/${filename}`
- `PLATFORMS` — typed structure:

```ts
type ArchId = 'arm64' | 'x64';
type Build = {
  format: 'zip' | 'exe' | 'AppImage' | 'deb' | 'rpm';
  label: string;        // e.g. ".AppImage (universal)"
  filename: string;     // resolved from VERSION + arch
  recommended?: boolean; // the lead format for this arch
};
type Arch = { id: ArchId; label: string; builds: Build[] };
type Platform = { id: 'mac' | 'windows' | 'linux'; label: string; installHint: string; arches: Arch[] };
```

Filenames are produced by per-format templates from `VERSION` + arch:
- mac: `ConcordVoice-${VERSION}-macos-${arch}.zip`
- win: `ConcordVoice-${VERSION}-windows-${arch}-Setup.exe`
- linux AppImage: `ConcordVoice-${VERSION}-linux-${arch}.AppImage`
- linux deb: `concord-voice_${VERSION}_linux-${arch}.deb`
- linux rpm: `concord-voice-${VERSION}-linux-${arch}.rpm`

**Per-release update = change `VERSION` and `RELEASE_TAG`.** Filenames regenerate.

### 2. `src/pages/download.astro` — the page (live, root)

- **Hero:** eyebrow "Desktop App · v0.2.0 Beta", H1 "Download Concord Voice", one-line sub.
- **Recommendation slot** `#dl-pick`: server-renders "Detecting your system…" plus a
  safe default anchor to the matrix (the no-JS fallback). The client script replaces its
  contents with a primary `.btn-primary` button (e.g. "Download for macOS · Apple
  Silicon") and an alternates row (Intel Mac link; Linux format alternates).
- **Full matrix** `#all-downloads`: three cards (macOS / Windows / Linux). Each lists
  every arch + format as direct download links, plus a one-line `installHint`:
  - macOS: "Unzip and drag Concord Voice to Applications."
  - Windows: "Run the Setup installer."
  - Linux: "Make the AppImage executable (`chmod +x`), or install the .deb/.rpm."
- **Footer strip:** link to `RELEASE_NOTES_URL`; "Prefer to self-host or build from
  source?" pointer to the public repo.
- Reuses existing `global.css` primitives: `.btn`, `.btn-primary`, `.pill`, `.eyebrow`,
  `.display`, `.text-mist`, `.text-gradient`, card/grid + `.reveal`/`.rise` motion.
  Page-specific layout (the three-card grid, recommendation slot) lives in a scoped
  `<style>` block in the page, matching how `index.astro` scopes its section styles.

### 3. Client detection script (inline in `download.astro`, zero-dependency)

Implemented as a **pure function** `pickTarget(nav) → { os, arch, supported }` plus a
small DOM-update wrapper, so the logic is testable in isolation.

- Preferred: `navigator.userAgentData.getHighEntropyValues(['architecture','bitness','platform'])`
  (async) → `architecture === 'arm'` ⇒ `arm64`, else `x64`; platform from `platformData`.
- Fallback (Safari/Firefox/older — no `userAgentData`): parse
  `navigator.userAgent` / `navigator.platform`:
  - macOS → default **arm64**, always expose Intel alternate.
  - Windows → `x64` (use `arm64` if UA/hints indicate ARM64).
  - Linux (not Android) → `x64` (use `arm64` if `aarch64`/`arm64` present); lead AppImage.
  - iOS / iPadOS / Android / ChromeOS → `supported: false`.
- On `supported: false`: render "Concord Voice desktop is for macOS, Windows & Linux —
  choose a build below," and reveal/scroll to the matrix.
- All failure modes (no `userAgentData`, promise rejection, unknown OS) degrade to the
  static matrix. Detection **never** breaks the page.

### 4. `src/components/Header.astro` — button swap

Replace line 69
(`<span class="eyebrow text-mist hidden sm:inline">Coming Soon</span>`) with a compact
**primary** Download button: gold→coral gradient, download glyph, links to `/download`.
- Lives in the existing `.header-actions` group, left of the GitHub/Kickstarter icons.
- Visible at all breakpoints: label text shown ≥`sm`, **icon-only** below `sm` (so it
  stays usable on mobile, unlike the old `hidden sm:inline` label).
- Always rendered (it is a CTA, not a draft-gated nav item, so it is independent of the
  `live` flag / draft-promotion system).

## Data flow

1. Build time: `download.astro` imports `PLATFORMS` from `downloads.ts`, server-renders
   the full matrix, and serializes the data the script needs (recommended filenames +
   URLs per os/arch) into the page via Astro `define:vars` on the client `<script>`.
2. Runtime: the script reads `navigator` capabilities, computes `{os, arch}`, looks up
   the matching recommended build from the injected data, and rewrites `#dl-pick`.
3. No network calls beyond the eventual click, which goes straight to the GitHub mirror
   CDN.

## Error handling / edge cases

- **JS disabled:** `#dl-pick` shows its static default + the always-present matrix.
- **`getHighEntropyValues` unsupported/rejected:** fall back to UA parsing.
- **Unknown/mobile OS:** "desktop only" message + matrix.
- **Mirror lag (asset not yet copied):** link 404s on GitHub's side; not detectable at
  build time. Mitigation is process (mirror before/with site deploy), not code.

## Testing & verification

- `npm run build` must pass (Astro type-checks `.astro` + `.ts`).
- Manual verification in `npm run dev`: spoof user agents for macOS (Safari + Chromium),
  Windows, Linux, and a mobile UA; plus one JS-disabled pass — confirm the recommended
  button and the matrix in each case.
- `pickTarget` is pure to allow a future unit test if a runner is added.

## Out of scope

- A Download CTA on the **homepage** hero (can follow up).
- The CI step that mirrors private→public release assets (already in progress separately).
- Checksums UI / signature verification panel.
- Any mobile app (none exists).

## Per-release maintenance

Bump `VERSION` and `RELEASE_TAG` in `src/data/downloads.ts`. If a future release changes
the asset naming scheme, update the corresponding per-format template.
