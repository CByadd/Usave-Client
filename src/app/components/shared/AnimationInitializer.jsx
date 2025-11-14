'use client';

import { useEffect } from 'react';
import { useAnimationStore } from '../../stores/useAnimationStore';

export default function AnimationInitializer() {
  const initReducedMotion = useAnimationStore((state) => state.initReducedMotion);

  useEffect(() => {
    const cleanup = initReducedMotion();
    return cleanup || undefined;
  }, [initReducedMotion]);

  return null;
}














