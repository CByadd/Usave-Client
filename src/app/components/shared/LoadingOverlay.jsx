'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAnimationStore } from '../../stores/useAnimationStore';

export default function LoadingOverlay({ isOpen, message = 'Loading...' }) {
  const { getAnimationConfig, animationsEnabled } = useAnimationStore();
  const loadingConfig = getAnimationConfig('loading');

  if (!animationsEnabled) {
    return isOpen ? (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#0B4866] animate-spin" />
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    ) : null;
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: loadingConfig.duration,
            ease: loadingConfig.ease,
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          style={{ willChange: 'opacity' }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4"
            style={{ willChange: 'transform, opacity' }}
          >
            <Loader2 className="w-8 h-8 text-[#0B4866] animate-spin" />
            <p className="text-gray-700 font-medium">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

