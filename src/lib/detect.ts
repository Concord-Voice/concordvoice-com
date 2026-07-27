import type { OsId, ArchId } from '../data/downloads';

export interface DetectResult {
  os: OsId | null;   // null => unsupported (mobile / unknown)
  arch: ArchId;      // best guess; spec defaults applied
  supported: boolean;
}

/** Minimal navigator shape we read : kept tiny so the function is pure + testable. */
export interface NavLike {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
  uaArch?: string;     // navigator.userAgentData high-entropy "architecture" (e.g. 'arm', 'x86')
  uaPlatform?: string; // navigator.userAgentData "platform" (e.g. 'macOS', 'Windows', 'Linux', 'Android')
}

/**
 * Classify the visitor's OS + architecture. Pure + synchronous: any async high-entropy
 * client hint is resolved by the caller and passed in via uaArch / uaPlatform.
 *
 * Rules (design 2026-06-20):
 *  - macOS: default arm64 (Apple Silicon) when arch is unknowable.
 *  - Windows: default x64 unless hints / UA token say ARM64.
 *  - Linux (non-Android): default x64 unless aarch64 / arm64 present.
 *  - iOS / iPadOS / Android / ChromeOS / unknown: unsupported (desktop only).
 */
export function pickTarget(nav: NavLike): DetectResult {
  const ua = (nav.userAgent ?? '').toLowerCase();
  const plat = (nav.platform ?? '').toLowerCase();
  const hintPlat = (nav.uaPlatform ?? '').toLowerCase();
  const hintArch = (nav.uaArch ?? '').toLowerCase();
  const unsupported: DetectResult = { os: null, arch: 'x64', supported: false };

  const isAndroid = hintPlat === 'android' || /android/.test(ua);
  // iPadOS 13+ reports a Mac UA; the touch points give it away (no Mac has a touchscreen).
  const isIpadOS = /mac/.test(ua) && (nav.maxTouchPoints ?? 0) > 1;
  const isIOS = /iphone|ipad|ipod/.test(ua) || isIpadOS;
  const isChromeOS = hintPlat === 'chrome os' || /cros/.test(ua);
  if (isAndroid || isIOS || isChromeOS) return unsupported;

  const archFromHint = (): ArchId | null => {
    if (!hintArch) return null;
    if (hintArch.includes('arm')) return 'arm64';
    if (hintArch.includes('x86') || hintArch.includes('x64') || hintArch.includes('amd')) return 'x64';
    return null;
  };

  if (hintPlat === 'macos' || /mac/.test(ua) || /mac/.test(plat)) {
    return { os: 'mac', arch: archFromHint() ?? 'arm64', supported: true };
  }
  // Match anchored Windows tokens (UA "windows nt…", navigator.platform "win32"/"win64")
  // rather than a bare "win", so a stray substring (e.g. "darwin") can't be misread as
  // Windows before the Linux branch is reached.
  if (hintPlat === 'windows' || /windows|win32|win64/.test(ua) || /windows|win32|win64/.test(plat)) {
    // Best-effort: Windows-on-ARM browsers often report "Win64; x64" with no arm token, so
    // the UA-only fallback can under-detect ARM : the high-entropy hint (uaArch) is the
    // reliable signal and takes precedence here.
    const arch = archFromHint() ?? (/arm64|aarch64/.test(ua) ? 'arm64' : 'x64');
    return { os: 'windows', arch, supported: true };
  }
  if (hintPlat === 'linux' || /linux/.test(ua) || /linux/.test(plat)) {
    const arch = archFromHint() ?? (/aarch64|arm64/.test(ua) ? 'arm64' : 'x64');
    return { os: 'linux', arch, supported: true };
  }
  return unsupported;
}
