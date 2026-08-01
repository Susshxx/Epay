import { useEffect, useState } from 'react';

/**
 * Computes a uniform scale factor so a fixed-size design canvas
 * (designWidth x designHeight) fits entirely within the current
 * viewport, with no scrolling in either direction.
 */
export function useFitToScreen(designWidth: number, designHeight: number) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const computeScale = () => {
      const widthScale = window.innerWidth / designWidth;
      const heightScale = window.innerHeight / designHeight;
      const nextScale = Math.min(widthScale, heightScale, 1);
      setScale(nextScale > 0 ? nextScale : 1);
    };

    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, [designWidth, designHeight]);

  return scale;
}