"use client";

import { create } from 'zustand';

/**
 * Global store for managing the ReviewOrderModal.
 * This allows the modal to be triggered from anywhere and ensures it resides
 * at the root of the application (usually layout.js).
 */
export const useReviewStore = create((set) => ({
    isOpen: false,
    order: null,
    onSubmitted: null,

    /**
     * Opens the review modal for a specific order.
     * @param {Object} order - The order to be reviewed.
     * @param {Function} onSubmitted - Optional callback for when a review is submitted.
     */
    openReviewModal: (order, onSubmitted = null) => set({
        isOpen: true,
        order,
        onSubmitted,
    }),

    /**
     * Closes the review modal and resets its state.
     */
    closeReviewModal: () => set({
        isOpen: false,
        order: null,
        onSubmitted: null,
    }),
}));
