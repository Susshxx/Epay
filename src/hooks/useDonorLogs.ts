import { useEffect, useState } from 'react';
import { subscribeToDonorLogs, type DonorLog } from '../services/fundingService';
import type { LeaderboardEntry } from '../types/epay';

/**
 * Live donor logs feed — updates in real time as new donations are verified.
 * Transforms DonorLog data into LeaderboardEntry format for UI consumption.
 */
export function useDonorLogs(): LeaderboardEntry[] {
  const [donorLogs, setDonorLogs] = useState<DonorLog[]>([]);

  useEffect(() => subscribeToDonorLogs(setDonorLogs), []);

  // Transform DonorLog[] to LeaderboardEntry[] with ranks
  const leaderboard: LeaderboardEntry[] = donorLogs.map((log, index) => ({
    rank: index + 1,
    name: log.donorName,
    message: log.message,
    amount: `Rs ${log.amount}`
  }));

  return leaderboard;
}
