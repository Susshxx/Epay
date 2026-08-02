import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, LockIcon, PlusIcon } from 'lucide-react';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { addActivityLogEntry, subscribeToAdminNotifications, subscribeToFunding, subscribeToSpent } from '../services/fundingService';
import { requestNotificationPermission, showPaymentNotification } from '../utils/notifications';
import { PendingPaymentsPanel } from '../components/PendingPaymentsPanel';
import type { AdminNotification } from '../types/epay';

const ADMIN_PASSWORD = 'epaygar';

export function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const logs = useActivityLogs();

  // Funding balance state
  const [earned, setEarned] = useState(0);
  const [spent, setSpent] = useState(0);

  // Admin notifications hook (inline to avoid module issues)
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  useEffect(() => {
    return subscribeToAdminNotifications(setNotifications);
  }, []);

  // Subscribe to funding updates
  useEffect(() => {
    return subscribeToFunding(setEarned);
  }, []);

  // Subscribe to spent updates
  useEffect(() => {
    return subscribeToSpent(setSpent);
  }, []);
  
  const previousNotificationCount = useRef(0);
  
  const [amount, setAmount] = useState('');
  const [detail, setDetail] = useState('');
  const [isSpent, setIsSpent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already authenticated in session storage
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    setIsAuthenticated(isAuth);
    
    if (isAuth) {
      // Request notification permission when admin logs in
      requestNotificationPermission();
    }
  }, []);

  // Show browser notification for new payments
  useEffect(() => {
    if (!isAuthenticated || notifications.length === 0) {
      previousNotificationCount.current = notifications.length;
      return;
    }

    // If we have new notifications (count increased)
    if (notifications.length > previousNotificationCount.current) {
      const newNotification = notifications[0]; // Most recent one
      showPaymentNotification(
        newNotification.amount,
        newNotification.donorName,
        newNotification.message
      );
    }

    previousNotificationCount.current = notifications.length;
  }, [notifications, isAuthenticated]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setPasswordError('');
      setPasswordInput('');
      // Navigate to admin page to ensure URL is correct
      navigate('/admin');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedAmount = amount.trim();
    const trimmedDetail = detail.trim();

    if (!trimmedAmount || !trimmedDetail) {
      setError('Please fill in both the amount and the description.');
      return;
    }

    // Validate amount is a number
    const numericAmount = parseInt(trimmedAmount, 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive number for the amount.');
      return;
    }

    // Validate spent amount doesn't exceed earned balance
    if (isSpent && numericAmount > earned) {
      setError(`Cannot spend more than earned balance (Rs ${earned}).`);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const formattedAmount = `Rs ${trimmedAmount}`;
      await addActivityLogEntry(formattedAmount, trimmedDetail, isSpent);
      setAmount('');
      setDetail('');
    } catch (submitError) {
      setError('Something went wrong while saving that entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-canvas px-6 py-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center gap-6 rounded-[8px] border border-black bg-white p-8 shadow-[3px_4px_4px_rgba(0,0,0,0.15)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint">
              <LockIcon className="h-8 w-8 text-black" />
            </div>
            
            <div className="text-center">
              <h1 className="font-didot text-3xl text-black">Admin Access</h1>
              <p className="mt-2 font-jeju text-base text-black/60">
                Enter password to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="font-jeju text-lg text-black">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full rounded-[6px] border border-black bg-[#F5F5F5] px-4 py-3 font-jeju text-base text-black outline-none focus-visible:ring-2 focus-visible:ring-mint"
                  autoFocus
                />
              </div>

              {passwordError && (
                <p role="alert" className="font-jeju text-sm text-[#882B2B]">
                  {passwordError}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-[5px] border border-black bg-mint py-3 font-jeju text-xl text-black transition-transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
                Login
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Admin dashboard (authenticated)
  const availableBalance = earned;
  const totalBalance = earned + spent;

  return (
    <main className="min-h-screen w-full bg-canvas px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-jeju text-sm uppercase tracking-wide text-black/60">
                Internal tool - not linked from the public site
              </p>
              <h1 className="font-didot text-3xl text-black sm:text-4xl">Admin - Activity Logs</h1>
            </div>
            
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-[5px] border border-black bg-white px-4 py-2 font-jeju text-base text-black transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
              Logout
            </button>
          </div>

          {/* Balance Display */}
          <div className="rounded-[8px] border border-black bg-[#EAE8E8]/50 p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-jeju text-lg font-bold text-black">Total Balance:</span>
                <span className="font-jeju text-lg font-bold text-black">Rs {totalBalance}</span>
              </div>
              <div className="flex items-center justify-between border-t border-black/20 pt-2">
                <span className="font-jeju text-base text-black">Spent:</span>
                <span className="font-jeju text-base text-[#B3261E]">Rs {spent}</span>
              </div>
              <div className="flex items-center justify-between border-t border-black/20 pt-2">
                <span className="font-jeju text-base text-black">Available Balance (Earned):</span>
                <span className="font-jeju text-base text-[#2E7D32]">Rs {availableBalance}</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="rounded-[8px] border border-forest bg-forest/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-forest" />
                <h2 className="font-jeju text-lg text-forest">
                  Recent Payments ({notifications.length})
                </h2>
              </div>
              <ul className="flex flex-col gap-2">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="rounded-[6px] border border-forest/30 bg-white p-3">
                    <p className="font-jeju text-base text-black">
                      <span className="font-bold text-forest">Rs {notification.amount}</span>
                      {' '}received from{' '}
                      <span className="font-bold">{notification.donorName}</span>
                    </p>
                    {notification.message && (
                      <p className="mt-1 font-jeju text-sm text-black/70">
                        "{notification.message}"
                      </p>
                    )}
                    <p className="mt-1 font-jeju text-xs text-black/50">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {/* Pending Payments Section */}
        <PendingPaymentsPanel />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-[8px] border border-black bg-[#F5F5F5] p-6 shadow-[3px_4px_4px_rgba(0,0,0,0.15)]">
          
          <label className="flex flex-col gap-2">
            <span className="font-jeju text-lg text-black">Amount</span>
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g. 500"
              min="1"
              className="w-full rounded-[6px] border border-black bg-white px-4 py-3 font-jeju text-base text-black outline-none focus-visible:ring-2 focus-visible:ring-mint" />

          </label>

          <label className="flex flex-col gap-2">
            <span className="font-jeju text-lg text-black">Description</span>
            <input
              type="text"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="e.g. Spent Rs. 500 on stickers"
              className="w-full rounded-[6px] border border-black bg-white px-4 py-3 font-jeju text-base text-black outline-none focus-visible:ring-2 focus-visible:ring-mint" />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-jeju text-lg text-black">Entry Type</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="entryType"
                  checked={isSpent}
                  onChange={() => setIsSpent(true)}
                  className="h-4 w-4 accent-mint"
                />
                <span className="font-jeju text-base text-black">Spent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="entryType"
                  checked={!isSpent}
                  onChange={() => setIsSpent(false)}
                  className="h-4 w-4 accent-mint"
                />
                <span className="font-jeju text-base text-black">Earned</span>
              </label>
            </div>
          </label>

          {error &&
          <p role="alert" className="font-jeju text-sm text-[#882B2B]">
              {error}
            </p>
          }

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-[5px] border border-black bg-mint py-3 font-jeju text-xl text-black transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
            
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            {isSubmitting ? 'Adding…' : 'Add Log Entry'}
          </button>
        </form>

        <section aria-labelledby="existing-logs-heading" className="flex flex-col gap-3">
          <h2 id="existing-logs-heading" className="font-jeju text-xl text-black">
            Current Logs
          </h2>
          <ul className="flex flex-col gap-2">
            {logs.map((log) =>
            <li
              key={log.id}
              className="flex items-center justify-between gap-4 rounded-[6px] border border-black bg-white px-4 py-3">
              
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-jeju text-base text-black">{log.detail}</span>
                    {log.isSpent !== undefined && (
                      <span className={`font-jeju text-xs px-2 py-0.5 rounded ${log.isSpent ? 'bg-[#B3261E]/10 text-[#B3261E]' : 'bg-[#2E7D32]/10 text-[#2E7D32]'}`}>
                        {log.isSpent ? 'Spent' : 'Earned'}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`shrink-0 font-jeju text-base ${log.isSpent ? 'text-[#B3261E]' : 'text-[#2E7D32]'}`}>
                  {log.amount}
                </span>
              </li>
            )}
          </ul>
        </section>
      </div>
    </main>);

}