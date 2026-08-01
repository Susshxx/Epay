import { useDonorLogs } from '../hooks/useDonorLogs';

/**
 * A plain-flow, responsive version of the leaderboard for small screens.
 * The desktop LeaderboardCard overlays exact pixel positions on a fixed
 * background image, which doesn't reflow well on phones/tablets.
 */
export function LeaderboardTable() {
  const leaderboard = useDonorLogs();

  return (
    <section
      aria-labelledby="leaderboard-heading-mobile"
      className="mx-auto w-full max-w-[420px] rounded-[8px] border border-black bg-[#FDFBF3] p-4 shadow-[3px_4px_4px_rgba(0,0,0,0.15)] sm:p-5">
      
      <h2
        id="leaderboard-heading-mobile"
        className="mb-3 text-center font-jeju text-lg leading-5 text-black sm:text-xl">
        
        Leaderboard
      </h2>
      {leaderboard.length === 0 ? (
        <div className="flex h-[120px] items-center justify-center">
          <p className="font-jeju text-lg leading-6 text-black/50">No donors yet</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {leaderboard.map((entry) =>
          <li
            key={entry.rank}
            className="flex items-center gap-3 border-t border-black/20 pt-3 first:border-t-0 first:pt-0">
            
              <span className="w-5 shrink-0 font-jeju text-xl font-bold leading-6 text-black">
                {entry.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-jeju text-sm leading-4 text-black">{entry.name}</p>
                <p className="truncate font-jeju text-xs leading-4 text-black/70">
                  {entry.message}
                </p>
              </div>
              <span className="shrink-0 font-jeju text-xs leading-4 text-black">
                {entry.amount}
              </span>
            </li>
          )}
        </ul>
      )}
    </section>);

}