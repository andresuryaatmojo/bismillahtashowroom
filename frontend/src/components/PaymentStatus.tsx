import React, { useState, useEffect } from 'react';
import paymentService, { Payment } from '../services/paymentService';

interface PaymentStatusProps {
  paymentId?: string;
  referenceCode?: string;
  transactionId?: string;
  onStatusUpdate?: (payment: Payment) => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  paymentId,
  referenceCode,
  transactionId,
  onStatusUpdate
}) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentStatus();
  }, [paymentId, referenceCode, transactionId]);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (paymentId) {
        result = await paymentService.getPaymentById(paymentId);
      } else if (referenceCode) {
        result = await paymentService.getPaymentByReferenceCode(referenceCode);
      } else if (transactionId) {
        const paymentsResult = await paymentService.getPaymentsByTransactionId(transactionId);
        if (paymentsResult.success && Array.isArray(paymentsResult.data) && paymentsResult.data.length > 0) {
          result = { success: true, data: paymentsResult.data[0], message: 'Payment found' };
        } else {
          result = { success: false, message: 'No payments found' };
        }
      } else {
        setError('Payment ID, reference code, or transaction ID is required');
        return;
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        setPayment(result.data);
        if (onStatusUpdate) {
          onStatusUpdate(result.data);
        }
      } else {
        setError(result.message || 'Payment not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      case 'refunded':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'processing':
        return '⏳';
      case 'pending':
        return '⏰';
      case 'failed':
        return '❌';
      case 'expired':
        return '⏰';
      case 'refunded':
        return '↩️';
      default:
        return '❓';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPaymentStatus}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Not Found</h3>
          <p className="text-gray-600">No payment information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Payment Status</h2>
        <button
          onClick={fetchPaymentStatus}
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">{getStatusIcon(payment.status)}</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
          {payment.status.toUpperCase()}
        </span>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Payment Type</label>
            <p className="text-gray-900 capitalize">{payment.payment_type.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Payment Method</label>
            <p className="text-gray-900">{payment.payment_method}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Reference Code</label>
            <p className="text-gray-900 font-mono text-sm">{payment.reference_code}</p>
          </div>
        </div>

        {payment.bank_name && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Bank</label>
              <p className="text-gray-900">{payment.bank_name}</p>
            </div>
            {payment.account_holder && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Account Holder</label>
                <p className="text-gray-900">{payment.account_holder}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Payment Date</label>
            <p className="text-gray-900">{formatDate(payment.payment_date)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
            <p className="text-gray-900">{formatDate(payment.created_at)}</p>
          </div>
        </div>

        {payment.verified_at && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Verified At</label>
              <p className="text-gray-900">{formatDate(payment.verified_at)}</p>
            </div>
            {payment.verified_by && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Verified By</label>
                <p className="text-gray-900">{payment.verified_by}</p>
              </div>
            )}
          </div>
        )}

        {payment.gateway_transaction_id && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Gateway Transaction ID</label>
            <p className="text-gray-900 font-mono text-sm">{payment.gateway_transaction_id}</p>
          </div>
        )}

        {payment.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
            <p className="text-gray-900">{payment.notes}</p>
          </div>
        )}

        {payment.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-red-700 mb-1">Rejection Reason</label>
            <p className="text-red-600">{payment.rejection_reason}</p>
          </div>
        )}

        {payment.proof_of_payment && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Proof of Payment</label>
            <img
              src={payment.proof_of_payment}
              alt="Proof of Payment"
              className="max-w-full h-auto rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;