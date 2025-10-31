import React, { useState, useEffect } from 'react';
import paymentService, { CreatePaymentInput } from '../services/paymentService';
import { supabase } from '../lib/supabase';

interface PaymentPageProps {
  amount: number;
  currency?: string;
  referenceId?: string;
  transactionId?: string;
  paymentType?: 'booking_fee' | 'down_payment' | 'installment' | 'full_payment'; // UPDATE
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
  paymentType = 'booking_fee', // UPDATE: default ke booking_fee
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  const [cardFormData, setCardFormData] = useState<CardFormData>({
    cardNumber: '',
    expiryDate: '',
    securityCode: ''
  });

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
      minimumFractionDigits: 0 // UPDATE: tidak perlu 2 digit desimal untuk IDR
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
      id: 'mandiri',
      name: 'Mandiri Bank Transfer',
      icon: 'https://cdn.midtrans.com/banks/mandiri.png',
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
      errors.cardNumber = 'Nomor kartu wajib diisi';
      isValid = false;
    } else if (!validateCardNumber(cardFormData.cardNumber)) {
      errors.cardNumber = 'Nomor kartu tidak valid';
      isValid = false;
    }

    if (!cardFormData.expiryDate) {
      errors.expiryDate = 'Tanggal kadaluarsa wajib diisi';
      isValid = false;
    } else if (!validateExpiryDate(cardFormData.expiryDate)) {
      errors.expiryDate = 'Tanggal tidak valid atau sudah kadaluarsa';
      isValid = false;
    }

    if (!cardFormData.securityCode) {
      errors.securityCode = 'Kode keamanan wajib diisi';
      isValid = false;
    } else if (cardFormData.securityCode.length < 3) {
      errors.securityCode = 'Kode keamanan tidak valid';
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
      errors.firstName = 'Nama depan wajib diisi';
      isValid = false;
    }

    if (!bankFormData.lastName.trim()) {
      errors.lastName = 'Nama belakang wajib diisi';
      isValid = false;
    }

    if (!bankFormData.email.trim()) {
      errors.email = 'Email wajib diisi';
      isValid = false;
    } else if (!validateEmail(bankFormData.email)) {
      errors.email = 'Email tidak valid';
      isValid = false;
    }

    if (!proofFile) {
      errors.proofFile = 'Bukti pembayaran wajib diupload';
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

    if (!transactionId) {
      if (onPaymentError) {
        onPaymentError(new Error('Transaction ID diperlukan'));
      }
      return;
    }

    setIsLoading(true);

    try {
      // Generate reference code
      const referenceCode = paymentService.generateReferenceCode('PAY');

      let proofUrl: string | undefined = undefined;
      
      // Upload bukti pembayaran untuk bank transfer
      if (selectedMethod.type === 'bank_transfer' && proofFile) {
        try {
          console.log('📤 Memulai upload bukti pembayaran...');
          
          if (!(proofFile instanceof File)) {
            throw new Error('File tidak valid');
          }
          
          const fileExt = proofFile.name.split('.').pop();
          const fileName = `${referenceCode}-${Date.now()}.${fileExt}`;
          const objectKey = `${transactionId}/${fileName}`;

          console.log('🔄 Uploading ke:', objectKey);
          
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('payment-proofs')
            .upload(objectKey, proofFile, { 
              upsert: true, 
              contentType: proofFile.type,
              cacheControl: '3600'
            });

          if (uploadError) {
            console.error('❌ Upload error:', uploadError);
            throw new Error(`Upload gagal: ${uploadError.message}`);
          }

          console.log('✅ Upload berhasil:', uploadData);

          const { data: publicUrlData } = supabase
            .storage
            .from('payment-proofs')
            .getPublicUrl(objectKey);
              
          if (publicUrlData?.publicUrl) {
            proofUrl = publicUrlData.publicUrl;
            console.log('✅ Public URL: ', proofUrl);
          } else {
            throw new Error('Gagal mendapatkan URL publik');
          }
        } catch (uploadErr) {
          console.error('❌ Proses upload gagal:', uploadErr);
          alert(`Gagal upload bukti pembayaran: ${uploadErr instanceof Error ? uploadErr.message : 'Unknown error'}`);
          setIsLoading(false);
          return;
        }
      }

      // Prepare payment data
      const paymentData: CreatePaymentInput = {
        transaction_id: transactionId,
        payment_type: paymentType,
        amount: amount,
        payment_method: selectedMethod.name,
        reference_code: referenceCode,
        gateway_name: selectedMethod.type === 'card' ? 'Adyen' : selectedMethod.name,
        notes: selectedMethod.type === 'card' 
          ? `Pembayaran kartu dengan ${cardFormData.cardNumber.slice(-4)}` 
          : `Transfer bank ke ${selectedMethod.name}`
      };
      
      // Tambahkan proof URL jika ada
      if (proofUrl) {
        paymentData.proof_of_payment = proofUrl;
      }

      // Tambahkan data bank jika bank transfer
      if (selectedMethod.type === 'bank_transfer') {
        paymentData.bank_name = selectedMethod.name;
        paymentData.account_holder = `${bankFormData.firstName} ${bankFormData.lastName}`;
        paymentData.notes = `Transfer bank - Customer: ${bankFormData.email}`;
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

      // Simpan payment ke database
      console.log('💾 Membuat record payment...');
      const result = await paymentService.createPayment(paymentData);

      if (result.success) {
        // Simulasi proses payment gateway untuk card
        if (selectedMethod.type === 'card') {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Simulasi success rate 90% untuk card
          const finalStatus = Math.random() > 0.1 ? 'success' : 'failed';
          
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
              ? 'Pembayaran berhasil!' 
              : 'Pembayaran gagal. Silakan coba lagi.'
          };

          if (onPaymentSuccess && finalStatus === 'success') {
            onPaymentSuccess(successResult);
          } else if (onPaymentError && finalStatus === 'failed') {
            onPaymentError(new Error('Pembayaran gagal'));
          }
        } else {
          // Bank transfer: status 'uploaded', menunggu verifikasi admin
          const successResult = {
            paymentId: result.data && !Array.isArray(result.data) ? result.data.id : undefined,
            referenceCode: referenceCode,
            status: 'uploaded',
            amount: amount,
            paymentMethod: selectedMethod.name,
            message: 'Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.'
          };

          if (onPaymentSuccess) {
            onPaymentSuccess(successResult);
          }
        }
      } else {
        throw new Error(result.message || 'Pembayaran gagal');
      }
    } catch (error) {
      console.error('💥 Payment error:', error);
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-gray-400">🚗</span>
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
            <p className="text-xs text-gray-400 mt-1">
              {paymentType === 'booking_fee' ? 'Biaya Booking' : 
               paymentType === 'down_payment' ? 'Uang Muka' : 
               paymentType === 'full_payment' ? 'Pembayaran Penuh' : 'Cicilan'}
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Pilih Metode Pembayaran
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

                {/* Form untuk CARDS */}
                {selectedPaymentMethod === method.id && method.type === 'card' && (
                  <div className="mt-4 p-6 border-2 border-blue-500 rounded-lg bg-white">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">💳</span>
                      <span className="font-semibold text-gray-900">Pembayaran Kartu</span>
                    </div>

                    <div className="space-y-4">
                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Nomor Kartu
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
                        </div>
                        {formErrors.cardNumber && (
                          <p className="text-xs text-red-500 mt-1">
                            {formErrors.cardNumber}
                          </p>
                        )}
                      </div>

                      {/* Expiry & CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Tanggal Kadaluarsa
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={cardFormData.expiryDate}
                            onChange={handleCardInputChange}
                            className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="MM/YY"
                          />
                          {formErrors.expiryDate && (
                            <p className="text-xs text-red-500 mt-1">
                              {formErrors.expiryDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            name="securityCode"
                            value={cardFormData.securityCode}
                            onChange={handleCardInputChange}
                            className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.securityCode ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="123"
                          />
                          {formErrors.securityCode && (
                            <p className="text-xs text-red-500 mt-1">
                              {formErrors.securityCode}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleConfirmPayment}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? 'Memproses...' : `Bayar ${formatPrice(amount)}`}
                      </button>
                    </div>
                  </div>
                )}

                {/* Form untuk BANK TRANSFER */}
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

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Depan
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={bankFormData.firstName}
                            onChange={handleBankInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nama depan"
                          />
                          {formErrors.firstName && (
                            <p className="text-xs text-red-500 mt-1">
                              {formErrors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Belakang
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={bankFormData.lastName}
                            onChange={handleBankInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nama belakang"
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
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={bankFormData.email}
                          onChange={handleBankInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="email@example.com"
                        />
                        {formErrors.email && (
                          <p className="text-xs text-red-500 mt-1">
                            {formErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bukti Pembayaran *
                        </label>
                        <div className="flex items-center justify-center w-full">
                          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${
                            formErrors.proofFile ? 'border-red-500' : 'border-gray-300'
                          }`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {proofFile ? (
                                <div className="flex flex-col items-center">
                                  <svg className="w-8 h-8 mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  <p className="text-sm text-gray-700 truncate max-w-xs">{proofFile.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                  </svg>
                                  <p className="mb-1 text-sm text-gray-500">
                                    <span className="font-semibold">Klik untuk upload</span>
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    JPG, PNG (Maks. 10MB)
                                  </p>
                                </>
                              )}
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/jpeg,image/jpg,image/png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                
                                if (!file) {
                                  setProofFile(null);
                                  return;
                                }
                                
                                if (file.size > 10 * 1024 * 1024) {
                                  setFormErrors(prev => ({
                                    ...prev,
                                    proofFile: 'Ukuran file maksimal 10MB'
                                  }));
                                  e.target.value = '';
                                  return;
                                }
                                
                                const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                                if (!validTypes.includes(file.type)) {
                                  setFormErrors(prev => ({
                                    ...prev,
                                    proofFile: 'Format file harus JPG atau PNG'
                                  }));
                                  e.target.value = '';
                                  return;
                                }
                                
                                setProofFile(file);
                                
                                if (formErrors.proofFile) {
                                  setFormErrors(prev => {
                                    const newErrors = {...prev};
                                    delete newErrors.proofFile;
                                    return newErrors;
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                        {formErrors.proofFile && (
                          <p className="text-xs text-red-500 mt-1">
                            {formErrors.proofFile}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleConfirmPayment}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Pembayaran aman dan terenkripsi
          </p>
        </div>
      </div>
    </div>
  );
};

export default HalamanPembayaran;