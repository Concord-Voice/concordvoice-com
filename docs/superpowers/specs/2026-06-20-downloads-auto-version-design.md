# Downloads Page — Build-Time Auto-Version — Design

**Date:** 2026-06-20
**Status:** Approved (design); pending implementation plan
**Repo:** `concordvoice-com` (Astro + Cloudflare Pages, static output)
**Builds on:** the `/download` page shipped in `feat: add downloads page…` (commit `3fc0f93`).

## Goal

Make the downloads page track the **latest** desktop release automatically, instead of a
manual `VERSION` + `RELEASE_TAG` bump per release — without breaking the site's static
output or its "zero third-party requests at runtime" promise.

## Constraints

- Site is **static** (`output: 'static'`) on Cloudflare Pages; no server runtime.
- The deployed page must make **no third-party request at runtime** (visitor-facing). Any
  version lookup must happen at **build time** (in CI), invisible to visitors.
- The build must **never fail** because of a transient GitHub outage or a half-mirrored
  release.

## Approach (chosen)

Resolve the latest version at **build time** and bake it into the static HTML; trigger a
rebuild from the desktop release/mirror pipeline via a Cloudflare **Deploy Hook**.

Rejected alternatives: runtime browser fetch (breaks the zero-third-party-request promise,
rate-limited, exposes visitor IPs); GitHub `latest/download` redirect (needs version-less
asset names — a cross-repo change to the desktop build); Pages Function/edge SSR (converts
the deliberately-static route to a runtime function).

## Decisions

- **Version source:** GitHub API `GET /repos/Concord-Voice/Concord-Voice/releases/latest`
  (GitHub's "latest non-prerelease published release"). Betas published as full releases
  (current practice) are picked up; anything marked prerelease/RC is skipped — correct for
  a public download page.
- **Build resilience:** last-known-good fallback. Any resolver failure leaves the committed
  seed in place and the build continues.
- **Fallback storage:** `src/data/release.generated.json` is **committed** (the fallback
  seed), so `astro dev`, fresh checkouts, and resolver failures all still build. The
  resolver overwrites it **only if the value changed**.
- **Build wiring:** an npm `prebuild` hook runs the resolver before every `astro build`
  (including Cloudflare's `npm run build`). `astro dev` doesn't run it — the committed seed
  covers dev.
- **Deploy Hook:** created by the user (Cloudflare dashboard or CF API); called from the
  desktop **mirror-sync** workflow after assets land. Delivered here as a handoff message
  for the DMG chat (the Pages deploy-hook is not creatable via the connected Cloudflare MCP).

## Components

### 1. `scripts/resolve-release.mjs` (new)

Runs at build (npm `prebuild`). Plain Node ESM, zero new dependencies.

- Split into **pure, testable helpers** plus a thin network/IO wrapper:
  - `tagToVersion(tag: string): string | null` — `desktop-v0.2.0` → `0.2.0`; returns
    `null` for a tag that doesn't match `^desktop-v\d+\.\d+\.\d+`.
  - `validateRelease(release, version): boolean` — true only if the release's `assets[]`
    contains the expected macOS install assets for that version
    (`ConcordVoice-<version>-macos-arm64.dmg` and `…-macos-arm64.zip`) — a guard against a
    half-mirrored release. (Checks one representative `.dmg` + `.zip`; the matrix is
    derived, so one present implies the set is published.)
  - `main()` — `fetch` the latest-release endpoint (Node 18+ global `fetch`), parse JSON,
    run the helpers, and on success overwrite `src/data/release.generated.json` **only if
    `{version, tag}` differs** from the current file.
- **Failure handling:** network error, non-2xx, non-JSON, `tagToVersion` null, or
  `validateRelease` false → log `console.warn('[resolve-release] …; keeping committed seed')`
  and `process.exit(0)`. Never throws out, never exits non-zero, never writes a bad value.
- A `User-Agent` header is sent (GitHub API requires it). No auth token needed
  (unauthenticated is fine at build cadence); if `GITHUB_TOKEN` is present in the
  environment it's used to raise the rate limit, but it is optional.

### 2. `src/data/release.generated.json` (new, committed)

```json
{ "version": "0.2.0", "tag": "desktop-v0.2.0" }
```

The single source for `VERSION`/`RELEASE_TAG` **and** the last-known-good fallback. Committed
so every build path has it. The resolver overwrites-if-changed; a diff here is the natural
prompt to commit an updated seed.

### 3. `src/data/downloads.ts` (edit)

Replace the hardcoded literals with values from the generated file:

```ts
import release from './release.generated.json';
export const VERSION = release.version;
export const RELEASE_TAG = release.tag;
```

Everything else — `assetUrl`, the `fn` filename templates, `PLATFORMS`, `recommendedBuild`,
`platform` — is unchanged. All download URLs, the `v{VERSION}` label, and `RELEASE_NOTES_URL`
auto-follow. (Astro/Vite resolves a JSON import at build; `resolveJsonModule` is on via
`astro/tsconfigs/strict`.)

### 4. `package.json` (edit)

```json
"prebuild": "node scripts/resolve-release.mjs",
```

`npm run build` → npm runs `prebuild` (resolver) → `astro build`. Cloudflare Pages uses
`npm run build`, so it's covered. `test` script unchanged.

### 5. Deploy Hook handoff (deliverable, not code in this repo)

A self-contained message for the DMG chat to add to `Concord-Voice-Alpha`:
- Create a Cloudflare **Pages Deploy Hook** for the `concordvoice-preview` project (dashboard:
  Workers & Pages → the project → Settings → Builds & deployments → Deploy hooks; or
  `POST /accounts/{account_id}/pages/projects/{project}/deployment_hooks`). Store the
  resulting secret URL as the `CF_PAGES_DEPLOY_HOOK` repo secret.
- Add a final step to the **mirror-sync** workflow (after the release is mirrored to the
  public repo): `curl -fsS -X POST "$CF_PAGES_DEPLOY_HOOK"` so a new desktop release rebuilds
  the marketing site, which then resolves the new version.
- Ordering note: the hook must fire **after** assets are mirrored, so the resolver's
  asset-presence check passes.

## Data flow

Build: Cloudflare `npm run build` → `prebuild` resolver → GitHub latest-release API → write
`release.generated.json` (if changed) → `astro build` bakes URLs into static HTML → deploy.
Trigger: new desktop release → mirror-sync → `curl` Deploy Hook → Cloudflare rebuild.

## Error handling

| Failure | Behavior |
|---|---|
| GitHub unreachable / non-2xx / non-JSON | warn, keep seed, exit 0 |
| Tag not `desktop-vX.Y.Z` | warn, keep seed, exit 0 |
| Release missing expected macOS asset (mirror lag) | warn, keep seed, exit 0 |
| Resolved value == committed seed | no write (no dirty file) |

The page's existing macOS `.zip`-alternate already covers any residual mirror-lag window.

## Testing

- **`scripts/resolve-release.test.ts`** (new) — pure-helper tests via `node --test`:
  `tagToVersion` (valid `desktop-v1.2.3` → `1.2.3`; rejects `v1.2.3`, `desktop-vbeta`,
  `random`); `validateRelease` (asset present → true; missing `.dmg` → false; empty assets
  → false).
- **`src/data/downloads.test.ts`** (edit) — make version-agnostic: import `VERSION` and
  assert templating (`recommendedBuild('mac','arm64').filename === \`ConcordVoice-${VERSION}-macos-arm64.dmg\``,
  etc.), plus that `release.generated.json` parses and `VERSION` matches `^\d+\.\d+\.\d+`.
  Keeps tests green across version bumps.
- **Gate:** `npm test` green; `npm run build` succeeds; a manual `node scripts/resolve-release.mjs`
  resolves `0.2.0`/`desktop-v0.2.0` today (no change to the seed).

## Out of scope

- Creating the Cloudflare Deploy Hook (user action; produces a secret URL).
- The `Concord-Voice-Alpha` mirror-sync workflow edit (delivered as a handoff message).
- Showing a changelog / multiple versions on the page.

## Per-release maintenance (after this lands)

None required for a normal release: a new mirrored release auto-rebuilds the site (via the
Deploy Hook) and the resolver picks it up. The committed `release.generated.json` seed only
needs an occasional bump as a stale-fallback hygiene step (optional).
