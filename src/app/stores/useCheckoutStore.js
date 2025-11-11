"use client";

import { create } from 'zustand';

const createDefaultFormData = () => ({
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
});

const createDefaultCheckoutState = () => ({
  shippingOption: 'delivery',
  warranty: '',
  deliveryDate: '',
  deliveryTime: '',
  cartExpanded: true,
  formData: createDefaultFormData(),
});

export const useCheckoutStore = create((set, get) => {
  const initialCheckout = createDefaultCheckoutState();

  return {
    // Checkout state
    shippingOption: initialCheckout.shippingOption,
    warranty: initialCheckout.warranty,
    deliveryDate: initialCheckout.deliveryDate,
    deliveryTime: initialCheckout.deliveryTime,
    cartExpanded: initialCheckout.cartExpanded,
    formData: initialCheckout.formData,
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
    },

    // Set warranty
    setWarranty: (warranty) => {
      set({ warranty });
    },

    // Set delivery date
    setDeliveryDate: (date) => {
      set({ deliveryDate: date });
    },

    // Set delivery time
    setDeliveryTime: (time) => {
      set({ deliveryTime: time });
    },

    // Toggle cart expanded
    toggleCartExpanded: () => {
      const { cartExpanded } = get();
      set({ cartExpanded: !cartExpanded });
    },

    // Set cart expanded
    setCartExpanded: (expanded) => {
      set({ cartExpanded: expanded });
    },

    // Set form data
    setFormData: (formData) => {
      set({ formData });
    },

    // Update form field
    updateFormField: (field, value) => {
      const { formData } = get();
      const newFormData = { ...formData, [field]: value };
      set({ formData: newFormData });
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
        ...createDefaultCheckoutState(),
        errors: {},
        isSubmitting: false,
        showApprovalModal: false,
        approvalModalData: null,
        showErrorModal: false,
        showSuccessModal: false,
        errorMessage: '',
        orderId: null,
      };
      set(defaultState);
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

