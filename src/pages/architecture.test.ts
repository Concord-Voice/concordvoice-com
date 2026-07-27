import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const architecturePage = readFileSync('src/pages/architecture.astro', 'utf8');

test('architecture page keeps all interactive flow views and keyboard tab navigation', () => {
  for (const id of ['sign-in', 'messages', 'calls', 'keys']) {
    assert.match(architecturePage, new RegExp(`data-flow-tab=\\{flow.id\\}|data-flow-tab=\"${id}\"`));
    assert.match(architecturePage, new RegExp(`id: '${id}'`));
  }
  assert.match(architecturePage, /role="tablist"/);
  assert.match(architecturePage, /\['ArrowLeft', 'ArrowRight', 'Home', 'End'\]/);
  assert.match(architecturePage, /panel\.hidden = panel\.dataset\.flowPanel !== id/);
});
