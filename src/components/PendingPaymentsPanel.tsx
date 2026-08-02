import React, { useEffect, useState } from 'react';
import { CheckIcon, XIcon, ExternalLinkIcon, Loader2Icon } from 'lucide-react';
import { subscribeToPendingPayments, approvePendingPayment, rejectPendingPayment } from '../services/fundingService';
import type { PendingPayment } from '../types/epay';

export function PendingPaymentsPanel() {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToPendingPayments(setPendingPayments);
  }, []);

  const handleApprove = async (payment: PendingPayment) => {
    if (processingId) return;
    
    if (!confirm(`Approve payment of Rs ${payment.amount} from ${payment.donorName}?`)) {
      return;
    }

    setProcessingId(payment.id);
    try {
      await approvePendingPayment(payment.id);
    } catch (error) {
      alert('Failed to approve payment. Please try again.');
      console.error('Approval error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (payment: PendingPayment) => {
    if (processingId) return;
    
    if (!confirm(`Reject payment of Rs ${payment.amount} from ${payment.donorName}?`)) {
      return;
    }

    setProcessingId(payment.id);
    try {
      await rejectPendingPayment(payment.id);
    } catch (error) {
      alert('Failed to reject payment. Please try again.');
      console.error('Rejection error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingPayments.length === 0) {
    return (
      <div className="rounded-[8px] border border-black bg-[#F5F5F5] p-6">
        <h2 className="mb-4 font-didot text-2xl text-black">Pending Payments</h2>
        <p className="font-jeju text-base text-black/60">No pending payments to review.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border border-black bg-[#F5F5F5] p-6">
      <h2 className="mb-4 font-didot text-2xl text-black">
        Pending Payments ({pendingPayments.length})
      </h2>
      
      <div className="flex flex-col gap-4">
        {pendingPayments.map((payment) => (
          <div
            key={payment.id}
            className="rounded-[8px] border border-black bg-white p-4 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
            
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Screenshot Preview */}
              {payment.screenshotUrl && (
                <div className="shrink-0">
                  <a
                    href={payment.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block h-32 w-32 overflow-hidden rounded border border-black">
                    <img
                      src={payment.screenshotUrl}
                      alt="Payment screenshot"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <ExternalLinkIcon className="h-6 w-6 text-white" />
                    </div>
                  </a>
                </div>
              )}

              {/* Payment Details */}
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-jeju text-xl font-bold text-black">
                      Rs {payment.amount}
                    </p>
                    <p className="font-jeju text-base text-black">
                      from <span className="font-bold">{payment.donorName}</span>
                    </p>
                  </div>
                  <p className="font-jeju text-xs text-black/60">
                    {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>

                {payment.message && (
                  <p className="font-jeju text-sm italic text-black/70">
                    "{payment.message}"
                  </p>
                )}

                {/* Action Buttons */}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(payment)}
                    disabled={processingId !== null}
                    className="flex items-center gap-2 rounded-[5px] border border-black bg-[#2E7D32] px-4 py-2 font-jeju text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
                    {processingId === payment.id ? (
                      <>
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        Approve
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReject(payment)}
                    disabled={processingId !== null}
                    className="flex items-center gap-2 rounded-[5px] border border-black bg-[#B3261E] px-4 py-2 font-jeju text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
                    {processingId === payment.id ? (
                      <>
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <XIcon className="h-4 w-4" />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
