import { useEffect, useState } from 'react';
import { activityLogs as seedActivityLogs } from '../data/epay';
import { subscribeToActivityLogs } from '../services/fundingService';
import type { ActivityLog } from '../types/epay';

const seed: ActivityLog[] = seedActivityLogs.map((log) => ({ ...log, createdAt: 0 }));

/** Live activity log feed — updates in real time as new entries are added. */
export function useActivityLogs(): ActivityLog[] {
  const [logs, setLogs] = useState<ActivityLog[]>(seed);

  useEffect(() => subscribeToActivityLogs(setLogs), []);

  return logs;
}