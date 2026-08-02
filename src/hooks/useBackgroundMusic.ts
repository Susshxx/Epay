import { useEffect, useRef } from 'react';

export function useBackgroundMusic(audioPath: string, volume: number = 0.3) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Try to play (some browsers require user interaction first)
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Auto-play was prevented, will play on first user interaction
        console.log('Background music auto-play prevented:', error);
      });
    }

    // Play on first user interaction if auto-play was blocked
    const handleUserInteraction = () => {
      if (audio.paused) {
        audio.play().catch(() => {
          // Ignore if still can't play
        });
      }
      // Remove listeners after first successful interaction
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    // Cleanup
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, [audioPath, volume]);

  // Optional: method to pause/resume music
  const toggleMusic = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  return { toggleMusic };
}
