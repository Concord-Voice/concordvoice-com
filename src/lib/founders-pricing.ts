// Amounts use integer USD cents so switching periods or boosts cannot compound rounding.
export const foundersOffer = {
  enabled: true,
  percentOff: 50,
  signupDeadline: 'July 1, 2027',
  failedPaymentGraceDays: 28,
};

export const foundersTerms = {
  priceLock: 'Once you obtain a founders subscription, that price is locked forever while your subscription remains active and your account stays in good standing.',
  grace: `If a payment fails, you have a ${foundersOffer.failedPaymentGraceDays}-day grace period to resolve it and keep your price lock.`,
  ends: 'Your price lock ends if you cancel, a failed payment remains unresolved after the grace period, or your account is deleted or banned.',
};

export const cents = (amount: number) => Math.round(amount * 100);
export const money = (amount: number) => amount === 0 ? '$0' :
  (amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// Match Hosted's catalog.go foundersUnitAmount: round the discounted price down
// to a whole cent. Live-plan catalog and coupon verified; pending prices and
// combined add-on totals are preview estimates, not verified invoice amounts.
export function foundersPrice(regular: number): number {
  return foundersOffer.enabled ? regular - Math.round(regular * foundersOffer.percentOff / 100) : regular;
}

export function selectedPrice(monthly: number, yearly: number, monthlyAdjustment: number, yearlyAdjustment: number, annual: boolean) {
  const regular = annual && yearly > 0 ? yearly + yearlyAdjustment : monthly + monthlyAdjustment;
  return { regular, founders: foundersPrice(regular), period: regular === 0 ? '' : annual && yearly > 0 ? '/year' : '/month' };
}

export function updateFoundersPrice(price: HTMLElement, annual: boolean) {
  const selected = selectedPrice(Number(price.dataset.monthly), Number(price.dataset.yearly),
    Number(price.dataset.monthlyAdjustment || 0), Number(price.dataset.yearlyAdjustment || 0), annual);
  const set = (selector: string, value: string) => {
    const element = price.querySelector<HTMLElement>(selector);
    if (element) element.textContent = value;
  };
  set('[data-regular]', money(selected.regular));
  set('[data-founders]', money(selected.founders));
  price.querySelectorAll<HTMLElement>('[data-period]').forEach(element => { element.textContent = selected.period; });
  const members = Number(price.dataset.members || 0);
  if (members) set('[data-per-member]', `About ${money(Math.round(selected.founders / members))}${selected.period} per member at ${members} members`);
  const status = price.querySelector<HTMLElement>('[data-availability]');
  if (status) status.textContent = price.dataset.pending === 'true' || Number(price.dataset.monthlyAdjustment || 0) !== 0
    ? 'Coming later · non-final estimate' : 'Available now';
}
