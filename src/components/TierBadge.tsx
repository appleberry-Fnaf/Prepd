import { Award } from 'lucide-react';
import { getTier } from '../lib/rewards';

export default function TierBadge({ points }: { points: number }) {
  const tier = getTier(points);
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${tier.color} ${tier.text}`}>
      <Award className="w-3 h-3" /> {tier.name}
    </span>
  );
}
