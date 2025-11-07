"use client";

import { create } from 'zustand';

const CHECKOUT_STORAGE_KEY = 'usave_checkout';

// Load checkout state from localStorage
const loadCheckoutFromStorage = () => {
  if (typeof window === 'undefined') {
    return {
      shippingOption: 'delivery-only',
      warranty: '',
      cartExpanded: true,
      formData: {},
    };
  }
  
  try {
    const stored = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading checkout from localStorage:', err);
  }
  
  return {
    shippingOption: 'delivery-only',
    warranty: '',
    cartExpanded: true,
    formData: {},
  };
};

// Save checkout state to localStorage
const saveCheckoutToStorage = (state) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify({
      shippingOption: state.shippingOption,
      warranty: state.warranty,
      deliveryDate: state.deliveryDate,
      deliveryTime: state.deliveryTime,
      cartExpanded: state.cartExpanded,
      formData: state.formData,
    }));
  } catch (err) {
    console.error('Error saving checkout to localStorage:', err);
  }
};

export const useCheckoutStore = create((set, get) => {
  // Initialize from localStorage
  const initialCheckout = loadCheckoutFromStorage();
  
  return {
    // Checkout state
    shippingOption: initialCheckout.shippingOption || 'delivery',
    warranty: initialCheckout.warranty || '',
    deliveryDate: initialCheckout.deliveryDate || '',
    deliveryTime: initialCheckout.deliveryTime || '',
    cartExpanded: initialCheckout.cartExpanded !== undefined ? initialCheckout.cartExpanded : true,
    formData: initialCheckout.formData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Australia',
    },
    errors: {},
    isSubmitting: false,
    showApprovalModal: false,
    approvalModalData: null,
    showErrorModal: false,
    showSuccessModal: false,
    errorMessage: '',
    orderId: null,

    // Set shipping option
    setShippingOption: (option) => {
      set({ shippingOption: option });
      saveCheckoutToStorage({ ...get(), shippingOption: option });
    },

    // Set warranty
    setWarranty: (warranty) => {
      set({ warranty });
      saveCheckoutToStorage({ ...get(), warranty });
    },

    // Set delivery date
    setDeliveryDate: (date) => {
      set({ deliveryDate: date });
      saveCheckoutToStorage({ ...get(), deliveryDate: date });
    },

    // Set delivery time
    setDeliveryTime: (time) => {
      set({ deliveryTime: time });
      saveCheckoutToStorage({ ...get(), deliveryTime: time });
    },

    // Toggle cart expanded
    toggleCartExpanded: () => {
      const { cartExpanded } = get();
      set({ cartExpanded: !cartExpanded });
      saveCheckoutToStorage({ ...get(), cartExpanded: !cartExpanded });
    },

    // Set cart expanded
    setCartExpanded: (expanded) => {
      set({ cartExpanded: expanded });
      saveCheckoutToStorage({ ...get(), cartExpanded: expanded });
    },

    // Set form data
    setFormData: (formData) => {
      set({ formData });
      saveCheckoutToStorage({ ...get(), formData });
    },

    // Update form field
    updateFormField: (field, value) => {
      const { formData } = get();
      const newFormData = { ...formData, [field]: value };
      set({ formData: newFormData });
      saveCheckoutToStorage({ ...get(), formData: newFormData });
    },

    // Set errors
    setErrors: (errors) => {
      set({ errors });
    },

    // Clear errors
    clearErrors: () => {
      set({ errors: {} });
    },

    // Set error for field
    setFieldError: (field, error) => {
      const { errors } = get();
      set({ errors: { ...errors, [field]: error } });
    },

    // Set is submitting
    setIsSubmitting: (isSubmitting) => {
      set({ isSubmitting });
    },

    // Show approval modal
    showApproval: (data = null) => {
      set({ showApprovalModal: true, approvalModalData: data });
    },

    // Hide approval modal
    hideApproval: () => {
      set({ showApprovalModal: false, approvalModalData: null });
    },

    // Show error modal
    showError: (message) => {
      set({ showErrorModal: true, errorMessage: message });
    },

    // Hide error modal
    hideError: () => {
      set({ showErrorModal: false, errorMessage: '' });
    },

    // Show success modal
    showSuccess: (orderId) => {
      set({ showSuccessModal: true, orderId });
    },

    // Hide success modal
    hideSuccess: () => {
      set({ showSuccessModal: false, orderId: null });
    },

    // Reset checkout state
    reset: () => {
      const defaultState = {
        shippingOption: 'delivery-only',
        warranty: '',
        cartExpanded: true,
        formData: {},
        errors: {},
        isSubmitting: false,
        showApprovalModal: false,
        showErrorModal: false,
        showSuccessModal: false,
        errorMessage: '',
        orderId: null,
      };
      set(defaultState);
      saveCheckoutToStorage(defaultState);
    },
  };
});

// Export a hook that matches a simple API
export const useCheckout = () => {
  const shippingOption = useCheckoutStore((state) => state.shippingOption);
  const warranty = useCheckoutStore((state) => state.warranty);
  const deliveryDate = useCheckoutStore((state) => state.deliveryDate);
  const deliveryTime = useCheckoutStore((state) => state.deliveryTime);
  const cartExpanded = useCheckoutStore((state) => state.cartExpanded);
  const formData = useCheckoutStore((state) => state.formData);
  const errors = useCheckoutStore((state) => state.errors);
  const isSubmitting = useCheckoutStore((state) => state.isSubmitting);
  const showApprovalModal = useCheckoutStore((state) => state.showApprovalModal);
  const approvalModalData = useCheckoutStore((state) => state.approvalModalData);
  const showErrorModal = useCheckoutStore((state) => state.showErrorModal);
  const showSuccessModal = useCheckoutStore((state) => state.showSuccessModal);
  const errorMessage = useCheckoutStore((state) => state.errorMessage);
  const orderId = useCheckoutStore((state) => state.orderId);

  const setShippingOption = useCheckoutStore((state) => state.setShippingOption);
  const setWarranty = useCheckoutStore((state) => state.setWarranty);
  const setDeliveryDate = useCheckoutStore((state) => state.setDeliveryDate);
  const setDeliveryTime = useCheckoutStore((state) => state.setDeliveryTime);
  const toggleCartExpanded = useCheckoutStore((state) => state.toggleCartExpanded);
  const setCartExpanded = useCheckoutStore((state) => state.setCartExpanded);
  const setFormData = useCheckoutStore((state) => state.setFormData);
  const updateFormField = useCheckoutStore((state) => state.updateFormField);
  const setErrors = useCheckoutStore((state) => state.setErrors);
  const clearErrors = useCheckoutStore((state) => state.clearErrors);
  const setFieldError = useCheckoutStore((state) => state.setFieldError);
  const setIsSubmitting = useCheckoutStore((state) => state.setIsSubmitting);
  const showApproval = useCheckoutStore((state) => state.showApproval);
  const hideApproval = useCheckoutStore((state) => state.hideApproval);
  const showError = useCheckoutStore((state) => state.showError);
  const hideError = useCheckoutStore((state) => state.hideError);
  const showSuccess = useCheckoutStore((state) => state.showSuccess);
  const hideSuccess = useCheckoutStore((state) => state.hideSuccess);
  const reset = useCheckoutStore((state) => state.reset);

  return {
    shippingOption,
    warranty,
    deliveryDate,
    deliveryTime,
    cartExpanded,
    formData,
    errors,
    isSubmitting,
    showApprovalModal,
    approvalModalData,
    showErrorModal,
    showSuccessModal,
    errorMessage,
    orderId,
    setShippingOption,
    setWarranty,
    setDeliveryDate,
    setDeliveryTime,
    toggleCartExpanded,
    setCartExpanded,
    setFormData,
    updateFormField,
    setErrors,
    clearErrors,
    setFieldError,
    setIsSubmitting,
    showApproval,
    hideApproval,
    showError,
    hideError,
    showSuccess,
    hideSuccess,
    reset,
  };
};

