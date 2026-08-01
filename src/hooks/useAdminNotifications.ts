import { useEffect, useState } from 'react';
import { subscribeToAdminNotifications } from '../services/fundingService';
import type { AdminNotification } from '../types/epay';

/**
 * Hook to get real-time admin notifications for new payments.
 * Notifications are shown in the admin dashboard.
 */
export function useAdminNotifications(): AdminNotification[] {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => subscribeToAdminNotifications(setNotifications), []);

  return notifications;
}
