'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info', // 'info', 'success', 'warning', 'error'
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  showCloseButton = true,
}) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      default:
        return <Info className="w-12 h-12 text-[#0B4866]" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-[#0B4866] hover:bg-[#094058]';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            key="modal"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="text-center py-2">
              <div className="flex justify-center mb-4">
                {getIcon()}
              </div>
              
              {title && (
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                  {title}
                </h2>
              )}
              
              {message && (
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  {message}
                </p>
              )}

              <div className="flex gap-3 justify-center flex-col sm:flex-row">
                {cancelText && (
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm sm:text-base"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`px-5 py-2.5 ${getButtonColor()} text-white rounded-lg font-medium transition text-sm sm:text-base`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

