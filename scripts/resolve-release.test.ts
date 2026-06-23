import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldFailClosed, tagToVersion, validateRelease } from './resolve-release.mjs';

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

test('tagToVersion rejects pre-release / 4-part tags (page never auto-adopts an RC)', () => {
  assert.equal(tagToVersion('desktop-v0.2.0-rc1'), null);
  assert.equal(tagToVersion('desktop-v0.2.0-beta'), null);
  assert.equal(tagToVersion('desktop-v0.2.0.1'), null);
});

// Every recommended download the page advertises, for both arches.
function fullAssets(version: string) {
  return ['arm64', 'x64'].flatMap((arch) => [
    { name: `ConcordVoice-${version}-macos-${arch}.dmg` },
    { name: `ConcordVoice-${version}-macos-${arch}.zip` },
    { name: `ConcordVoice-${version}-windows-${arch}-Setup.exe` },
    { name: `ConcordVoice-${version}-linux-${arch}.AppImage` },
  ]);
}

test('validateRelease passes when every platform/arch recommended asset is present', () => {
  assert.equal(validateRelease({ assets: fullAssets('0.2.0') }, '0.2.0'), true);
});

test('validateRelease fails when the macOS dmg is missing (mirror lag)', () => {
  const noDmg = { assets: fullAssets('0.2.0').filter((a) => !a.name.endsWith('.dmg')) };
  assert.equal(validateRelease(noDmg, '0.2.0'), false);
});

test('validateRelease fails when a non-macOS platform lags (Windows .exe missing)', () => {
  const noWin = { assets: fullAssets('0.2.0').filter((a) => !a.name.includes('-windows-')) };
  assert.equal(validateRelease(noWin, '0.2.0'), false);
});

test('validateRelease fails when only one arch is mirrored', () => {
  const arm64Only = { assets: fullAssets('0.2.0').filter((a) => a.name.includes('-arm64')) };
  assert.equal(validateRelease(arm64Only, '0.2.0'), false);
});

test('validateRelease fails on empty or missing assets', () => {
  assert.equal(validateRelease({ assets: [] }, '0.2.0'), false);
  assert.equal(validateRelease({}, '0.2.0'), false);
});

test('validateRelease tolerates malformed asset entries (untrusted API JSON)', () => {
  const messy = { assets: [null, 42, { name: null }, ...fullAssets('0.2.0')] };
  assert.equal(validateRelease(messy, '0.2.0'), true);
});

test('shouldFailClosed is enabled for Cloudflare Pages or explicit release builds only', () => {
  assert.equal(shouldFailClosed({}), false);
  assert.equal(shouldFailClosed({ CF_PAGES: '0', CONCORD_RELEASE_RESOLUTION_REQUIRED: 'false' }), false);
  assert.equal(shouldFailClosed({ CF_PAGES: '1' }), true);
  assert.equal(shouldFailClosed({ CONCORD_RELEASE_RESOLUTION_REQUIRED: 'true' }), true);
});
