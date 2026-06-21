import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickTarget } from './detect.ts';

test('Chromium high-entropy: Apple Silicon Mac', () => {
  assert.deepEqual(pickTarget({ uaPlatform: 'macOS', uaArch: 'arm' }), { os: 'mac', arch: 'arm64', supported: true });
});

test('Chromium high-entropy: Intel Mac', () => {
  assert.deepEqual(pickTarget({ uaPlatform: 'macOS', uaArch: 'x86' }), { os: 'mac', arch: 'x64', supported: true });
});

test('Safari Mac (no hints) defaults to Apple Silicon', () => {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
  assert.deepEqual(pickTarget({ userAgent: ua, platform: 'MacIntel', maxTouchPoints: 0 }), { os: 'mac', arch: 'arm64', supported: true });
});

test('Windows x64 via hints', () => {
  assert.deepEqual(pickTarget({ uaPlatform: 'Windows', uaArch: 'x86' }), { os: 'windows', arch: 'x64', supported: true });
});

test('Windows on ARM via hints', () => {
  assert.deepEqual(pickTarget({ uaPlatform: 'Windows', uaArch: 'arm' }), { os: 'windows', arch: 'arm64', supported: true });
});

test('Windows (no hints) defaults to x64', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: 'windows', arch: 'x64', supported: true });
});

test('Windows on ARM detected from UA token when no hints', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; ARM64) AppleWebKit/537.36 (KHTML, like Gecko)';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: 'windows', arch: 'arm64', supported: true });
});

test('Linux x86_64', () => {
  const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: 'linux', arch: 'x64', supported: true });
});

test('Linux aarch64', () => {
  const ua = 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko)';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: 'linux', arch: 'arm64', supported: true });
});

test('Android is unsupported (not classified as Linux)', () => {
  const ua = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: null, arch: 'x64', supported: false });
});

test('iPhone is unsupported', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: null, arch: 'x64', supported: false });
});

test('iPadOS 13+ (poses as Mac, has touch) is unsupported', () => {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
  assert.deepEqual(pickTarget({ userAgent: ua, platform: 'MacIntel', maxTouchPoints: 5 }), { os: null, arch: 'x64', supported: false });
});

test('ChromeOS is unsupported', () => {
  const ua = 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko)';
  assert.deepEqual(pickTarget({ userAgent: ua }), { os: null, arch: 'x64', supported: false });
});

test('empty/unknown navigator is unsupported', () => {
  assert.deepEqual(pickTarget({}), { os: null, arch: 'x64', supported: false });
});
