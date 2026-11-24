import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('security.txt contains fields, comments, and blank lines', () => {
  const text = readFileSync(new URL('../public/.well-known/security.txt', import.meta.url), 'utf8');
  const fieldLine = /^[!-9;-~]+: .+$/;
  const invalidLines = text.split(/\r?\n/).flatMap((line, index) =>
    line.trim() === '' || line.startsWith('#') || fieldLine.test(line) ? [] : [index + 1],
  );

  assert.deepEqual(invalidLines, []);
});
