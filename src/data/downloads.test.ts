import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assetUrl, recommendedBuild, platform, VERSION, RELEASE_TAG, MIRROR_REPO, RELEASE_NOTES_URL } from './downloads.ts';

test('version + tag constants are wired', () => {
  assert.equal(VERSION, '0.2.0');
  assert.equal(RELEASE_TAG, 'desktop-v0.2.0');
  assert.equal(MIRROR_REPO, 'Concord-Voice/Concord-Voice');
});

test('release notes URL points at the public mirror tag', () => {
  assert.equal(
    RELEASE_NOTES_URL,
    'https://github.com/Concord-Voice/Concord-Voice/releases/tag/desktop-v0.2.0',
  );
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
