# Downloads Page — Build-Time Auto-Version — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The downloads page tracks the latest desktop release automatically — resolved at build time and baked into the static HTML — instead of a manual per-release `VERSION`/`RELEASE_TAG` bump.

**Architecture:** An npm `prebuild` script queries the mirror's GitHub latest-release API and writes the version/tag into a committed generated module that `downloads.ts` imports. Every failure path falls back to the committed value, so the build never breaks and the deployed page makes no runtime third-party calls. A Cloudflare Deploy Hook (handoff doc) rebuilds the site on new releases.

**Tech Stack:** Astro 6 (static, rolldown-vite), plain Node ESM build script (global `fetch`, zero new deps), Node 25 built-in `node --test`.

---

## Verified design note (refinement from spec)

The generated file is **`src/data/release.generated.ts`** (a TS module), not the spec's
`.json`. Reason, confirmed by spike: a `.ts` module with an explicit `.ts` import works in
BOTH `node --test` (native TS) and the Astro/rolldown build, whereas a JSON import needs
import attributes (`with { type: 'json' }`) whose rolldown support is uncertain. The `.ts`
module is proven in both toolchains.

**Byte-identical invariant:** the committed seed file (Task 1) and the resolver's generated
output (Task 3) MUST be byte-for-byte identical for the current version, so that running the
resolver when the version is unchanged produces no diff. Both use the exact template in
`fileContents()` below.

## File structure

- **Create** `src/data/release.generated.ts` — committed `{VERSION, RELEASE_TAG}` seed +
  build-time output target. The single source for both values and the last-known-good fallback.
- **Modify** `src/data/downloads.ts` — import `VERSION`/`RELEASE_TAG` from the generated module.
- **Modify** `src/data/downloads.test.ts` — version-agnostic assertions.
- **Create** `scripts/resolve-release.mjs` — pure helpers (`tagToVersion`, `validateRelease`)
  + guarded `main()` (fetch latest, validate, write-if-changed, never fail the build).
- **Create** `scripts/resolve-release.test.ts` — `node --test` coverage of the pure helpers.
- **Modify** `package.json` — extend the `test` glob to `scripts/`, add the `prebuild` hook.
- **Create** `docs/auto-version-deploy-hook.md` — cross-repo Deploy Hook wiring handoff.

---

## Task 1: Generated seed + data module reads it

**Files:**
- Create: `src/data/release.generated.ts`
- Modify: `src/data/downloads.ts`
- Modify: `src/data/downloads.test.ts`

This is a refactor; the (version-agnostic) tests are the safety net.

- [ ] **Step 1: Create the committed seed module**

Create `src/data/release.generated.ts` with EXACTLY this content (it must match the
resolver's `fileContents()` output in Task 3 byte-for-byte):

```ts
// Resolved at build time by scripts/resolve-release.mjs (npm prebuild). Committed value
// is the last-known-good fallback for astro dev, fresh checkouts, and resolver failures.
export const VERSION = '0.2.0';
export const RELEASE_TAG = 'desktop-v0.2.0';
```

- [ ] **Step 2: Point `downloads.ts` at the generated module**

In `src/data/downloads.ts`, replace these two lines:

```ts
export const VERSION = '0.2.0';
export const RELEASE_TAG = 'desktop-v0.2.0';
```

with:

```ts
import { VERSION, RELEASE_TAG } from './release.generated.ts';
export { VERSION, RELEASE_TAG };
```

(The explicit `.ts` extension is required for `node --test` and is resolved fine by the
Astro/rolldown build. Everything else in `downloads.ts` — `fn` templates, `assetUrl`,
`PLATFORMS`, `RELEASE_NOTES_URL` — is unchanged and now derives from these imports.)

- [ ] **Step 3: Make `downloads.test.ts` version-agnostic**

Replace the entire contents of `src/data/downloads.test.ts` with:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assetUrl, recommendedBuild, platform, VERSION, RELEASE_TAG, MIRROR_REPO, RELEASE_NOTES_URL } from './downloads.ts';

test('version + tag are wired and internally consistent', () => {
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);          // resolved/seeded semver
  assert.equal(RELEASE_TAG, `desktop-v${VERSION}`);  // tag derives from version
  assert.equal(MIRROR_REPO, 'Concord-Voice/Concord-Voice');
});

test('release notes URL points at the public mirror tag', () => {
  assert.equal(RELEASE_NOTES_URL, `https://github.com/Concord-Voice/Concord-Voice/releases/tag/${RELEASE_TAG}`);
});

test('assetUrl builds the public mirror download URL', () => {
  assert.equal(
    assetUrl('example.bin'),
    `https://github.com/Concord-Voice/Concord-Voice/releases/download/${RELEASE_TAG}/example.bin`,
  );
});

test('recommended builds resolve to the exact mirrored filenames for the current version', () => {
  assert.equal(recommendedBuild('mac', 'arm64')?.filename, `ConcordVoice-${VERSION}-macos-arm64.dmg`);
  assert.equal(recommendedBuild('mac', 'x64')?.filename, `ConcordVoice-${VERSION}-macos-x64.dmg`);
  assert.equal(recommendedBuild('windows', 'x64')?.filename, `ConcordVoice-${VERSION}-windows-x64-Setup.exe`);
  assert.equal(recommendedBuild('windows', 'arm64')?.filename, `ConcordVoice-${VERSION}-windows-arm64-Setup.exe`);
  assert.equal(recommendedBuild('linux', 'x64')?.filename, `ConcordVoice-${VERSION}-linux-x64.AppImage`);
  assert.equal(recommendedBuild('linux', 'arm64')?.filename, `ConcordVoice-${VERSION}-linux-arm64.AppImage`);
});

test('macOS leads with the .dmg installer and keeps the .zip as an alternate', () => {
  const mac = platform('mac')!;
  for (const a of mac.arches) {
    const kinds = a.builds.map((b) => b.kind).sort();
    assert.deepEqual(kinds, ['dmg', 'zip'], a.id);
    assert.equal(a.builds.find((b) => b.kind === 'dmg')?.recommended, true, a.id);
    assert.equal(a.builds.find((b) => b.kind === 'zip')?.recommended, false, a.id);
    assert.equal(a.builds.find((b) => b.kind === 'zip')?.filename, `ConcordVoice-${VERSION}-macos-${a.id}.zip`);
  }
});

test('linux exposes deb + rpm alternates per arch', () => {
  const lx = platform('linux')!;
  const x64 = lx.arches.find((a) => a.id === 'x64')!;
  const kinds = x64.builds.map((b) => b.kind).sort();
  assert.deepEqual(kinds, ['AppImage', 'deb', 'rpm']);
  assert.equal(x64.builds.find((b) => b.kind === 'deb')?.filename, `concord-voice_${VERSION}_linux-x64.deb`);
  assert.equal(x64.builds.find((b) => b.kind === 'rpm')?.filename, `concord-voice-${VERSION}-linux-x64.rpm`);
});

test('every build has exactly one recommended format per arch', () => {
  for (const p of [platform('mac')!, platform('windows')!, platform('linux')!]) {
    for (const a of p.arches) {
      assert.equal(a.builds.filter((b) => b.recommended).length, 1, `${p.id}/${a.id}`);
    }
  }
});
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS — all tests green (VERSION resolves to `0.2.0` from the seed).

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: build succeeds (rolldown resolves the `.ts` import).

- [ ] **Step 6: Commit**

```bash
git add src/data/release.generated.ts src/data/downloads.ts src/data/downloads.test.ts
git commit -m "refactor: source download version from a generated module"
```

---

## Task 2: Resolver pure helpers + tests

**Files:**
- Create: `scripts/resolve-release.mjs`
- Create: `scripts/resolve-release.test.ts`
- Modify: `package.json` (test glob)

- [ ] **Step 1: Extend the test glob to cover `scripts/`**

In `package.json`, change the `test` script from:

```json
    "test": "node --test \"src/**/*.test.ts\""
```

to:

```json
    "test": "node --test \"src/**/*.test.ts\" \"scripts/**/*.test.ts\""
```

- [ ] **Step 2: Write the failing helper test**

Create `scripts/resolve-release.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tagToVersion, validateRelease } from './resolve-release.mjs';

test('tagToVersion extracts semver from a desktop-v tag', () => {
  assert.equal(tagToVersion('desktop-v0.2.0'), '0.2.0');
  assert.equal(tagToVersion('desktop-v1.10.3'), '1.10.3');
});

test('tagToVersion rejects non-matching tags', () => {
  assert.equal(tagToVersion('v0.2.0'), null);
  assert.equal(tagToVersion('desktop-vbeta'), null);
  assert.equal(tagToVersion('desktop-v0.2'), null);
  assert.equal(tagToVersion(''), null);
  assert.equal(tagToVersion(undefined), null);
});

test('validateRelease requires the macOS dmg + zip for the version', () => {
  const ok = { assets: [
    { name: 'ConcordVoice-0.2.0-macos-arm64.dmg' },
    { name: 'ConcordVoice-0.2.0-macos-arm64.zip' },
    { name: 'ConcordVoice-0.2.0-windows-x64-Setup.exe' },
  ] };
  assert.equal(validateRelease(ok, '0.2.0'), true);
});

test('validateRelease fails when the dmg is missing (mirror lag)', () => {
  const noDmg = { assets: [{ name: 'ConcordVoice-0.2.0-macos-arm64.zip' }] };
  assert.equal(validateRelease(noDmg, '0.2.0'), false);
});

test('validateRelease fails on empty or missing assets', () => {
  assert.equal(validateRelease({ assets: [] }, '0.2.0'), false);
  assert.equal(validateRelease({}, '0.2.0'), false);
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './resolve-release.mjs'`.

- [ ] **Step 4: Implement the helpers**

Create `scripts/resolve-release.mjs`:

```js
// Build-time release resolver for the downloads page. Run by the npm `prebuild` hook.
// Pure helpers are exported for unit tests; main() runs only when executed directly.

/** 'desktop-v0.2.0' -> '0.2.0'; returns null for anything that isn't desktop-vX.Y.Z. */
export function tagToVersion(tag) {
  const m = /^desktop-v(\d+\.\d+\.\d+)$/.exec(tag ?? '');
  return m ? m[1] : null;
}

/** True only if the release publishes the macOS install assets for `version`
 *  (guards against adopting a half-mirrored release). */
export function validateRelease(release, version) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const names = new Set(assets.map((a) => a?.name));
  return names.has(`ConcordVoice-${version}-macos-arm64.dmg`)
    && names.has(`ConcordVoice-${version}-macos-arm64.zip`);
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npm test`
Expected: PASS — the 5 new resolver-helper tests plus all Task 1 tests are green.

- [ ] **Step 6: Commit**

```bash
git add scripts/resolve-release.mjs scripts/resolve-release.test.ts package.json
git commit -m "feat: add release-resolver pure helpers with tests"
```

---

## Task 3: Resolver main() + prebuild wiring

**Files:**
- Modify: `scripts/resolve-release.mjs` (add imports, `fileContents`, `main`, run-guard)
- Modify: `package.json` (add `prebuild`)

- [ ] **Step 1: Add the runner to `scripts/resolve-release.mjs`**

Add these imports at the TOP of `scripts/resolve-release.mjs` (above the existing exports):

```js
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
```

Then append to the END of the file:

```js
const LATEST_URL = 'https://api.github.com/repos/Concord-Voice/Concord-Voice/releases/latest';
const OUT = path.join(process.cwd(), 'src', 'data', 'release.generated.ts');

/** Exact contents of release.generated.ts — MUST match the committed seed byte-for-byte. */
export function fileContents(version, tag) {
  return (
    '// Resolved at build time by scripts/resolve-release.mjs (npm prebuild). Committed value\n' +
    '// is the last-known-good fallback for astro dev, fresh checkouts, and resolver failures.\n' +
    `export const VERSION = '${version}';\n` +
    `export const RELEASE_TAG = '${tag}';\n`
  );
}

// Resolve the latest release and write it to OUT only if it changed. Never throws or exits
// non-zero — every failure path keeps the committed seed so the build can't break.
export async function main() {
  let release;
  try {
    const headers = { 'User-Agent': 'concordvoice-com-build', Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(LATEST_URL, { headers });
    if (!res.ok) { console.warn(`[resolve-release] GitHub API ${res.status}; keeping committed seed`); return; }
    release = await res.json();
  } catch (err) {
    console.warn(`[resolve-release] fetch failed (${err?.message ?? err}); keeping committed seed`);
    return;
  }

  const tag = release?.tag_name;
  const version = tagToVersion(tag);
  if (!version) { console.warn(`[resolve-release] tag '${tag}' is not desktop-vX.Y.Z; keeping committed seed`); return; }
  if (!validateRelease(release, version)) {
    console.warn(`[resolve-release] release ${tag} is missing expected macOS assets (mirror lag?); keeping committed seed`);
    return;
  }

  const next = fileContents(version, tag);
  let current = '';
  try { current = await readFile(OUT, 'utf8'); } catch { /* will create */ }
  if (current === next) { console.log(`[resolve-release] up to date at ${tag}`); return; }
  await writeFile(OUT, next);
  console.log(`[resolve-release] updated to ${tag}`);
}

// Run only when executed directly (`node scripts/resolve-release.mjs`), not when imported by tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
```

- [ ] **Step 2: Add the `prebuild` hook**

In `package.json` `"scripts"`, add (npm runs `prebuild` automatically before `build`):

```json
    "prebuild": "node scripts/resolve-release.mjs",
```

- [ ] **Step 3: Verify the resolver resolves the current release with no diff**

Run: `node scripts/resolve-release.mjs`
Expected: prints `[resolve-release] up to date at desktop-v0.2.0` (today's latest), exit 0.

Run: `git status --short src/data/release.generated.ts`
Expected: **no output** (no diff — the resolver's output is byte-identical to the seed).
If there IS a diff, the seed in Task 1 doesn't match `fileContents()` — reconcile them.

- [ ] **Step 4: Verify the build runs the resolver**

Run: `npm run build`
Expected: build succeeds; output includes a `[resolve-release] up to date…` line before the
Astro build (the `prebuild` hook ran).

- [ ] **Step 5: Verify tests still pass and the resolver isn't run by `npm test`**

Run: `npm test`
Expected: PASS — all tests green, and NO `[resolve-release]` line (tests import the helpers
but never call `main()`; `npm test` doesn't trigger `prebuild`).

- [ ] **Step 6: Commit**

```bash
git add scripts/resolve-release.mjs package.json
git commit -m "feat: resolve the latest release at build time via prebuild hook"
```

---

## Task 4: Deploy Hook handoff doc

**Files:**
- Create: `docs/auto-version-deploy-hook.md`

- [ ] **Step 1: Write the handoff doc**

Create `docs/auto-version-deploy-hook.md`:

```markdown
# Auto-version: Cloudflare Deploy Hook wiring

The downloads page resolves the latest desktop release at **build time**
(`scripts/resolve-release.mjs`, run by the npm `prebuild` hook). For a new release to appear
on the live site, the Cloudflare Pages project must rebuild. Wire that to the desktop
release pipeline with a Deploy Hook.

## One-time: create the Deploy Hook (Cloudflare side)

Dashboard: Workers & Pages → `concordvoice-preview` (the Pages project) → Settings →
Builds & deployments → Deploy hooks → "Add deploy hook" (branch: `main`). Copy the URL.

Or via the Cloudflare API (needs an API token with Pages edit):
`POST /accounts/{account_id}/pages/projects/concordvoice-preview/deployment_hooks`
with `{ "name": "release-rebuild", "branch": "main" }` → returns the hook URL.

The hook URL is a secret (anyone with it can trigger a build). Store it, do not commit it.

## Repo wiring (Concord-Voice-Alpha)

1. Add the hook URL as a repo secret: `CF_PAGES_DEPLOY_HOOK`.
2. In the **mirror-sync** workflow (the one that mirrors a desktop release to the public
   `Concord-Voice/Concord-Voice` repo), add a final step AFTER the assets are mirrored:

   ```yaml
   - name: Trigger marketing site rebuild
     if: ${{ success() }}
     env:
       HOOK: ${{ secrets.CF_PAGES_DEPLOY_HOOK }}
     run: |
       if [ -n "$HOOK" ]; then
         curl -fsS -X POST "$HOOK" && echo "Triggered concordvoice-com rebuild"
       else
         echo "::warning::CF_PAGES_DEPLOY_HOOK not set; skipping site rebuild"
       fi
   ```

   Ordering matters: fire it only after the public release + its assets exist, so the
   resolver's asset-presence check passes and the new version is adopted.

## Result

New desktop release → mirrored to the public repo → Deploy Hook → Cloudflare rebuilds
concordvoice-com → `prebuild` resolves the new version → links + version label update. No
manual edits. If resolution ever fails, the build falls back to the committed
`src/data/release.generated.ts` value.
```

- [ ] **Step 2: Commit**

```bash
git add docs/auto-version-deploy-hook.md
git commit -m "docs: add Cloudflare Deploy Hook wiring for auto-version"
```

---

## Self-review

- **Spec coverage:** resolver (§Components 1) → Tasks 2–3; generated seed/fallback
  (§Components 2) → Task 1; `downloads.ts` edit (§Components 3) → Task 1; `prebuild`
  (§Components 4) → Task 3; Deploy Hook handoff (§Components 5) → Task 4; error-handling
  table → Task 3 `main()`; version-agnostic + helper tests (§Testing) → Tasks 1–2. The
  `.json`→`.ts` refinement is documented above and verified by spike.
- **Placeholder scan:** none — every step has concrete code/commands and expected output.
- **Type/identifier consistency:** `tagToVersion`, `validateRelease`, `fileContents`, `main`,
  `VERSION`, `RELEASE_TAG`, the `release.generated.ts` path, and the exact macOS asset names
  (`ConcordVoice-<version>-macos-arm64.{dmg,zip}`) are used identically across the resolver,
  the seed, and the tests. The seed (Task 1) and `fileContents()` (Task 3) are explicitly
  required to be byte-identical, with a Task 3 check that enforces it.
```
