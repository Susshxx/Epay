// import { useEffect } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';
// import { FallingMoneyAnimation } from './FallingMoneyAnimation';
// import { playCoinShakeSound } from '../utils/sound';

// type HeroVesselProps = {
//   src: string;
//   alt: string;
//   className?: string;
//   showMoneyAnimation?: boolean;
//   onAnimationComplete?: () => void;
// };

// /** Crossfades between funding-tier vessel images (cup → bowl → phone). */
// export function HeroVessel({ src, alt, className, showMoneyAnimation = false, onAnimationComplete }: HeroVesselProps) {
//   // Play sound exactly when shake animation starts (after 5s delay) and repeats every 13s
//   useEffect(() => {
//     // Initial shake starts after 5 seconds
//     const initialTimer = setTimeout(() => {
//       playCoinShakeSound();
//     }, 5000);

//     // Subsequent shakes occur every 13 seconds (5s initial + 3s animation + 10s wait)
//     const repeatTimer = setInterval(() => {
//       playCoinShakeSound();
//     }, 13000);

//     return () => {
//       clearTimeout(initialTimer);
//       clearInterval(repeatTimer);
//     };
//   }, []);

//   return (
//     <div className={className}>
//       <AnimatePresence mode="wait">
//         <motion.img
//           key={src}
//           src={src}
//           alt={alt}
//           initial={{ opacity: 0, scale: 0.94 }}
//           animate={{
//             opacity: 1,
//             scale: 1,
//             y: [0, -25, 25, -25, 25, -25, 25, 0],
//             rotate: [0, -3, 3, -3, 3, -3, 3, 0]
//           }}
//           exit={{ opacity: 0, scale: 1.04 }}
//           transition={{
//             opacity: { duration: 0.45, ease: 'easeOut' },
//             scale: { duration: 0.45, ease: 'easeOut' },
//             y: {
//               duration: 3,
//               ease: 'easeInOut',
//               delay: 5,
//               repeat: Infinity,
//               repeatDelay: 10
//             },
//             rotate: {
//               duration: 3,
//               ease: 'easeInOut',
//               delay: 5,
//               repeat: Infinity,
//               repeatDelay: 10
//             }
//           }}
//           className="h-full w-full object-contain" />

//       </AnimatePresence>
//       <FallingMoneyAnimation
//         isActive={showMoneyAnimation}
//         onComplete={onAnimationComplete}
//       />
//     </div>);

// }


import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FallingMoneyAnimation } from './FallingMoneyAnimation';
import { playCoinShakeSound } from '../utils/sound';

type HeroVesselProps = {
  src: string;
  alt: string;
  className?: string;
  showMoneyAnimation?: boolean;
  onAnimationComplete?: () => void;
};

// Shared timing constants — must match the y/rotate transition below exactly,
// since the sound is cued off these same numbers rather than off the animation itself.
const SHAKE_DELAY = 5; // seconds before the first shake
const SHAKE_DURATION = 3; // seconds the shake itself lasts
const SHAKE_REPEAT_DELAY = 10; // seconds of rest between shakes
const SHAKE_CYCLE = SHAKE_DURATION + SHAKE_REPEAT_DELAY; // 13s, full loop period

/** Crossfades between funding-tier vessel images (cup → bowl → phone). */
export function HeroVessel({ src, alt, className, showMoneyAnimation = false, onAnimationComplete }: HeroVesselProps) {
  // Play sound exactly when the shake starts, and keep it locked to the shake loop.
  //
  // Two things matter here:
  // 1. `[src]` dependency — AnimatePresence mode="wait" remounts motion.img (new
  //    `key`) whenever `src` changes, which restarts its animation delay from 0.
  //    This effect must restart on `src` change too, or the sound keeps ticking on
  //    the old schedule while the animation resets, and the two drift apart.
  // 2. Self-correcting scheduling — plain `setInterval` doesn't self-correct. Every
  //    time the main thread is busy (re-render, layout, background tab throttling),
  //    the callback fires late, and that lateness ACCUMULATES over cycles instead of
  //    resetting. Instead, each tick computes its target time from the original
  //    start time (startTime + cycleIndex * SHAKE_CYCLE) and schedules a setTimeout
  //    for exactly that remaining delay, so a late tick doesn't push all future ticks
  //    later — it snaps back to the correct absolute schedule.
  useEffect(() => {
    const startTime = performance.now();
    let timerId: ReturnType<typeof setTimeout>;

    const scheduleNext = (cycleIndex: number) => {
      const targetTime = startTime + (SHAKE_DELAY + cycleIndex * SHAKE_CYCLE) * 1000;
      const delay = Math.max(0, targetTime - performance.now());

      timerId = setTimeout(() => {
        playCoinShakeSound();
        scheduleNext(cycleIndex + 1);
      }, delay);
    };

    scheduleNext(0);

    return () => clearTimeout(timerId);
  }, [src]);

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.img
          key={src}
          src={src}
          alt={alt}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -25, 25, -25, 25, -25, 25, 0],
            rotate: [0, -3, 3, -3, 3, -3, 3, 0]
          }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{
            opacity: { duration: 0.45, ease: 'easeOut' },
            scale: { duration: 0.45, ease: 'easeOut' },
            y: {
              duration: SHAKE_DURATION,
              ease: 'easeInOut',
              delay: SHAKE_DELAY,
              repeat: Infinity,
              repeatDelay: SHAKE_REPEAT_DELAY
            },
            rotate: {
              duration: SHAKE_DURATION,
              ease: 'easeInOut',
              delay: SHAKE_DELAY,
              repeat: Infinity,
              repeatDelay: SHAKE_REPEAT_DELAY
            }
          }}
          className="h-full w-full object-contain"
        />
      </AnimatePresence>
      <FallingMoneyAnimation
        isActive={showMoneyAnimation}
        onComplete={onAnimationComplete}
      />
    </div>
  );
}