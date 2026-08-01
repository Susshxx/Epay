import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type DonationToastProps = {
  amount: number | null;
  className?: string;
};

export function DonationToast({ amount, className }: DonationToastProps) {
  return (
    <AnimatePresence>
      {amount !== null &&
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className={
        className ??
        'rounded-[5px] border border-black bg-mint px-4 py-2 text-center font-jeju text-sm text-black shadow-[3px_4px_4px_rgba(0,0,0,0.2)]'
        }>
        
          Rs {amount} received. Thank you!
        </motion.div>
      }
    </AnimatePresence>);

}