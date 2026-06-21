// Build-time release resolver for the downloads page. Run by the npm `prebuild` hook.
// Pure helpers are exported for unit tests; main() runs only when executed directly.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

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
    const res = await fetch(LATEST_URL, { headers, signal: AbortSignal.timeout(10_000) });
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
// The .catch() backstops any unexpected rejection (e.g. a writeFile failure) so a build-time
// run can NEVER exit non-zero and break `npm run build` — it always falls back to the seed.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.warn(`[resolve-release] unexpected error (${err?.message ?? err}); keeping committed seed`);
  });
}
