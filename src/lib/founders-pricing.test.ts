import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cents, foundersOffer, foundersPrice, foundersTerms, money, selectedPrice, updateFoundersPrice } from './founders-pricing.ts';

test('founders terms preserve the signup deadline and 28-day payment recovery protection', () => {
  assert.equal(foundersOffer.signupDeadline, 'July 1, 2027');
  assert.match(foundersTerms.priceLock, /price is locked forever/);
  assert.match(foundersTerms.grace, /28-day grace period to resolve it and keep your price lock/);
  assert.match(foundersTerms.ends, /failed payment remains unresolved after the grace period/);
  assert.match(foundersTerms.ends, /cancel/);
  assert.match(foundersTerms.ends, /deleted or banned/);
});

test('founders prices use the same whole-cent rounding as the billing catalog', () => {
  assert.equal(foundersPrice(899), 449);
  assert.equal(foundersPrice(9889), 4944);
  assert.equal(foundersPrice(1499), 749);
  assert.equal(foundersPrice(16489), 8244);
  assert.equal(money(foundersPrice(cents(8.99))), '$4.49');
  assert.equal(money(foundersPrice(115489)), '$577.44');
  assert.equal(foundersPrice(0), 0);
});

test('billing and Mach selections derive both prices from the original amounts', () => {
  assert.deepEqual(selectedPrice(2199, 24189, -1000, -11000, false), { regular: 1199, founders: 599, period: '/month' });
  assert.deepEqual(selectedPrice(2199, 24189, 2000, 22000, true), { regular: 46189, founders: 23094, period: '/year' });
  assert.deepEqual(selectedPrice(0, 0, 0, 0, true), { regular: 0, founders: 0, period: '' });
});

test('switching Wing to a pending add-on and back updates price, period, members, and availability together', () => {
  const elements = Object.fromEntries(['[data-regular]', '[data-founders]', '[data-per-member]', '[data-availability]'].map(key => [key, { textContent: '' }]));
  const periods = [{ textContent: '' }, { textContent: '' }];
  const price = {
    dataset: { monthly: '1499', yearly: '16489', members: '2', pending: 'false', monthlyAdjustment: '1499', yearlyAdjustment: '16489' },
    querySelector: (key: string) => elements[key],
    querySelectorAll: () => periods,
  };
  updateFoundersPrice(price as unknown as HTMLElement, true);
  assert.equal(elements['[data-regular]'].textContent, '$329.78');
  assert.equal(elements['[data-founders]'].textContent, '$164.89');
  assert.equal(elements['[data-availability]'].textContent, 'Coming later · non-final estimate');
  assert.equal(elements['[data-per-member]'].textContent, 'About $82.45/year per member at 2 members');
  assert.ok(periods.every(period => period.textContent === '/year'));
  price.dataset.monthlyAdjustment = '0';
  price.dataset.yearlyAdjustment = '0';
  updateFoundersPrice(price as unknown as HTMLElement, false);
  assert.equal(elements['[data-founders]'].textContent, '$7.49');
  assert.equal(elements['[data-regular]'].textContent, '$14.99');
  assert.equal(elements['[data-availability]'].textContent, 'Available now');
  assert.ok(periods.every(period => period.textContent === '/month'));
});
