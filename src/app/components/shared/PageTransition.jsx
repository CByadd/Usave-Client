'use client';

import { motion } from 'framer-motion';
import { useAnimationStore } from '../../stores/useAnimationStore';

export default function PageTransition({ children }) {
  const { getAnimationConfig, animationsEnabled } = useAnimationStore();
  const config = getAnimationConfig('page');

  if (!animationsEnabled) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{
        duration: config.duration,
        ease: config.ease,
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

