// One-off image pipeline for the marketing-site concept pages.
//
// The client's product screenshots live in a SEPARATE repo
// (Concord-Voice-Alpha/branding) which a Cloudflare build can't reach, and this
// site has no astro:assets configured. So we copy the few shots we need and emit
// optimized AVIF + WebP responsive widths into public/brand/shots/, committed here.
//
// Run:  node scripts/optimize-shots.mjs
// Override source root:  SHOTS_SRC=/path/to/branding/Concord-Voice node scripts/optimize-shots.mjs
//
// The four `server-*` theme shots are emitted at IDENTICAL dimensions so the
// concept pages can cross-fade between them with zero layout jump.

import { mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
// Default assumes the normal checkout layout (concordvoice-com sibling of
// Concord-Voice-Alpha). In a git worktree the path differs — pass SHOTS_SRC.
const SRC =
  process.env.SHOTS_SRC ||
  resolve(HERE, '../../Concord-Voice-Alpha/branding/Concord-Voice');
const OUT = resolve(HERE, '../public/brand/shots');

// friendly name -> source file (relative to SRC)
const SHOTS = {
  'chat-hero': 'screenshots/_hero/chat-hero.png',
  'voice-hero': 'screenshots/_hero/voice-hero.png',
  'dms-hero': 'screenshots/_hero/dms-hero.png',
  'server-dark': 'screenshots/chat/server-dark.png',
  'server-light': 'screenshots/chat/server-light.png',
  'server-candy': 'screenshots/chat/server-scheme-cottoncandy-dark.png',
  'server-hacker': 'screenshots/chat/server-scheme-hacker-dark.png',
  connect: 'screenshots/onboarding/connection-selector-dark.png',
  privacy: 'screenshots/settings/privacy-security-dark.png',
};

// Responsive widths to emit (capped at the source width).
const WIDTHS = [800, 1400, 2000];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

let count = 0;
for (const [name, rel] of Object.entries(SHOTS)) {
  const input = resolve(SRC, rel);
  const meta = await sharp(input).metadata();
  let emitted = 0;
  for (const w of WIDTHS) {
    // Skip widths larger than the source (upscaling would be lossy), but say so loudly:
    // <Shot> advertises the full WIDTHS set, so a silent skip would drift out of sync.
    if (w > meta.width) {
      console.warn(`  ! ${name}: source is ${meta.width}px wide, skipping ${w}w variant`);
      continue;
    }
    const base = sharp(input).resize({ width: w });
    await base
      .clone()
      .avif({ quality: 58, effort: 5 })
      .toFile(resolve(OUT, `${name}-${w}.avif`));
    await base
      .clone()
      .webp({ quality: 78 })
      .toFile(resolve(OUT, `${name}-${w}.webp`));
    count += 2;
    emitted += 1;
  }
  // A shot that produced no variants would make <Shot> reference files that don't exist.
  if (emitted === 0) {
    throw new Error(
      `${name}: source is only ${meta.width}px wide; none of the requested widths ` +
        `(${WIDTHS.join(', ')}) could be produced. Re-export larger or adjust WIDTHS.`,
    );
  }
  process.stdout.write(`  ${name.padEnd(14)} ${meta.width}x${meta.height}  (${emitted} widths)\n`);
}

console.log(`\nDone: ${count} files -> public/brand/shots/`);
