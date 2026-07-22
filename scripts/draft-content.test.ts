import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const preservedDrafts = [
  'src/pages/drafts/enterprise-msp.astro',
  'src/pages/drafts/blog/_posts/building-a-community-policy.md',
  'src/pages/drafts/blog/_posts/how-do-we-make-money.md',
  'src/pages/drafts/blog/_posts/n-sfw.md',
  'src/pages/drafts/blog/_posts/putting-our-money-where-our-mouth-is.md',
  'src/pages/drafts/blog/_posts/understanding-how-concord-voice-works.md',
  'src/pages/drafts/blog/_posts/why-is-end-to-end-encryption-important.md',
];

const publishedPosts = [
  'src/pages/blog/_posts/are-we-vibe-coded.md',
  'src/pages/blog/_posts/proving-youre-old-enough-without-proving-who-you-are.md',
  'src/pages/blog/_posts/oh-no-not-another-discord-clone.md',
];

function isGitIgnored(path: string) {
  const result = spawnSync('git', ['check-ignore', '--no-index', '--quiet', path]);
  assert.ok(result.status === 0 || result.status === 1, result.stderr.toString());
  return result.status === 0;
}

test('draft source is preserved in git', () => {
  for (const path of preservedDrafts) {
    assert.equal(existsSync(path), true, `${path} should exist`);
    assert.equal(isGitIgnored(path), false, `${path} should not be ignored`);
  }
});

test('the published blog contains only the Kickstarter release posts', () => {
  for (const path of publishedPosts) {
    assert.equal(existsSync(path), true, path + ' should exist');
    assert.equal(isGitIgnored(path), false, path + ' should not be ignored');
  }
});

test('unlisted local draft pages remain ignored', () => {
  assert.equal(isGitIgnored('src/pages/drafts/local-scratch.astro'), true);
});
