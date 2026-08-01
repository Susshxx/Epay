import { images } from '../data/epay';
import { useDonorLogs } from '../hooks/useDonorLogs';

type LeaderboardCardProps = {
  onViewAll: () => void;
};

export function LeaderboardCard({ onViewAll }: LeaderboardCardProps) {
  const leaderboard = useDonorLogs();

  return (
    <section aria-labelledby="leaderboard-heading" className="relative h-[268px] w-[342px]">
      <img
        src={images.leaderboardPaper}
        alt=""
        aria-hidden="true"
        width={342}
        height={268}
        className="absolute inset-0 h-full w-full" />
      

      <h2
        id="leaderboard-heading"
        className="absolute left-[134px] top-[23px] font-jeju text-sm leading-[14px] text-black">
        
        Leaderboard
      </h2>

      {leaderboard.length === 0 ? (
        <div className="absolute left-[24px] top-[70px] flex h-[140px] w-[296px] items-center justify-center">
          <p className="font-jeju text-base leading-4 text-black/50">No donors yet</p>
        </div>
      ) : (
        <table className="absolute left-[24px] top-[70px] w-[296px] table-fixed border-collapse font-jeju text-black">
          <thead>
            <tr className="text-left align-top">
              <th className="w-[26px] pb-[10px]" scope="col">
                <span className="sr-only">Rank</span>
              </th>
              <th className="w-[54px] pb-[10px] pl-[9px] text-base font-normal leading-4" scope="col">
                Name
              </th>
              <th className="pb-[10px] pl-[9px] text-base font-normal leading-4" scope="col">
                Message
              </th>
              <th className="w-[62px] pb-[10px] pl-[9px] text-base font-normal leading-4" scope="col">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.slice(0, 3).map((entry) =>
            <tr key={entry.rank} className="h-[37px] align-middle">
                <td className="border-t border-black text-2xl leading-6">{entry.rank}</td>
                <td className="border-l border-t border-black pl-[9px] text-base leading-4">
                  {entry.name}
                </td>
                <td className="truncate border-l border-t border-black pl-[9px] text-xs leading-3">
                  {entry.message}
                </td>
                <td className="border-l border-t border-black pl-[9px] text-xs leading-3">
                  {entry.amount}
                </td>
              </tr>
            )}
            <tr className="h-[24px]">
              <td className="border-t border-black" />
              <td className="border-l border-t border-black" />
              <td className="border-l border-t border-black" />
              <td className="border-l border-t border-black" />
            </tr>
          </tbody>
        </table>
      )}
    </section>);

}