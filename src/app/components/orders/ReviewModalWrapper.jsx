'use client';

import React from 'react';
import { useReviewStore } from '../../stores/useReviewStore';
import ReviewOrderModal from './ReviewOrderModal';

/**
 * ReviewModalWrapper is a global component that renders the ReviewOrderModal
 * using state from the useReviewStore.
 * It should be placed in the RootLayout.
 */
export default function ReviewModalWrapper() {
    const { isOpen, order, onSubmitted, closeReviewModal } = useReviewStore();

    if (!isOpen) return null;

    return (
        <ReviewOrderModal
            isOpen={isOpen}
            onClose={closeReviewModal}
            order={order}
            onSubmitted={onSubmitted}
        />
    );
}
