'use client';
import { useUIStore } from '../../stores/useUIStore';
import AlertModal from './AlertModal';

export default function AlertModalWrapper() {
  const alertModal = useUIStore((state) => state.alertModal);
  const closeAlert = useUIStore((state) => state.closeAlert);

  const handleConfirm = () => {
    if (alertModal.onConfirm) {
      alertModal.onConfirm();
    }
    closeAlert();
  };

  const handleCancel = () => {
    if (alertModal.onCancel) {
      alertModal.onCancel();
    }
    closeAlert();
  };

  return (
    <AlertModal
      isOpen={alertModal.isOpen}
      onClose={closeAlert}
      title={alertModal.title}
      message={alertModal.message}
      type={alertModal.type}
      confirmText={alertModal.confirmText}
      cancelText={alertModal.cancelText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}




