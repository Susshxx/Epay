import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    // Allow dismissal after 1 second
    const timer = setTimeout(() => {
      setCanDismiss(true);
    }, 1000);

    // Auto-hide after 3 seconds
    const autoHideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoHideTimer);
    };
  }, []);

  const handleClick = () => {
    if (canDismiss) {
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-canvas cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onClick={handleClick}
        >
          <motion.img
            src="/CatAsk.png"
            alt="Welcome"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
          
          {canDismiss && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="font-jeju text-lg text-black/70 animate-pulse"
            >
              Click anywhere to continue
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
