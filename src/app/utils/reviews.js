export const REVIEWABLE_ORDER_STATUSES = new Set(['DELIVERED', 'COMPLETED']);
export const REVIEWABLE_PAYMENT_STATUSES = new Set(['COMPLETED', 'PAID', 'RECEIVED']);

const normaliseStatus = (value) => (typeof value === 'string' ? value.toUpperCase() : value);

export const getPendingReviewCount = (order) => {
  const items = Array.isArray(order?.items) ? order.items : null;
  if (!items || items.length === 0) return null;
  return items.filter(
    (item) => !item.review || normaliseStatus(item.review?.status) !== 'APPROVED'
  ).length;
};

export const isOrderReviewEligible = (order) => {
  if (!order) return false;
  const statusEligible = REVIEWABLE_ORDER_STATUSES.has(normaliseStatus(order.status));
  const paymentEligible = REVIEWABLE_PAYMENT_STATUSES.has(normaliseStatus(order.paymentStatus));
  if (!statusEligible && !paymentEligible) {
    return false;
  }
  const pendingCount = getPendingReviewCount(order);
  return pendingCount === null ? true : pendingCount > 0;
};

export const normalisePaymentStatus = (status) => normaliseStatus(status);

