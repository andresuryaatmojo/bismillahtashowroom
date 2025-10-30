import React, { useState, useEffect } from 'react';
import paymentService, { Payment } from '../services/paymentService';

interface PaymentHistoryProps {
  transactionId?: string;
  userId?: string;
  limit?: number;
  showFilters?: boolean;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  transactionId,
  userId,
  limit = 10,
  showFilters = true
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<Payment['status'] | 'all'>('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<Payment['payment_type'] | 'all'>('all');

  useEffect(() => {
    fetchPayments();
  }, [transactionId, currentPage, statusFilter, paymentTypeFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (transactionId) {
        result = await paymentService.getPaymentsByTransactionId(transactionId);
      } else if (statusFilter !== 'all') {
        result = await paymentService.getPaymentsByStatus(statusFilter);
      } else {
        result = await paymentService.getAllPayments(currentPage, limit);
      }

      if (result.success && result.data) {
        let paymentsData = Array.isArray(result.data) ? result.data : [result.data];
        
        // Apply filters
        if (paymentTypeFilter !== 'all') {
          paymentsData = paymentsData.filter(p => p.payment_type === paymentTypeFilter);
        }

        setPayments(paymentsData);
      } else {
        setError(result.message || 'Failed to fetch payments');
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
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
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
            onClick={fetchPayments}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
        <button
          onClick={fetchPayments}
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Payment['status'] | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
            <select
              value={paymentTypeFilter}
              onChange={(e) => setPaymentTypeFilter(e.target.value as Payment['payment_type'] | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="down_payment">Down Payment</option>
              <option value="installment">Installment</option>
              <option value="full_payment">Full Payment</option>
              <option value="remaining_payment">Remaining Payment</option>
            </select>
          </div>
        </div>
      )}

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">💳</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Found</h3>
          <p className="text-gray-600">No payment history available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getStatusIcon(payment.status)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {payment.payment_type.replace('_', ' ')} • {payment.payment_method}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {payment.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Reference:</span>
                  <p className="font-mono text-xs">{payment.reference_code}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p>{formatDate(payment.payment_date)}</p>
                </div>
                {payment.bank_name && (
                  <div>
                    <span className="text-gray-500">Bank:</span>
                    <p>{payment.bank_name}</p>
                  </div>
                )}
                {payment.gateway_transaction_id && (
                  <div>
                    <span className="text-gray-500">Gateway ID:</span>
                    <p className="font-mono text-xs">{payment.gateway_transaction_id}</p>
                  </div>
                )}
              </div>

              {payment.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-gray-500 text-sm">Notes:</span>
                  <p className="text-sm text-gray-700">{payment.notes}</p>
                </div>
              )}

              {payment.rejection_reason && (
                <div className="mt-3 pt-3 border-t border-red-100 bg-red-50 rounded p-2">
                  <span className="text-red-700 text-sm font-medium">Rejection Reason:</span>
                  <p className="text-sm text-red-600">{payment.rejection_reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!transactionId && payments.length === limit && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-gray-600">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={payments.length < limit}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;