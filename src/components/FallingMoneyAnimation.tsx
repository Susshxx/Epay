import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

type FallingMoneyAnimationProps = {
  isActive: boolean;
  donationAmount?: number;
  goalPercent?: number;
  onComplete?: () => void;
};

export function FallingMoneyAnimation({ isActive, donationAmount = 0, goalPercent = 0, onComplete }: FallingMoneyAnimationProps) {
  const [accumulatedBills, setAccumulatedBills] = useState(0);

  // Calculate number of falling bills based on donation amount (1 bill per 5 Rs)
  const numberOfFallingBills = Math.min(Math.floor(donationAmount / 5), 15); // Max 15 falling bills
  const fallingBills = Array.from({ length: numberOfFallingBills }, (_, i) => i);

  // Calculate number of accumulated bills based on goal percent (max 20 for display)
  const targetAccumulatedBills = useMemo(() => Math.min(Math.floor(goalPercent / 5), 20), [goalPercent]);

  // Update accumulated bills when animation starts
  useEffect(() => {
    if (isActive) {
      setAccumulatedBills(targetAccumulatedBills);
    }
  }, [isActive, targetAccumulatedBills]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 flex items-center justify-center">
          {/* Falling bills */}
          {fallingBills.map((index) => {
            const delay = index * 0.08;
            const randomX = Math.random() * 150 - 75;

            return (
              <motion.div
                key={`falling-${index}`}
                initial={{
                  y: -200,
                  x: randomX,
                  opacity: 0,
                  rotate: Math.random() * 30 - 15
                }}
                animate={{
                  y: 0, // Drop to center
                  opacity: [0, 1, 1, 0],
                  rotate: [Math.random() * 30 - 15, Math.random() * 360 - 180],
                  scale: [0.5, 1, 1, 0.3]
                }}
                transition={{
                  duration: 1.2,
                  delay,
                  ease: 'easeIn'
                }}
                onAnimationComplete={() => {
                  if (index === fallingBills.length - 1 && onComplete) {
                    onComplete();
                  }
                }}
                className="absolute"
                style={{ marginLeft: randomX }}
              >
                <img
                  src="/notes/5-front.png"
                  alt=""
                  width={50}
                  height={50}
                  className="w-[50px] h-[50px] object-contain"
                />
              </motion.div>
            );
          })}

          {/* Accumulated bills in center */}
          <div className="absolute">
            <AnimatePresence>
              {Array.from({ length: accumulatedBills }).map((_, index) => (
                <motion.img
                  key={`accumulated-${index}`}
                  src="/notes/5-front.png"
                  alt=""
                  width={40}
                  height={40}
                  initial={{ opacity: 0, scale: 0.5, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="absolute w-[40px] h-[40px] object-contain"
                  style={{
                    left: (index % 5) * 12 - 24,
                    top: Math.floor(index / 5) * 8,
                    rotate: (Math.random() - 0.5) * 30
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
