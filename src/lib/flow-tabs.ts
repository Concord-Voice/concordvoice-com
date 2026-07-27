export type FlowNavigationKey = 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End';

export function flowSelectionState(id: string | undefined, selectedId: string) {
  const selected = id === selectedId;
  return { selected, tabIndex: selected ? 0 : -1, hidden: !selected };
}

export function nextFlowIndex(currentIndex: number, total: number, key: FlowNavigationKey): number {
  if (total < 1) return -1;
  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;
  return (currentIndex + (key === 'ArrowRight' ? 1 : -1) + total) % total;
}
