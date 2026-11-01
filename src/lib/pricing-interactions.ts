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
