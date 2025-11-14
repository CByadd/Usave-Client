'use client';
import { useUIStore } from '../../stores/useUIStore';
import LoadingOverlay from './LoadingOverlay';

export default function LoadingOverlayWrapper() {
  const isLoading = useUIStore((state) => state.isLoading);
  const loadingMessage = useUIStore((state) => state.loadingMessage);

  return (
    <LoadingOverlay
      isOpen={isLoading}
      message={loadingMessage}
    />
  );
}














