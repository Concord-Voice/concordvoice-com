import assert from 'node:assert/strict';
import { test } from 'node:test';
import { machPrices, shouldAnimateStarfield, starfieldState, starfieldTargetIntensity, wingPlanCopy } from './pricing-interactions.ts';

test('pricing starfield ramps, peaks, and stops after the CTA', () => {
  const thresholds = { hypersonicAt: 100, wingHeaderAt: 200, stopAt: 700 };
  assert.equal(starfieldTargetIntensity(0, thresholds), 0.12);
  assert.equal(starfieldTargetIntensity(50, thresholds), 0.56);
  assert.equal(starfieldTargetIntensity(100, thresholds), 1);
  assert.equal(starfieldTargetIntensity(200, thresholds), 1);
  assert.equal(starfieldTargetIntensity(450, thresholds), 0.5);
  assert.equal(starfieldTargetIntensity(700, thresholds), 0);
  assert.deepEqual(starfieldState(700, thresholds), { atmosphere: true, targetIntensity: 0 });
  assert.equal(shouldAnimateStarfield(false, false), true);
  assert.equal(shouldAnimateStarfield(true, false), false);
  assert.equal(shouldAnimateStarfield(false, true), false);
});

test('Wing copy follows the selected Mach boost', () => {
  assert.deepEqual(wingPlanCopy(0), { primaryPlan: 'Supersonic', summaryPlan: 'Supersonic for you', boostCopy: '' });
  assert.deepEqual(wingPlanCopy(4.99), { primaryPlan: 'Hypersonic', summaryPlan: 'Hypersonic for you', boostCopy: ' + a Mach server boost' });
  assert.deepEqual(machPrices(14.99, 164.89, 20, 220), { monthly: 34.99, yearly: 384.89 });
});
