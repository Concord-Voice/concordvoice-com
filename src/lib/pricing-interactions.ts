export interface StarfieldThresholds {
  hypersonicAt: number;
  wingHeaderAt: number;
  stopAt: number;
}

export function starfieldTargetIntensity(scrollY: number, { hypersonicAt, wingHeaderAt, stopAt }: StarfieldThresholds): number {
  if (scrollY < hypersonicAt) return 0.12 + 0.88 * (scrollY / hypersonicAt);
  if (scrollY <= wingHeaderAt) return 1;
  return Math.max(0, 1 - (scrollY - wingHeaderAt) / Math.max(1, stopAt - wingHeaderAt));
}

export function starfieldState(scrollY: number, thresholds: StarfieldThresholds) {
  const atmosphere = scrollY >= thresholds.stopAt;
  return { atmosphere, targetIntensity: starfieldTargetIntensity(scrollY, thresholds) };
}

export function shouldAnimateStarfield(documentHidden: boolean, atmosphere: boolean): boolean {
  return !documentHidden && !atmosphere;
}

export function machPrices(baseMonthly: number, baseYearly: number, monthlyAdjustment: number, yearlyAdjustment: number) {
  return { monthly: baseMonthly + monthlyAdjustment, yearly: baseYearly + yearlyAdjustment };
}

export function wingPlanCopy(monthlyBoost: number) {
  const boosted = monthlyBoost !== 0;
  return {
    primaryPlan: boosted ? 'Hypersonic' : 'Supersonic',
    summaryPlan: boosted ? 'Hypersonic for you' : 'Supersonic for you',
    boostCopy: boosted ? ' + a Mach server boost' : '',
  };
}
