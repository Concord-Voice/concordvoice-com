// Single source of truth for the desktop download links shown on /download.
//
// Per-release update: bump VERSION + RELEASE_TAG below. Asset filenames are derived
// from VERSION + arch via the per-format templates in `fn` (the naming scheme differs
// per format), so nothing else changes unless the mirror alters those schemes. Binaries
// are mirrored from the private Concord-Voice-Alpha repo to the PUBLIC
// Concord-Voice/Concord-Voice repo, whose release assets download anonymously.

export const VERSION = '0.2.0';
export const RELEASE_TAG = 'desktop-v0.2.0';
export const MIRROR_REPO = 'Concord-Voice/Concord-Voice';

export const RELEASE_NOTES_URL = `https://github.com/${MIRROR_REPO}/releases/tag/${RELEASE_TAG}`;

/** Absolute download URL for a release asset on the public mirror. */
export function assetUrl(filename: string): string {
  return `https://github.com/${MIRROR_REPO}/releases/download/${RELEASE_TAG}/${filename}`;
}

export type OsId = 'mac' | 'windows' | 'linux';
export type ArchId = 'arm64' | 'x64';
export type FormatKind = 'dmg' | 'zip' | 'exe' | 'AppImage' | 'deb' | 'rpm';

export interface Build {
  kind: FormatKind;
  label: string;     // short format label, e.g. ".AppImage · universal"
  filename: string;
  url: string;
  recommended: boolean; // the lead format for this arch
}

export interface Arch {
  id: ArchId;
  label: string;     // "Apple Silicon", "Intel", "ARM64", "x64"
  builds: Build[];
}

export interface Platform {
  id: OsId;
  label: string;     // "macOS", "Windows", "Linux"
  installHint: string;
  arches: Arch[];
}

// Per-format filename templates — encoded individually because the real asset names are
// inconsistent (PascalCase+hyphen for AppImage, kebab+underscore for .deb, kebab+hyphen
// for .rpm).
const fn = {
  macDmg: (a: ArchId) => `ConcordVoice-${VERSION}-macos-${a}.dmg`,
  macZip: (a: ArchId) => `ConcordVoice-${VERSION}-macos-${a}.zip`,
  winExe: (a: ArchId) => `ConcordVoice-${VERSION}-windows-${a}-Setup.exe`,
  appImage: (a: ArchId) => `ConcordVoice-${VERSION}-linux-${a}.AppImage`,
  deb: (a: ArchId) => `concord-voice_${VERSION}_linux-${a}.deb`,
  rpm: (a: ArchId) => `concord-voice-${VERSION}-linux-${a}.rpm`,
};

function build(kind: FormatKind, label: string, filename: string, recommended = false): Build {
  return { kind, label, filename, url: assetUrl(filename), recommended };
}

export const PLATFORMS: Platform[] = [
  {
    id: 'mac',
    // The .dmg is the install download (branded drag-to-Applications). The .zip is kept as
    // an alternate — it is also electron-updater's auto-update artifact. Both are normalized
    // to the same name scheme by the desktop release workflow (…-macos-<arch>.{dmg,zip}).
    label: 'macOS',
    installHint: 'Open the .dmg and drag Concord Voice into your Applications folder.',
    arches: [
      {
        id: 'arm64',
        label: 'Apple Silicon',
        builds: [
          build('dmg', '.dmg · installer', fn.macDmg('arm64'), true),
          build('zip', '.zip', fn.macZip('arm64')),
        ],
      },
      {
        id: 'x64',
        label: 'Intel',
        builds: [
          build('dmg', '.dmg · installer', fn.macDmg('x64'), true),
          build('zip', '.zip', fn.macZip('x64')),
        ],
      },
    ],
  },
  {
    id: 'windows',
    label: 'Windows',
    installHint: 'Run the Setup installer and follow the prompts.',
    arches: [
      { id: 'x64', label: 'x64', builds: [build('exe', 'Installer (.exe)', fn.winExe('x64'), true)] },
      { id: 'arm64', label: 'ARM64', builds: [build('exe', 'Installer (.exe)', fn.winExe('arm64'), true)] },
    ],
  },
  {
    id: 'linux',
    label: 'Linux',
    installHint: 'Make the AppImage executable (chmod +x) and run it, or install the .deb / .rpm with your package manager.',
    arches: [
      {
        id: 'x64',
        label: 'x64',
        builds: [
          build('AppImage', '.AppImage · universal', fn.appImage('x64'), true),
          build('deb', '.deb · Debian/Ubuntu', fn.deb('x64')),
          build('rpm', '.rpm · Fedora/RHEL', fn.rpm('x64')),
        ],
      },
      {
        id: 'arm64',
        label: 'ARM64',
        builds: [
          build('AppImage', '.AppImage · universal', fn.appImage('arm64'), true),
          build('deb', '.deb · Debian/Ubuntu', fn.deb('arm64')),
          build('rpm', '.rpm · Fedora/RHEL', fn.rpm('arm64')),
        ],
      },
    ],
  },
];

/** The platform entry for an OS. */
export function platform(os: OsId): Platform | undefined {
  return PLATFORMS.find((p) => p.id === os);
}

/** The recommended (lead) build for an os/arch, falling back to the first available. */
export function recommendedBuild(os: OsId, arch: ArchId): Build | undefined {
  const p = platform(os);
  const a = p?.arches.find((x) => x.id === arch) ?? p?.arches[0];
  return a?.builds.find((b) => b.recommended) ?? a?.builds[0];
}
