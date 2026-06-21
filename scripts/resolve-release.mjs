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
