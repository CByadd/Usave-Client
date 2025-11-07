'use client';

import { useCheckoutStore } from '../../stores/useCheckoutStore';
import ApprovalModal from '../checkout/ApprovalModal';

export default function ApprovalModalWrapper() {
  const showApprovalModal = useCheckoutStore((state) => state.showApprovalModal);
  const hideApproval = useCheckoutStore((state) => state.hideApproval);
  const approvalModalData = useCheckoutStore((state) => state.approvalModalData);

  return (
    <ApprovalModal
      isOpen={showApprovalModal}
      onClose={hideApproval}
      onContinueWithoutApproval={approvalModalData?.onContinueWithoutApproval || (() => {})}
      cartItems={approvalModalData?.cartItems || []}
      totalAmount={approvalModalData?.totalAmount || 0}
      flowType={approvalModalData?.flowType || 'owner'}
      shippingAddress={approvalModalData?.shippingAddress || null}
      subtotal={approvalModalData?.subtotal || 0}
      tax={approvalModalData?.tax || 0}
      shipping={approvalModalData?.shipping || 0}
      warranty={approvalModalData?.warranty || 0}
    />
  );
}



