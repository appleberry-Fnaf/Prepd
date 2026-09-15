export interface Tier {
  name: string;
  min: number;
  color: string;
  text: string;
}

export const TIERS: Tier[] = [
  { name: 'Bronze', min: 0, color: 'bg-amber-700/15', text: 'text-amber-800' },
  { name: 'Silver', min: 100, color: 'bg-taupe-300/50', text: 'text-taupe-700' },
  { name: 'Gold', min: 300, color: 'bg-amber-400/25', text: 'text-amber-700' },
  { name: 'Platinum', min: 600, color: 'bg-teal-400/20', text: 'text-teal-700' },
  { name: 'Diamond', min: 1000, color: 'bg-blue-400/20', text: 'text-blue-700' },
];

export function getTier(points: number): Tier {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (points >= tier.min) current = tier;
  }
  return current;
}

export function getNextTier(points: number): Tier | null {
  return TIERS.find(t => t.min > points) || null;
}

export function tierProgress(points: number): number {
  const current = getTier(points);
  const next = getNextTier(points);
  if (!next) return 100;
  const span = next.min - current.min;
  if (span <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round(((points - current.min) / span) * 100)));
}
