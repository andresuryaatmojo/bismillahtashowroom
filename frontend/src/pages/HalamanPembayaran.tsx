import React, { useState, useEffect } from 'react';
import paymentService, { CreatePaymentInput } from '../services/paymentService';

interface PaymentPageProps {
  amount: number;
  currency?: string;
  referenceId?: string;
  transactionId?: string; // Tambahan untuk transaction_id
  paymentType?: 'down_payment' | 'installment' | 'full_payment' | 'remaining_payment';
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: any) => void;
}

interface CardFormData {
  cardNumber: string;
  expiryDate: string;
  securityCode: string;
}

interface BankTransferFormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface FormErrors {
  [key: string]: string;
}

const HalamanPembayaran: React.FC<PaymentPageProps> = ({
  amount,
  currency = 'IDR',
  referenceId,
  transactionId,
  paymentType = 'full_payment',
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  
  // Form state untuk Card
  const [cardFormData, setCardFormData] = useState<CardFormData>({
    cardNumber: '',
    expiryDate: '',
    securityCode: ''
  });

  // Form state untuk Bank Transfer
  const [bankFormData, setBankFormData] = useState<BankTransferFormData>({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Format harga
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Format card number dengan spasi setiap 4 digit
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date MM/YY
  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    
    return v;
  };

  // Daftar metode pembayaran yang tersedia
  const paymentMethods = [
    {
      id: 'cards',
      name: 'Cards',
      icon: '💳',
      logos: ['mastercard', 'visa'],
      type: 'card'
    },
    {
      id: 'bca',
      name: 'BCA Bank Transfer',
      icon: 'https://cdn.midtrans.com/banks/bca.png',
      type: 'bank_transfer'
    },
    {
      id: 'bni',
      name: 'BNI Bank Transfer',
      icon: 'https://cdn.midtrans.com/banks/bni.png',
      type: 'bank_transfer'
    },
    {
      id: 'bri',
      name: 'BRI Bank Transfer',
      icon: 'https://cdn.midtrans.com/banks/bri.png',
      type: 'bank_transfer'
    },
    {
      id: 'cimb',
      name: 'CIMB Bank Transfer',
      icon: 'https://cdn.midtrans.com/banks/cimb.png',
      type: 'bank_transfer'
    },
    {
      id: 'danamon',
      name: 'Danamon Bank Transfer',
      icon: 'https://cdn.midtrans.com/banks/danamon.png',
      type: 'bank_transfer'
    },
    {
      id: 'mandiri',
      name: 'Mandiri Bank Transfer',
      icon: 'https://cdn.midtrans.com/banks/mandiri.png',
      type: 'bank_transfer'
    },
    {
      id: 'permata',
      name: 'Permata Bank Transfer',
      icon: 'https://cdn.midtrans.com/banks/permata.png',
      type: 'bank_transfer'
    }
  ];

  // Validasi email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validasi card number (Luhn algorithm)
  const validateCardNumber = (cardNumber: string): boolean => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.length < 13 || number.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // Validasi expiry date
  const validateExpiryDate = (expiryDate: string): boolean => {
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) return false;

    const [month, year] = expiryDate.split('/').map(num => parseInt(num, 10));
    
    if (month < 1 || month > 12) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  };

  // Handle perubahan input card
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 19) return;
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
      if (formattedValue.replace(/\//g, '').length > 4) return;
    } else if (name === 'securityCode') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    setCardFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle perubahan input bank transfer
  const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validasi form card
  const validateCardForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!cardFormData.cardNumber) {
      errors.cardNumber = 'Card number is required';
      isValid = false;
    } else if (!validateCardNumber(cardFormData.cardNumber)) {
      errors.cardNumber = 'Invalid card number';
      isValid = false;
    }

    if (!cardFormData.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
      isValid = false;
    } else if (!validateExpiryDate(cardFormData.expiryDate)) {
      errors.expiryDate = 'Invalid or expired date';
      isValid = false;
    }

    if (!cardFormData.securityCode) {
      errors.securityCode = 'Security code is required';
      isValid = false;
    } else if (cardFormData.securityCode.length < 3) {
      errors.securityCode = 'Invalid security code';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Validasi form bank transfer
  const validateBankForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!bankFormData.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }

    if (!bankFormData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!bankFormData.email.trim()) {
      errors.email = 'Email address is required';
      isValid = false;
    } else if (!validateEmail(bankFormData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle konfirmasi pembayaran
  const handleConfirmPayment = async () => {
    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    
    if (!selectedMethod) return;

    // Validasi berdasarkan tipe payment
    if (selectedMethod.type === 'card') {
      if (!validateCardForm()) return;
    } else if (selectedMethod.type === 'bank_transfer') {
      if (!validateBankForm()) return;
    }

    // Validasi transaction_id diperlukan
    if (!transactionId) {
      if (onPaymentError) {
        onPaymentError(new Error('Transaction ID is required'));
      }
      return;
    }

    setIsLoading(true);

    try {
      // Generate reference code
      const referenceCode = paymentService.generateReferenceCode('PAY');

      // Prepare payment data
      const paymentData: CreatePaymentInput = {
        transaction_id: transactionId,
        payment_type: paymentType,
        amount: amount,
        payment_method: selectedMethod.name,
        reference_code: referenceCode,
        gateway_name: selectedMethod.type === 'card' ? 'Adyen' : selectedMethod.name,
        notes: selectedMethod.type === 'card' 
          ? `Card payment with ${cardFormData.cardNumber.slice(-4)}` 
          : `Bank transfer to ${selectedMethod.name}`
      };

      // Tambahkan data bank jika bank transfer
      if (selectedMethod.type === 'bank_transfer') {
        paymentData.bank_name = selectedMethod.name;
        paymentData.account_holder = `${bankFormData.firstName} ${bankFormData.lastName}`;
        paymentData.notes = `Bank transfer - Customer: ${bankFormData.email}`;
      }

      // Tambahkan gateway transaction ID jika card
      if (selectedMethod.type === 'card') {
        paymentData.gateway_transaction_id = `ADY-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        paymentData.gateway_response = {
          cardType: cardFormData.cardNumber.startsWith('4') ? 'VISA' : 'MASTERCARD',
          lastFourDigits: cardFormData.cardNumber.replace(/\s/g, '').slice(-4),
          expiryDate: cardFormData.expiryDate
        };
      }

      // Simpan payment ke Supabase
      const result = await paymentService.createPayment(paymentData);

      if (result.success) {
        // Simulasi proses payment gateway
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update status berdasarkan metode pembayaran
        let finalStatus: 'success' | 'processing' | 'failed' = 'processing';
        
        if (selectedMethod.type === 'card') {
          // Simulasi success rate 90% untuk card
          finalStatus = Math.random() > 0.1 ? 'success' : 'failed';
        } else {
          // Bank transfer selalu processing (menunggu konfirmasi manual)
          finalStatus = 'processing';
        }

        // Update payment status
        if (result.data && !Array.isArray(result.data) && result.data.id) {
          await paymentService.updatePayment(result.data.id, {
            status: finalStatus,
            gateway_transaction_id: paymentData.gateway_transaction_id
          });
        }

        const successResult = {
          paymentId: result.data && !Array.isArray(result.data) ? result.data.id : undefined,
          referenceCode: referenceCode,
          status: finalStatus,
          amount: amount,
          paymentMethod: selectedMethod.name,
          message: finalStatus === 'success' 
            ? 'Payment completed successfully!' 
            : 'Payment is being processed. You will receive confirmation shortly.'
        };

        if (onPaymentSuccess) {
          onPaymentSuccess(successResult);
        }
      } else {
        throw new Error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header dengan logo placeholder */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-gray-400">🏪</span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {formatPrice(amount)}
            </h1>
            {referenceId && (
              <p className="text-sm text-gray-500 mt-2">
                Ref: {referenceId}
              </p>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            HOW WOULD YOU LIKE TO PAY?
          </h2>

          {/* Payment Method List */}
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div key={method.id}>
                <button
                  onClick={() => {
                    setSelectedPaymentMethod(
                      selectedPaymentMethod === method.id ? '' : method.id
                    );
                    setFormErrors({});
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {method.icon.startsWith('http') ? (
                      <img 
                        src={method.icon} 
                        alt={method.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="text-2xl">{method.icon}</span>
                    )}
                    <span className="font-medium text-gray-900">
                      {method.name}
                    </span>
                  </div>

                  {method.id === 'cards' && (
                    <div className="flex gap-2">
                      <div className="w-10 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                        MC
                      </div>
                      <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        VISA
                      </div>
                    </div>
                  )}
                </button>

                {/* Expanded form untuk CARDS */}
                {selectedPaymentMethod === method.id && method.type === 'card' && (
                  <div className="mt-4 p-6 border-2 border-blue-500 rounded-lg bg-white">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">💳</span>
                      <span className="font-semibold text-gray-900">Cards</span>
                    </div>

                    <p className="text-xs text-gray-600 mb-4">
                      All fields are required unless marked otherwise.
                    </p>

                    <div className="space-y-4">
                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Card number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="cardNumber"
                            value={cardFormData.cardNumber}
                            onChange={handleCardInputChange}
                            className={`w-full px-3 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="1234 5678 9012 3456"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="2"/>
                              <path d="M3 10h18" strokeWidth="2"/>
                            </svg>
                          </div>
                        </div>
                        {formErrors.cardNumber && (
                          <p className="text-xs text-red-500 mt-1">
                            {formErrors.cardNumber}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <div className="w-8 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                          <div className="w-8 h-5 bg-blue-600 rounded"></div>
                        </div>
                      </div>

                      {/* Expiry Date & Security Code */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Expiry date
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="expiryDate"
                              value={cardFormData.expiryDate}
                              onChange={handleCardInputChange}
                              className={`w-full px-3 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                formErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="MM/YY"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
                                <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2"/>
                              </svg>
                            </div>
                          </div>
                          {formErrors.expiryDate && (
                            <p className="text-xs text-red-500 mt-1">
                              {formErrors.expiryDate}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Front of card in MM/YY format
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Security code
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="securityCode"
                              value={cardFormData.securityCode}
                              onChange={handleCardInputChange}
                              className={`w-full px-3 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                formErrors.securityCode ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="123"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="2"/>
                                <circle cx="15" cy="12" r="2" strokeWidth="2"/>
                              </svg>
                            </div>
                          </div>
                          {formErrors.securityCode && (
                            <p className="text-xs text-red-500 mt-1">
                              {formErrors.securityCode}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            3 digits on back of card
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleConfirmPayment}
                        disabled={isLoading}
                        className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {isLoading ? 'Processing...' : `Pay ${formatPrice(amount)}`}
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded form untuk BANK TRANSFER */}
                {selectedPaymentMethod === method.id && method.type === 'bank_transfer' && (
                  <div className="mt-4 p-6 border-2 border-blue-500 rounded-lg bg-white">
                    <div className="flex items-center gap-2 mb-4">
                      <img 
                        src={method.icon} 
                        alt={method.name}
                        className="w-10 h-10 object-contain"
                      />
                      <span className="font-semibold text-gray-900">
                        {method.name}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-4">
                      All fields are required unless marked otherwise
                    </p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={bankFormData.firstName}
                            onChange={handleBankInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="First name"
                          />
                          {formErrors.firstName && (
                            <p className="text-xs text-red-500 mt-1">
                              {formErrors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={bankFormData.lastName}
                            onChange={handleBankInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Last name"
                          />
                          {formErrors.lastName && (
                            <p className="text-xs text-red-500 mt-1">
                              {formErrors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={bankFormData.email}
                          onChange={handleBankInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="your.email@example.com"
                        />
                        {formErrors.email && (
                          <p className="text-xs text-red-500 mt-1">
                            {formErrors.email}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleConfirmPayment}
                        disabled={isLoading}
                        className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Processing...' : 'Confirm purchase'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Language selector */}
        <div className="mt-6 flex justify-end gap-4">
          <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
            🌐 English
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900">
            Indonesia
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secured by Adyen Payment Gateway
          </p>
        </div>
      </div>
    </div>
  );
};

export default HalamanPembayaran;