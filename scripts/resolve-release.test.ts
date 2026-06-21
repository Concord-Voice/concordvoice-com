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

test('tagToVersion rejects pre-release / 4-part tags (page never auto-adopts an RC)', () => {
  assert.equal(tagToVersion('desktop-v0.2.0-rc1'), null);
  assert.equal(tagToVersion('desktop-v0.2.0-beta'), null);
  assert.equal(tagToVersion('desktop-v0.2.0.1'), null);
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

test('validateRelease tolerates malformed asset entries (untrusted API JSON)', () => {
  const messy = { assets: [
    null,
    42,
    { name: null },
    { name: 'ConcordVoice-0.2.0-macos-arm64.dmg' },
    { name: 'ConcordVoice-0.2.0-macos-arm64.zip' },
  ] };
  assert.equal(validateRelease(messy, '0.2.0'), true);
});
