import assert from 'node:assert/strict';
import { test } from 'node:test';
import { flowSelectionState, nextFlowIndex } from './flow-tabs.ts';

test('architecture tabs wrap and honor Home and End', () => {
  assert.equal(nextFlowIndex(0, 4, 'ArrowLeft'), 3);
  assert.equal(nextFlowIndex(3, 4, 'ArrowRight'), 0);
  assert.equal(nextFlowIndex(2, 4, 'Home'), 0);
  assert.equal(nextFlowIndex(1, 4, 'End'), 3);
});

test('architecture tabs expose one selected, focusable panel', () => {
  const states = ['messages', 'calls', 'keys'].map((id) => flowSelectionState(id, 'calls'));
  assert.deepEqual(states, [
    { selected: false, tabIndex: -1, hidden: true },
    { selected: true, tabIndex: 0, hidden: false },
    { selected: false, tabIndex: -1, hidden: true },
  ]);
});
