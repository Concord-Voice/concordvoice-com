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
