import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { playLaughSound } from '../utils/sound';

type ThankYouOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ThankYouOverlay({ isOpen, onClose }: ThankYouOverlayProps) {
  const [currentImage, setCurrentImage] = useState<'catlike' | 'catmoney'>('catlike');

  useEffect(() => {
    if (isOpen) {
      setCurrentImage('catlike');
      // Switch to catmoney after 3 seconds
      const timer = setTimeout(() => {
        setCurrentImage('catmoney');
        playLaughSound();
        // Close after another 3 seconds
        setTimeout(onClose, 3000);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const imageUrl = currentImage === 'catlike' ? '/Catlike.png' : '/catmoney.png';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[90vw] max-h-[90vh]"
          >
            <img
              src={imageUrl}
              alt="Thank you!"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
