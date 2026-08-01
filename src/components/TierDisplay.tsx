import type { Tier } from '../types/epay';

type TierDisplayProps = {
  tiers: Tier[];
  currentTier: Tier;
};

export function TierDisplay({ tiers, currentTier }: TierDisplayProps) {
  const currentIndex = tiers.findIndex((t) => t.level === currentTier.level);
  const previousTier = currentIndex > 0 ? tiers[currentIndex - 1] : null;
  const upcomingTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;

  const renderTier = (tier: Tier | null, isCurrent: boolean) => {
    if (!tier) {
      return <div className="w-20 h-20 flex-shrink-0" />; // Placeholder for spacing
    }

    return (
      <div
        className={`flex flex-col items-center gap-2 flex-shrink-0 ${
          isCurrent ? 'opacity-100 scale-110' : 'opacity-50 scale-90'
        } transition-all duration-300`}
      >
        <img
          src={tier.image}
          alt={tier.name}
          width={80}
          height={80}
          className={`w-16 h-16 object-contain ${
            isCurrent ? 'ring-4 ring-mint ring-offset-2' : ''
          }`}
        />
        <div className="text-center">
          <p className={`font-jeju text-xs ${isCurrent ? 'font-bold text-black' : 'text-black/60'}`}>
            {tier.name}
          </p>
          <p className={`font-jeju text-[10px] ${isCurrent ? 'text-black' : 'text-black/40'}`}>
            Rs {tier.goal.toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center gap-4 py-2">
      {renderTier(previousTier, false)}
      {renderTier(currentTier, true)}
      {renderTier(upcomingTier, false)}
    </div>
  );
}
