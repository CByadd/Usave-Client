'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAnimationStore } from './stores/useAnimationStore';

export default function Template({ children }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const { getAnimationConfig, animationsEnabled } = useAnimationStore();
  const config = getAnimationConfig('page');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!animationsEnabled || !isMounted) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

