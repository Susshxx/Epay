import { useEffect, useRef } from 'react';

export function useBackgroundMusic(audioPath: string, volume: number = 0.3) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = volume;
    audio.preload = 'auto';
    audioRef.current = audio;

    // Try to play immediately (will fail in most browsers)
    const attemptPlay = () => {
      if (!hasPlayedRef.current) {
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              hasPlayedRef.current = true;
              console.log('Background music started');
            })
            .catch((error) => {
              console.log('Autoplay prevented. Music will start on first user interaction:', error.message);
            });
        }
      }
    };

    attemptPlay();

    // Play on ANY user interaction (click, touch, keypress, scroll)
    const handleUserInteraction = () => {
      if (audio.paused && !hasPlayedRef.current) {
        audio.play()
          .then(() => {
            hasPlayedRef.current = true;
            console.log('Background music started after user interaction');
            // Remove all listeners after successful play
            removeListeners();
          })
          .catch((error) => {
            console.log('Failed to play music:', error);
          });
      }
    };

    const removeListeners = () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };

    // Resume music when tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden && hasPlayedRef.current && audio.paused) {
        audio.play().catch(() => {
          // Ignore errors
        });
      }
    };

    // Add multiple event listeners to catch any interaction
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction, { once: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      removeListeners();
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
      hasPlayedRef.current = false;
    };
  }, [audioPath, volume]);

  // Optional: method to pause/resume music
  const toggleMusic = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {
          console.log('Cannot play music');
        });
      } else {
        audioRef.current.pause();
      }
    }
  };

  return { toggleMusic };
}
