import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FallingMoneyAnimation } from './FallingMoneyAnimation';

type HeroVesselProps = {
  src: string;
  alt: string;
  className?: string;
  showMoneyAnimation?: boolean;
  onAnimationComplete?: () => void;
};

/** Crossfades between funding-tier vessel images (cup → bowl → phone). */
export function HeroVessel({ src, alt, className, showMoneyAnimation = false, onAnimationComplete }: HeroVesselProps) {
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.img
          key={src}
          src={src}
          alt={alt}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="h-full w-full object-contain" />

      </AnimatePresence>
      <FallingMoneyAnimation 
        isActive={showMoneyAnimation} 
        onComplete={onAnimationComplete} 
      />
    </div>);

}