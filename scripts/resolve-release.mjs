// Build-time release resolver for the downloads page. Run by the npm `prebuild` hook.
// Pure helpers are exported for unit tests; main() runs only when executed directly.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** 'desktop-v0.2.0' -> '0.2.0'; returns null for anything that isn't desktop-vX.Y.Z.
 *  The version is rebuilt from Number()-parsed components, so the result is numeric-derived
 *  (not raw network text) — a sanitized value safe to embed in the generated file. */
export function tagToVersion(tag) {
  const m = /^desktop-v(\d+)\.(\d+)\.(\d+)$/.exec(tag ?? '');
  return m ? `${Number(m[1])}.${Number(m[2])}.${Number(m[3])}` : null;
}

/** True only if the release publishes the recommended download for every platform/arch the
 *  page advertises (macOS .dmg + .zip, Windows Setup .exe, Linux .AppImage, for arm64 and
 *  x64) — guards against adopting a half-mirrored release whose links would 404. */
export function validateRelease(release, version) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const names = new Set(assets.map((a) => a?.name));
  const required = ['arm64', 'x64'].flatMap((arch) => [
    `ConcordVoice-${version}-macos-${arch}.dmg`,
    `ConcordVoice-${version}-macos-${arch}.zip`,
    `ConcordVoice-${version}-windows-${arch}-Setup.exe`,
    `ConcordVoice-${version}-linux-${arch}.AppImage`,
  ]);
  return required.every((name) => names.has(name));
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

export function shouldFailClosed(env = process.env) {
  return env.CF_PAGES === '1' || env.CONCORD_RELEASE_RESOLUTION_REQUIRED === 'true';
}

function keepSeedOrFail(reason) {
  if (shouldFailClosed()) {
    throw new Error(`[resolve-release] ${reason}; refusing production build to avoid stale download links`);
  }
  console.warn(`[resolve-release] ${reason}; keeping committed seed`);
}

// Resolve the latest release and write it to OUT only if it changed. Never throws or exits
// non-zero for local builds. Cloudflare/required builds fail closed so production cannot
// silently publish an old release seed when GitHub or the mirror is unhealthy.
export async function main() {
  let release;
  try {
    const headers = { 'User-Agent': 'concordvoice-com-build', Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(LATEST_URL, { headers, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) { keepSeedOrFail(`GitHub API ${res.status}`); return; }
    release = await res.json();
  } catch (err) {
    keepSeedOrFail(`fetch failed (${err?.message ?? err})`);
    return;
  }

  const version = tagToVersion(release?.tag_name);
  if (!version) { keepSeedOrFail(`tag '${release?.tag_name}' is not desktop-vX.Y.Z`); return; }
  if (!validateRelease(release, version)) {
    keepSeedOrFail(`release desktop-v${version} is missing expected platform assets (mirror lag?)`);
    return;
  }

  // Build the written values from the sanitized version (numeric-derived), never the raw
  // network tag — keeps the generated file injection-proof and free of tainted-data flow.
  const tag = `desktop-v${version}`;
  const next = fileContents(version, tag);
  let current = '';
  try { current = await readFile(OUT, 'utf8'); } catch { /* will create */ }
  if (current === next) { console.log(`[resolve-release] up to date at ${tag}`); return; }
  await writeFile(OUT, next);
  console.log(`[resolve-release] updated to ${tag}`);
}

// Run only when executed directly (`node scripts/resolve-release.mjs`), not when imported by tests.
// Local builds keep the old fallback behavior; Cloudflare/required builds fail closed.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    const message = err?.message ?? err;
    if (shouldFailClosed()) {
      console.error(String(message).startsWith('[resolve-release]') ? message : `[resolve-release] unexpected error (${message}); refusing production build to avoid stale download links`);
      process.exitCode = 1;
      return;
    }
    console.warn(`[resolve-release] unexpected error (${message}); keeping committed seed`);
  });
}
