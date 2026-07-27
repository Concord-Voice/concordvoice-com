import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const pricingPage = readFileSync('src/pages/pricing.astro', 'utf8');

test('pricing starfield decelerates through 500px after the download CTA enters', () => {
  assert.match(pricingPage, /prefers-reduced-motion: reduce/);
  assert.match(pricingPage, /document\.querySelector\('#hypersonic'\)/);
  assert.match(pricingPage, /document\.querySelector\('#wing'\)/);
  assert.match(pricingPage, /hypersonic\.getBoundingClientRect\(\)\.bottom \+ window\.scrollY - viewport/);
  assert.match(pricingPage, /wingHeading \? wingHeading\.getBoundingClientRect\(\)\.bottom \+ window\.scrollY : hypersonicAt/);
  assert.match(pricingPage, /length: 42/);
  assert.match(pricingPage, /Math\.random\(\)/);
  assert.match(pricingPage, /const peakSpeed = width \/ 1\.65/);
  assert.match(pricingPage, /visibleStars = 9 \+ intensity \* 33/);
  assert.match(pricingPage, /linear-gradient\(to right, var\(--color-paper\) 0 2px/);
  assert.match(pricingPage, /star\.style\.height = '1px'/);
  assert.match(pricingPage, /document\.querySelector\('\.mkt-cta \.btn'\)/);
  assert.match(pricingPage, /const wingHeaderAt/);
  assert.match(pricingPage, /const stopAt = downloadAt \+ 500/);
  assert.match(pricingPage, /atmosphere = window\.scrollY >= stopAt/);
  assert.match(pricingPage, /targetIntensity = Math\.max\(0, 1 - \(window\.scrollY - wingHeaderAt\) \/ \(stopAt - wingHeaderAt\)\)/);
  assert.match(pricingPage, /const frameInterval = 1000 \/ 45/);
  assert.match(pricingPage, /if \(now - last < frameInterval\) return/);
  assert.match(pricingPage, /targetIntensity = 1/);
  assert.match(pricingPage, /requestAnimationFrame\(animateStarfield\)/);
  assert.match(pricingPage, /star\.style\.width = `\$\{tailLength\}px`/);
  assert.match(pricingPage, /<summary class="faq__q">So, why offer subscriptions\?<\/summary>/);
});
