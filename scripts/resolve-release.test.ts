import { test, type TestContext } from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { fileContents, main, shouldFailClosed, tagToVersion, validateRelease } from './resolve-release.mjs';

test('tagToVersion extracts semver from a vX.Y.Z tag', () => {
  assert.equal(tagToVersion('v0.2.0'), '0.2.0');
  assert.equal(tagToVersion('v1.10.3'), '1.10.3');
});

test('tagToVersion rejects non-matching tags', () => {
  assert.equal(tagToVersion('desktop-v0.2.0'), null);
  assert.equal(tagToVersion('vbeta'), null);
  assert.equal(tagToVersion('v0.2'), null);
  assert.equal(tagToVersion(''), null);
  assert.equal(tagToVersion(undefined), null);
});

test('tagToVersion rejects pre-release / 4-part tags (page never auto-adopts an RC)', () => {
  assert.equal(tagToVersion('v0.2.0-rc1'), null);
  assert.equal(tagToVersion('v0.2.0-beta'), null);
  assert.equal(tagToVersion('v0.2.0.1'), null);
});

// Every download link the page advertises, for both arches.
function fullAssets(version: string) {
  return ['arm64', 'x64'].flatMap((arch) => [
    { name: `ConcordVoice-${version}-macos-${arch}.dmg` },
    { name: `ConcordVoice-${version}-macos-${arch}.zip` },
    { name: `ConcordVoice-${version}-windows-${arch}-Setup.exe` },
    { name: `ConcordVoice-${version}-linux-${arch}.AppImage` },
    { name: `concord-voice_${version}_linux-${arch}.deb` },
    { name: `concord-voice-${version}-linux-${arch}.rpm` },
  ]);
}

test('validateRelease passes when every platform/arch advertised asset is present', () => {
  assert.equal(validateRelease({ assets: fullAssets('0.2.0') }, '0.2.0'), true);
});

test('validateRelease fails when the macOS dmg is missing ', () => {
  const noDmg = { assets: fullAssets('0.2.0').filter((a) => !a.name.endsWith('.dmg')) };
  assert.equal(validateRelease(noDmg, '0.2.0'), false);
});

test('validateRelease fails when a non-macOS platform lags (Windows .exe missing)', () => {
  const noWin = { assets: fullAssets('0.2.0').filter((a) => !a.name.includes('-windows-')) };
  assert.equal(validateRelease(noWin, '0.2.0'), false);
});

test('validateRelease fails when Linux package alternates lag (.deb/.rpm missing)', () => {
  const noPackages = {
    assets: fullAssets('0.2.0').filter((a) => !a.name.endsWith('.deb') && !a.name.endsWith('.rpm')),
  };
  assert.equal(validateRelease(noPackages, '0.2.0'), false);
});

test('validateRelease fails when only one arch is published', () => {
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

test('shouldFailClosed is enabled for production Cloudflare Pages or explicit release builds only', () => {
  assert.equal(shouldFailClosed({}), false);
  assert.equal(shouldFailClosed({ CF_PAGES: '0', CONCORD_RELEASE_RESOLUTION_REQUIRED: 'false' }), false);
  assert.equal(shouldFailClosed({ CF_PAGES: '1', CF_PAGES_BRANCH: 'codex/self-hosting-release-state' }), false);
  assert.equal(shouldFailClosed({ CF_PAGES: '1', CF_PAGES_BRANCH: 'main' }), true);
  assert.equal(shouldFailClosed({ CONCORD_RELEASE_RESOLUTION_REQUIRED: 'true' }), true);
});

test('main preserves fail-closed GitHub API status errors', async (t) => {
  const originalFetch = globalThis.fetch;
  const originalRequired = process.env.CONCORD_RELEASE_RESOLUTION_REQUIRED;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalRequired === undefined) delete process.env.CONCORD_RELEASE_RESOLUTION_REQUIRED;
    else process.env.CONCORD_RELEASE_RESOLUTION_REQUIRED = originalRequired;
  });

  globalThis.fetch = async () => new Response('', { status: 503 });
  process.env.CONCORD_RELEASE_RESOLUTION_REQUIRED = 'true';

  await assert.rejects(
    () => main(),
    /\[resolve-release\] GitHub API 503; refusing production build to avoid stale download links/,
  );
});

const rawLogControls = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;
const hostileDiagnostic = 'bad\r\nforged\nrecord\u001b[2J\u0000\t\u007f\u0085\u009b\u2028\u2029end';
const seed = 'committed seed\n';

// Each CLI process has a mocked fetch and its own cwd, because OUT is resolved at
// module load. No test contacts GitHub or writes the repository's generated seed.
function runResolver(t: TestContext, fetchBody: string, mode = 'local', initialSeed: string | null = seed, importOnly = false) {
  const cwd = mkdtempSync(path.join(tmpdir(), 'resolve-release-\n-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const output = path.join(cwd, 'src', 'data', 'release.generated.ts');
  if (initialSeed !== null) {
    mkdirSync(path.dirname(output), { recursive: true });
    writeFileSync(output, initialSeed);
  }
  const moduleUrl = new URL('./resolve-release.mjs', import.meta.url);
  const args = ['--import', `data:text/javascript,${encodeURIComponent(`globalThis.fetch = async () => { ${fetchBody} };`)}`];
  if (importOnly) args.push('--input-type=module', '--eval', `await import(${JSON.stringify(moduleUrl.href)});`);
  else args.push(fileURLToPath(moduleUrl));
  const result = spawnSync(process.execPath, args, {
    cwd,
    encoding: 'utf8',
    timeout: 5_000,
    env: {
      ...process.env,
      NODE_OPTIONS: '',
      GITHUB_TOKEN: '',
      CF_PAGES: mode === 'local' ? '0' : '1',
      CF_PAGES_BRANCH: mode === 'production' ? 'main' : 'preview',
      CONCORD_RELEASE_RESOLUTION_REQUIRED: mode === 'required' ? 'true' : 'false',
    },
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  return { ...result, output };
}

function assertOneDiagnostic(text: string) {
  assert.ok(text.endsWith('\n'), 'console must terminate its record');
  assert.doesNotMatch(text.slice(0, -1), rawLogControls, 'payload must not contain raw log controls');
  assert.match(text, /^\[resolve-release\] /);
}

test('CLI diagnostics escape untrusted tag and exception controls in every build mode', async (t) => {
  const payload = JSON.stringify(hostileDiagnostic);
  const cases = [
    ['tag', `return new Response(JSON.stringify({ tag_name: ${payload} }));`],
    ['fetch Error', `throw new Error(${payload});`],
    ['fetch string', `throw ${payload};`],
    ['JSON parser error', `return { ok: true, json: async () => { throw new SyntaxError(${payload}); } };`],
  ];
  for (const [name, fetchBody] of cases) {
    for (const mode of ['local', 'preview', 'production', 'required']) {
      await t.test(`${name}: ${mode}`, (t) => {
        const result = runResolver(t, fetchBody, mode);
        const failClosed = mode === 'production' || mode === 'required';
        assert.equal(result.status, failClosed ? 1 : 0);
        assert.equal(result.stdout, '');
        assertOneDiagnostic(result.stderr);
        for (const control of ['000d', '000a', '001b', '0000', '0009', '007f', '0085', '009b', '2028', '2029']) {
          assert.ok(result.stderr.includes(`\\u${control}`), `missing escaped control ${control}`);
        }
        assert.ok(result.stderr.includes(failClosed ? 'refusing production build' : 'keeping committed seed'));
        assert.equal(readFileSync(result.output, 'utf8'), seed);
      });
    }
  }
});

test('imported main rejects with log-safe production diagnostics', async (t) => {
  const originalFetch = globalThis.fetch;
  const originalRequired = process.env.CONCORD_RELEASE_RESOLUTION_REQUIRED;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalRequired === undefined) delete process.env.CONCORD_RELEASE_RESOLUTION_REQUIRED;
    else process.env.CONCORD_RELEASE_RESOLUTION_REQUIRED = originalRequired;
  });
  process.env.CONCORD_RELEASE_RESOLUTION_REQUIRED = 'true';
  globalThis.fetch = async () => { throw new Error(hostileDiagnostic); };
  await assert.rejects(main, (err: Error) => {
    assert.doesNotMatch(err.message, rawLogControls);
    assert.match(err.message, /fetch failed/);
    assert.ok(err.message.includes('\\u000d\\u000a'));
    return true;
  });
});

test('CLI escapes unexpected filesystem errors and preserves exit behavior', async (t) => {
  const release = JSON.stringify({ tag_name: 'v1.2.3', assets: fullAssets('1.2.3') });
  for (const mode of ['local', 'production']) {
    await t.test(mode, (t) => {
      // Missing output parent forces a real filesystem error containing the cwd's LF.
      const result = runResolver(t, `return new Response(${JSON.stringify(release)});`, mode, null);
      assert.equal(result.status, mode === 'production' ? 1 : 0);
      assertOneDiagnostic(result.stderr);
      assert.match(result.stderr, /unexpected error .*ENOENT/);
      assert.ok(result.stderr.includes('\\u000a'));
    });
  }
});

test('CLI retains ordinary failure reasons and preserves the seed', async (t) => {
  const cases = [
    ['HTTP', "return new Response('', { status: 503 });", 'GitHub API 503'],
    ['invalid JSON', "return new Response('{');", 'GitHub API JSON parse failed'],
    ['missing assets', "return new Response(JSON.stringify({ tag_name: 'v1.2.3', assets: [] }));", 'missing expected platform assets'],
  ];
  for (const [name, fetchBody, reason] of cases) {
    await t.test(name, (t) => {
      const result = runResolver(t, fetchBody);
      assert.equal(result.status, 0);
      assertOneDiagnostic(result.stderr);
      assert.ok(result.stderr.includes(reason));
      assert.equal(readFileSync(result.output, 'utf8'), seed);
    });
  }
});

test('CLI writes the expected release and recognizes an unchanged seed', async (t) => {
  const release = JSON.stringify({ tag_name: 'v1.2.3', assets: fullAssets('1.2.3') });
  const expected = fileContents('1.2.3', 'v1.2.3');
  for (const [initial, message] of [[seed, 'updated to'], [expected, 'up to date at']]) {
    await t.test(message, (t) => {
      const result = runResolver(t, `return new Response(${JSON.stringify(release)});`, 'production', initial);
      assert.equal(result.status, 0);
      assert.equal(result.stderr, '');
      assert.equal(result.stdout, `[resolve-release] ${message} v1.2.3\n`);
      assert.equal(readFileSync(result.output, 'utf8'), expected);
    });
  }
});

test('importing the resolver does not invoke fetch or change the seed', (t) => {
  const result = runResolver(t, "throw new Error('import must not fetch');", 'production', seed, true);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
  assert.equal(readFileSync(result.output, 'utf8'), seed);
});
