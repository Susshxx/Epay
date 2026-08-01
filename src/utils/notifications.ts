/**
 * Request permission for browser notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show a browser notification for a new payment
 */
export function showPaymentNotification(amount: number, donorName: string, message?: string): void {
  if (Notification.permission !== 'granted') {
    return;
  }

  const title = `New Payment: Rs ${amount}`;
  const body = message 
    ? `${donorName}: "${message}"`
    : `Payment received from ${donorName}`;

  const notification = new Notification(title, {
    body,
    icon: '/308-44.png', // Your logo
    badge: '/308-44.png',
    tag: 'payment-notification',
    requireInteraction: false,
    silent: false
  });

  // Auto-close after 10 seconds
  setTimeout(() => notification.close(), 10000);

  // Optional: Handle click event
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}
