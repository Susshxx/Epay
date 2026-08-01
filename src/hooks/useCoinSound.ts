import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook to play a coin drop sound effect.
 * Uses the Web Audio API to generate a synthesized coin sound.
 */
export function useCoinSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on mount
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }

    return () => {
      // Clean up AudioContext on unmount
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  const playCoinSound = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    try {
      // Resume context if suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const now = audioContext.currentTime;

      // Create oscillator for the "ting" sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Coin sound characteristics: high frequency with quick decay
      oscillator.frequency.setValueAtTime(1000, now);
      oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);

      // Volume envelope: sharp attack, quick decay
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      oscillator.type = 'sine';
      oscillator.start(now);
      oscillator.stop(now + 0.15);

      // Add a second harmonic for richer sound
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      oscillator2.frequency.setValueAtTime(2000, now);
      oscillator2.frequency.exponentialRampToValueAtTime(1600, now + 0.05);
      oscillator2.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

      gainNode2.gain.setValueAtTime(0.15, now);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      oscillator2.type = 'sine';
      oscillator2.start(now);
      oscillator2.stop(now + 0.12);
    } catch (error) {
      console.error('Error playing coin sound:', error);
    }
  }, []);

  return playCoinSound;
}
