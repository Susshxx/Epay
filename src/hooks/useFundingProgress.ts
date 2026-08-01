import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { tiers } from '../data/epay';
import { recordVerifiedDonation, subscribeToFunding, subscribeToSpent } from '../services/fundingService';
import { useCoinSound } from './useCoinSound';

const STARTING_EARNED = 0;
const TOAST_DURATION_MS = 2600;

/**
 * Tracks total money raised (synced live from the backend) and derives which
 * funding tier — and its vessel image, goal, and quote — is currently active.
 * `recordDonation` persists a verified donation and the tier/vessel update in
 * real time as the subscription pushes the new total back down.
 */
export function useFundingProgress() {
  const [earned, setEarned] = useState(STARTING_EARNED);
  const [spent, setSpent] = useState(0);
  const [lastDonation, setLastDonation] = useState<number | null>(null);
  const [showMoneyAnimation, setShowMoneyAnimation] = useState(false);
  const playCoinSound = useCoinSound();
  const previousEarnedRef = useRef(STARTING_EARNED);

  useEffect(() => subscribeToFunding(setEarned), []);
  useEffect(() => subscribeToSpent(setSpent), []);

  // Play coin sound when earned amount increases
  useEffect(() => {
    if (earned > previousEarnedRef.current) {
      playCoinSound();
      setShowMoneyAnimation(true);
    }
    previousEarnedRef.current = earned;
  }, [earned, playCoinSound]);

  const { tier, progressPercent, isMaxTier, nextGoal } = useMemo(() => {
    const tierIndex = tiers.findIndex((candidate) => earned < candidate.goal);
    const isMax = tierIndex === -1;
    const currentTier = isMax ? tiers[tiers.length - 1] : tiers[tierIndex];
    const previousGoal = isMax || tierIndex === 0 ? 0 : tiers[tierIndex - 1].goal;
    const targetGoal = currentTier.goal;
    const percent = isMax ?
    100 :
    Math.min(
      100,
      Math.round((earned - previousGoal) / (targetGoal - previousGoal) * 100)
    );

    return {
      tier: currentTier,
      progressPercent: percent,
      isMaxTier: isMax,
      nextGoal: targetGoal
    };
  }, [earned]);

  const recordDonation = useCallback(
    async (amount: number, donorName: string, message: string) => {
      await recordVerifiedDonation(amount, donorName, message);
      setLastDonation(amount);
    },
    []
  );

  useEffect(() => {
    if (lastDonation === null) return;
    const timeout = setTimeout(() => setLastDonation(null), TOAST_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [lastDonation]);

  const handleAnimationComplete = useCallback(() => {
    setShowMoneyAnimation(false);
  }, []);

  return { earned, spent, tier, progressPercent, isMaxTier, nextGoal, lastDonation, recordDonation, showMoneyAnimation, handleAnimationComplete };
}