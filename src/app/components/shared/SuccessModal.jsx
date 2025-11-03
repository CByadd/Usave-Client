'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  primaryAction,
  primaryActionLabel,
  secondaryAction,
  secondaryActionLabel,
}) {
  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle : AlertCircle;
  const iconColor = isSuccess ? 'text-green-500' : 'text-red-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            key="modal"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center py-2">
              <div className="flex justify-center mb-4">
                <Icon className={`w-16 h-16 ${iconColor}`} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {title}
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>

              <div className="flex gap-3 justify-center">
                {secondaryAction && (
                  <button
                    onClick={secondaryAction}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    {secondaryActionLabel || 'Cancel'}
                  </button>
                )}
                {primaryAction && (
                  <button
                    onClick={primaryAction}
                    className="px-5 py-2.5 bg-[#0B4866] text-white rounded-lg font-medium hover:bg-[#094058] transition"
                  >
                    {primaryActionLabel || 'OK'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


