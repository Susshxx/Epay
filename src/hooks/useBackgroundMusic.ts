import { useEffect, useRef } from 'react';

export function useBackgroundMusic(audioPath: string, volume: number = 0.3, delayMs: number = 1000) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = 0; // Start at 0 volume
    audio.preload = 'auto';
    audioRef.current = audio;

    // Start playing muted immediately (allowed by browsers)
    const startMutedMusic = async () => {
      try {
        // Start playing muted (browsers allow this)
        await audio.play();
        hasStartedRef.current = true;
        console.log('Background music started (muted)');

        // After delay, fade in the volume
        setTimeout(() => {
          fadeInVolume(audio, volume, 1500); // Fade in over 1.5 seconds
        }, delayMs);
      } catch (error) {
        console.log('Failed to start music, will try on user interaction:', error);
        // Fallback: start on user interaction
        setupInteractionListeners(audio, volume, delayMs);
      }
    };

    // Fade in volume gradually
    const fadeInVolume = (audio: HTMLAudioElement, targetVolume: number, duration: number) => {
      const steps = 50;
      const stepDuration = duration / steps;
      const volumeIncrement = targetVolume / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(volumeIncrement * currentStep, targetVolume);
        
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          console.log(`Background music faded in to volume ${targetVolume}`);
        }
      }, stepDuration);
    };

    // Fallback: setup interaction listeners
    const setupInteractionListeners = (audio: HTMLAudioElement, targetVolume: number, delay: number) => {
      const handleUserInteraction = () => {
        if (!hasStartedRef.current) {
          audio.play()
            .then(() => {
              hasStartedRef.current = true;
              console.log('Background music started after user interaction');
              setTimeout(() => {
                fadeInVolume(audio, targetVolume, 1500);
              }, delay);
              removeListeners();
            })
            .catch((error) => {
              console.log('Failed to play music:', error.message);
            });
        }
      };

      const removeListeners = () => {
        document.removeEventListener('click', handleUserInteraction, true);
        document.removeEventListener('touchstart', handleUserInteraction, true);
        document.removeEventListener('keydown', handleUserInteraction, true);
      };

      document.addEventListener('click', handleUserInteraction, { once: true, capture: true });
      document.addEventListener('touchstart', handleUserInteraction, { once: true, capture: true });
      document.addEventListener('keydown', handleUserInteraction, { once: true, capture: true });
    };

    // Resume music when tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden && hasStartedRef.current && audio.paused) {
        audio.play().catch(() => {
          // Ignore errors
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start the music (muted initially)
    startMutedMusic();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
      hasStartedRef.current = false;
    };
  }, [audioPath, volume, delayMs]);

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
