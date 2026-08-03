import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch } from
'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { activityLogs as seedActivityLogs } from '../data/epay';
import type { ActivityLog, AdminNotification, PendingPayment } from '../types/epay';

const STARTING_EARNED = 0;
const FUNDING_COLLECTION = 'funding';
const FUNDING_DOC_ID = 'stats';
const ACTIVITY_COLLECTION = 'activityLogs';
const NOTIFICATIONS_COLLECTION = 'adminNotifications';
const PENDING_PAYMENTS_COLLECTION = 'pendingPayments';
// Permanent, un-windowed record of every verified donor — distinct from
// adminNotifications, which only surfaces the last 24 hours for the admin
// bell/toast UI and isn't meant to double as a historical log.
const DONOR_LOGS_COLLECTION = 'donorLogs';
const ACTIVITY_LIMIT = 20;
const NOTIFICATIONS_LIMIT = 10;
const DONOR_LOGS_LIMIT = 50;

type Listener<T> = (value: T) => void;

export type DonorLog = {
  id: string;
  donorName: string;
  amount: number;
  message: string;
  createdAt: number;
};

// --- Local fallback "backend" -------------------------------------------
// Used whenever Firebase isn't configured yet (see lib/firebase.ts), so the
// donation → verification → live-update flow keeps working end to end
// without real credentials. Swaps over to Firestore transparently once the
// user adds their project config.
let localEarned = STARTING_EARNED;
const fundingListeners = new Set<Listener<number>>();

let localActivity: ActivityLog[] = seedActivityLogs.map((log) => ({ ...log, createdAt: 0 }));
const activityListeners = new Set<Listener<ActivityLog[]>>();

let localNotifications: AdminNotification[] = [];
const notificationListeners = new Set<Listener<AdminNotification[]>>();

let localDonorLogs: DonorLog[] = [];
const donorLogListeners = new Set<Listener<DonorLog[]>>();

let localPendingPayments: PendingPayment[] = [];
const pendingPaymentListeners = new Set<Listener<PendingPayment[]>>();

function notifyFunding() {
  fundingListeners.forEach((listener) => listener(localEarned));
}

function notifyActivity() {
  activityListeners.forEach((listener) => listener(localActivity));
}

function notifyNotifications() {
  notificationListeners.forEach((listener) => listener(localNotifications));
}

function notifyDonorLogs() {
  donorLogListeners.forEach((listener) => listener(localDonorLogs));
}

function notifyPendingPayments() {
  pendingPaymentListeners.forEach((listener) => listener(localPendingPayments));
}

function buildDetail(donorName: string, message: string): string {
  return message ? `Received from ${donorName} — ${message}` : `Received from ${donorName}`;
}

export function subscribeToFunding(callback: Listener<number>): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, FUNDING_COLLECTION, FUNDING_DOC_ID);
      return onSnapshot(
        ref,
        (snapshot) => {
          const value = snapshot.exists() ? snapshot.data().earned as number : STARTING_EARNED;
          callback(value);
        },
        (error) => {
          console.warn('Firebase subscription failed (possibly permissions), falling back to local mode:', error);
          callback(localEarned);
        }
      );
    } catch (error) {
      console.warn('Firebase subscription setup failed (possibly permissions), falling back to local mode:', error);
      // Fall through to local mode
    }
  }

  callback(localEarned);
  fundingListeners.add(callback);
  return () => fundingListeners.delete(callback);
}

export function subscribeToActivityLogs(callback: Listener<ActivityLog[]>): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const activityQuery = query(
        collection(db, ACTIVITY_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(ACTIVITY_LIMIT)
      );
      return onSnapshot(
        activityQuery,
        (snapshot) => {
          const entries: ActivityLog[] = snapshot.docs.map((docSnapshot) => {
            const data = docSnapshot.data();
            return {
              id: docSnapshot.id,
              amount: data.amount as string,
              detail: data.detail as string,
              isSpent: data.isSpent as boolean | undefined,
              createdAt: data.createdAt?.toMillis?.() ?? Date.now()
            };
          });
          callback(entries.length > 0 ? entries : localActivity);
        },
        (error) => {
          console.warn('Firebase subscription failed (possibly permissions), falling back to local mode:', error);
          callback(localActivity);
        }
      );
    } catch (error) {
      console.warn('Firebase subscription setup failed (possibly permissions), falling back to local mode:', error);
      // Fall through to local mode
    }
  }

  callback(localActivity);
  activityListeners.add(callback);
  return () => activityListeners.delete(callback);
}

export function subscribeToAdminNotifications(callback: Listener<AdminNotification[]>): () => void {
  if (isFirebaseConfigured && db) {
    try {
      // Get notifications from the last 24 hours
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const notificationsQuery = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('timestamp', '>', oneDayAgo),
        orderBy('timestamp', 'desc'),
        limit(NOTIFICATIONS_LIMIT)
      );
      return onSnapshot(
        notificationsQuery,
        (snapshot) => {
          const entries: AdminNotification[] = snapshot.docs.map((docSnapshot) => {
            const data = docSnapshot.data();
            return {
              id: docSnapshot.id,
              amount: data.amount as number,
              donorName: data.donorName as string,
              message: data.message as string,
              timestamp: data.timestamp?.toMillis?.() ?? Date.now()
            };
          });
          callback(entries);
        },
        (error) => {
          console.warn('Firebase subscription failed (possibly permissions), falling back to local mode:', error);
          callback(localNotifications);
        }
      );
    } catch (error) {
      console.warn('Firebase subscription setup failed (possibly permissions), falling back to local mode:', error);
      // Fall through to local mode
    }
  }

  callback(localNotifications);
  notificationListeners.add(callback);
  return () => notificationListeners.delete(callback);
}

/** Full, un-windowed history of verified donors — for an admin "all donors" view/export. */
export function subscribeToDonorLogs(callback: Listener<DonorLog[]>): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const donorLogsQuery = query(
        collection(db, DONOR_LOGS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(DONOR_LOGS_LIMIT)
      );
      return onSnapshot(
        donorLogsQuery,
        (snapshot) => {
          const entries: DonorLog[] = snapshot.docs.map((docSnapshot) => {
            const data = docSnapshot.data();
            return {
              id: docSnapshot.id,
              donorName: data.donorName as string,
              amount: data.amount as number,
              message: data.message as string,
              createdAt: data.createdAt?.toMillis?.() ?? Date.now()
            };
          });
          callback(entries);
        },
        (error) => {
          console.warn('Firebase subscription failed (possibly permissions), falling back to local mode:', error);
          callback(localDonorLogs);
        }
      );
    } catch (error) {
      console.warn('Firebase subscription setup failed (possibly permissions), falling back to local mode:', error);
      // Fall through to local mode
    }
  }

  callback(localDonorLogs);
  donorLogListeners.add(callback);
  return () => donorLogListeners.delete(callback);
}

/**
 * Records a verified donation: bumps the running total and writes it to
 * activityLogs (public feed), donorLogs (permanent per-donor record), and
 * adminNotifications (24h admin alert feed) — all in one atomic batch, so
 * verification success always means the write either fully lands or fully
 * fails, never half of it.
 */
export async function recordVerifiedDonation(
amount: number,
donorName: string,
message: string)
: Promise<void> {
  const detail = buildDetail(donorName, message);

  if (isFirebaseConfigured && db) {
    try {
      console.log('Attempting to write to Firebase Firestore...');
      const batch = writeBatch(db);

      const fundingRef = doc(db, FUNDING_COLLECTION, FUNDING_DOC_ID);
      batch.set(fundingRef, { earned: increment(amount) }, { merge: true });

      const activityRef = doc(collection(db, ACTIVITY_COLLECTION));
      batch.set(activityRef, {
        amount: `Rs ${amount}`,
        detail,
        isSpent: false, // Donations are earned entries
        createdAt: serverTimestamp()
      });

      const donorLogRef = doc(collection(db, DONOR_LOGS_COLLECTION));
      batch.set(donorLogRef, {
        donorName,
        amount,
        message,
        createdAt: serverTimestamp()
      });

      const notificationRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
      batch.set(notificationRef, {
        amount,
        donorName,
        message,
        timestamp: serverTimestamp()
      });

      await batch.commit();
      console.log('Firebase write successful!');
      return;
    } catch (error) {
      console.error('Firebase write failed (possibly permissions), falling back to local mode:', error);
      // Fall through to local mode
    }
  } else {
    console.log('Firebase not configured or db is null, using local mode');
  }

  localEarned += amount;

  localActivity = [
  { id: `local-${Date.now()}`, amount: `Rs ${amount}`, detail, isSpent: false, createdAt: Date.now() },
  ...localActivity].
  slice(0, ACTIVITY_LIMIT);

  localDonorLogs = [
  { id: `donor-${Date.now()}`, donorName, amount, message, createdAt: Date.now() },
  ...localDonorLogs].
  slice(0, DONOR_LOGS_LIMIT);

  localNotifications = [
  { id: `notif-${Date.now()}`, amount, donorName, message, timestamp: Date.now() },
  ...localNotifications].
  slice(0, NOTIFICATIONS_LIMIT);

  notifyFunding();
  notifyActivity();
  notifyDonorLogs();
  notifyNotifications();
}

/** Lets an admin add an activity log entry directly. Updates funding based on entry type. */
export async function addActivityLogEntry(amount: string, detail: string, isSpent: boolean = false): Promise<void> {
  // Extract numeric amount from string like "Rs 12000"
  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10);

  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);

      // Add activity log entry
      const activityRef = doc(collection(db, ACTIVITY_COLLECTION));
      batch.set(activityRef, {
        amount,
        detail,
        isSpent,
        createdAt: serverTimestamp()
      });

      // Update the funding total based on entry type
      if (!isNaN(numericAmount)) {
        const fundingRef = doc(db, FUNDING_COLLECTION, FUNDING_DOC_ID);
        if (isSpent) {
          // Reduce earned for spent entries
          batch.set(fundingRef, { earned: increment(-numericAmount) }, { merge: true });
        } else {
          // Increase earned for earned entries
          batch.set(fundingRef, { earned: increment(numericAmount) }, { merge: true });
        }
      }

      await batch.commit();
      return;
    } catch (error) {
      console.warn('Firebase write failed (possibly permissions), falling back to local mode:', error);
      // Fall through to local mode
    }
  }

  localActivity = [
  { id: `local-${Date.now()}`, amount, detail, isSpent, createdAt: Date.now() },
  ...localActivity].
  slice(0, ACTIVITY_LIMIT);

  // Update local earned amount based on entry type
  if (!isNaN(numericAmount)) {
    if (isSpent) {
      localEarned = Math.max(0, localEarned - numericAmount);
    } else {
      localEarned += numericAmount;
    }
    notifyFunding();
  }

  notifyActivity();
}

/** Subscribes to activity logs and calculates total spent amount from entries marked as isSpent=true */
export function subscribeToSpent(callback: Listener<number>): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const activityQuery = query(
        collection(db, ACTIVITY_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(100) // Get more entries to calculate accurate total
      );
      return onSnapshot(
        activityQuery,
        (snapshot) => {
          const totalSpent = snapshot.docs.reduce((sum, docSnapshot) => {
            const data = docSnapshot.data();
            if (data.isSpent === true) {
              // Extract numeric amount from string like "Rs 12000"
              const amountStr = data.amount as string;
              const numericAmount = parseInt(amountStr.replace(/\D/g, ''), 10);
              return sum + (isNaN(numericAmount) ? 0 : numericAmount);
            }
            return sum;
          }, 0);
          callback(totalSpent);
        },
        (error) => {
          console.warn('Firebase subscription failed (possibly permissions), falling back to local mode:', error);
          // Calculate from local data
          const localSpent = localActivity.reduce((sum, log) => {
            if (log.isSpent) {
              const amountStr = log.amount;
              const numericAmount = parseInt(amountStr.replace(/\D/g, ''), 10);
              return sum + (isNaN(numericAmount) ? 0 : numericAmount);
            }
            return sum;
          }, 0);
          callback(localSpent);
        }
      );
    } catch (error) {
      console.warn('Firebase subscription setup failed (possibly permissions), falling back to local mode:', error);
      // Fall through to local mode
    }
  }

  // Calculate from local data
  const localSpent = localActivity.reduce((sum, log) => {
    if (log.isSpent) {
      const amountStr = log.amount;
      const numericAmount = parseInt(amountStr.replace(/\D/g, ''), 10);
      return sum + (isNaN(numericAmount) ? 0 : numericAmount);
    }
    return sum;
  }, 0);
  callback(localSpent);
  const spentListeners = new Set<Listener<number>>();
  spentListeners.add(callback);
  return () => spentListeners.delete(callback);
}

/**
 * Submit a payment for admin verification with screenshot
 */
export async function submitPendingPayment(
  amount: number,
  donorName: string,
  message: string,
  screenshotUrl: string
): Promise<void> {
  console.log('Submitting pending payment:', { amount, donorName, message, screenshotUrlLength: screenshotUrl.length });
  
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, PENDING_PAYMENTS_COLLECTION), {
        amount,
        donorName,
        message,
        screenshotUrl,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      console.log('✅ Pending payment submitted successfully to Firebase with ID:', docRef.id);
      return;
    } catch (error) {
      console.error('❌ Firebase write failed for pending payment:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      // Fall through to local mode
    }
  }

  // Local mode
  console.log('Using local mode for pending payment submission');
  localPendingPayments = [
    {
      id: `pending-${Date.now()}`,
      amount,
      donorName,
      message,
      screenshotUrl,
      status: 'pending',
      createdAt: Date.now()
    },
    ...localPendingPayments
  ];
  notifyPendingPayments();
}

/**
 * Subscribe to pending payments for admin review
 */
export function subscribeToPendingPayments(callback: Listener<PendingPayment[]>): () => void {
  if (isFirebaseConfigured && db) {
    try {
      // Query without orderBy to avoid composite index requirement
      const pendingQuery = query(
        collection(db, PENDING_PAYMENTS_COLLECTION),
        where('status', '==', 'pending')
      );
      return onSnapshot(
        pendingQuery,
        (snapshot) => {
          const payments: PendingPayment[] = snapshot.docs.map((docSnapshot) => {
            const data = docSnapshot.data();
            return {
              id: docSnapshot.id,
              amount: data.amount as number,
              donorName: data.donorName as string,
              message: data.message as string,
              screenshotUrl: data.screenshotUrl as string,
              status: data.status as 'pending' | 'approved' | 'rejected',
              createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
              reviewedAt: data.reviewedAt?.toMillis?.(),
              reviewedBy: data.reviewedBy as string | undefined
            };
          });
          
          // Sort by createdAt in memory (newest first)
          payments.sort((a, b) => b.createdAt - a.createdAt);
          
          console.log(`Found ${payments.length} pending payment(s)`);
          callback(payments);
        },
        (error) => {
          console.error('Firebase subscription failed for pending payments:', error);
          console.error('Error details:', error.code, error.message);
          callback(localPendingPayments.filter(p => p.status === 'pending'));
        }
      );
    } catch (error) {
      console.error('Firebase subscription setup failed for pending payments:', error);
      // Fall through to local mode
    }
  }

  const pendingLocal = localPendingPayments.filter(p => p.status === 'pending');
  console.log(`Using local mode: ${pendingLocal.length} pending payment(s)`);
  callback(pendingLocal);
  pendingPaymentListeners.add(callback);
  return () => pendingPaymentListeners.delete(callback);
}

/**
 * Approve a pending payment (admin action)
 */
export async function approvePendingPayment(paymentId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const paymentRef = doc(db, PENDING_PAYMENTS_COLLECTION, paymentId);
      
      // Get the payment data first
      const paymentDoc = await getDoc(paymentRef);
      if (!paymentDoc.exists()) {
        throw new Error('Payment not found');
      }
      
      const paymentData = paymentDoc.data();
      const amount = paymentData.amount as number;
      const donorName = paymentData.donorName as string;
      const message = paymentData.message as string;

      // Update payment status and record the donation in one batch
      const batch = writeBatch(db);
      
      batch.update(paymentRef, {
        status: 'approved',
        reviewedAt: serverTimestamp()
      });

      // Record the donation
      const fundingRef = doc(db, FUNDING_COLLECTION, FUNDING_DOC_ID);
      batch.set(fundingRef, { earned: increment(amount) }, { merge: true });

      const activityRef = doc(collection(db, ACTIVITY_COLLECTION));
      const detail = message ? `Received from ${donorName} — ${message}` : `Received from ${donorName}`;
      batch.set(activityRef, {
        amount: `Rs ${amount}`,
        detail,
        isSpent: false,
        createdAt: serverTimestamp()
      });

      const donorLogRef = doc(collection(db, DONOR_LOGS_COLLECTION));
      batch.set(donorLogRef, {
        donorName,
        amount,
        message,
        createdAt: serverTimestamp()
      });

      const notificationRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
      batch.set(notificationRef, {
        amount,
        donorName,
        message,
        timestamp: serverTimestamp()
      });

      await batch.commit();
      console.log('Payment approved and recorded');
      return;
    } catch (error) {
      console.error('Firebase approval failed:', error);
      throw error;
    }
  }

  // Local mode
  const payment = localPendingPayments.find(p => p.id === paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }

  payment.status = 'approved';
  payment.reviewedAt = Date.now();

  // Record the donation locally
  localEarned += payment.amount;
  const detail = payment.message 
    ? `Received from ${payment.donorName} — ${payment.message}` 
    : `Received from ${payment.donorName}`;
  
  localActivity = [
    { id: `local-${Date.now()}`, amount: `Rs ${payment.amount}`, detail, isSpent: false, createdAt: Date.now() },
    ...localActivity
  ].slice(0, ACTIVITY_LIMIT);

  localDonorLogs = [
    { id: `donor-${Date.now()}`, donorName: payment.donorName, amount: payment.amount, message: payment.message, createdAt: Date.now() },
    ...localDonorLogs
  ].slice(0, DONOR_LOGS_LIMIT);

  localNotifications = [
    { id: `notif-${Date.now()}`, amount: payment.amount, donorName: payment.donorName, message: payment.message, timestamp: Date.now() },
    ...localNotifications
  ].slice(0, NOTIFICATIONS_LIMIT);

  notifyFunding();
  notifyActivity();
  notifyDonorLogs();
  notifyNotifications();
  notifyPendingPayments();
}

/**
 * Reject a pending payment (admin action)
 */
export async function rejectPendingPayment(paymentId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const paymentRef = doc(db, PENDING_PAYMENTS_COLLECTION, paymentId);
      
      // Check if payment exists before updating
      const paymentDoc = await getDoc(paymentRef);
      if (!paymentDoc.exists()) {
        throw new Error('Payment not found');
      }
      
      // Update status to rejected
      await updateDoc(paymentRef, {
        status: 'rejected',
        reviewedAt: serverTimestamp()
      });
      
      console.log('Payment rejected successfully');
      return;
    } catch (error) {
      console.error('Firebase rejection failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to reject payment');
    }
  }

  // Local mode
  const payment = localPendingPayments.find(p => p.id === paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }

  payment.status = 'rejected';
  payment.reviewedAt = Date.now();
  notifyPendingPayments();
}
