import React, { useState, useEffect } from 'react';
import API from '../../../api/axiosConfig';

const ExpenseModal = ({ onClose, refreshData, initialData = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    vendorName: '',
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    amountBeforeVAT: '',
    vatRate: '13',
    discountRate: '',
    tdsRate: '',
    amountPaid: '',
    paymentMode: 'CASH',
    transactionId: '',
    chequeNumber: '',
    bankName: '',
    billAttachment: null
  });

  const [vendors, setVendors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const fetchVendors = async () => {
      try {
        const response = await API.get('/vendors');
        const vendorList = response.data?.data || [];
        setVendors(vendorList);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        showNotification('error', 'Failed to load vendors');
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Populate form on edit
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => {
        const base = { ...prev };
        const amt = initialData.amountBeforeVAT || 0;
        const safeRate = (amount) =>
          amt > 0 && amount != null ? ((amount * 100) / amt).toFixed(2) : '';

        return {
          ...base,
          vendorName: initialData.vendor?.name || initialData.vendorName || '',
          billNumber: initialData.billNumber || '',
          billDate: initialData.billDate
            ? new Date(initialData.billDate).toISOString().split('T')[0]
            : base.billDate,
          amountBeforeVAT: initialData.amountBeforeVAT ?? '',
          vatRate: safeRate(initialData.vatAmount),
          discountRate: safeRate(initialData.discount),
          tdsRate: safeRate(initialData.tdsAmount),
          amountPaid: initialData.amountPaid ?? '',
          paymentMode: initialData.paymentMode || 'CASH',
          transactionId: initialData.transactionId || '',
          chequeNumber: initialData.chequeNumber || '',
          bankName: initialData.bankName || '',
          billAttachment: null,
        };
      });
    }
  }, [initialData]);

  const showNotification = (type, message) => {
    const colors = { success: 'bg-emerald-500', warning: 'bg-orange-500', error: 'bg-red-500' };
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl z-50 font-bold animate-slideIn`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, billAttachment: e.target.files[0] }));
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const round = (num) => Math.round(num * 100) / 100;

  // Calculations
  const amountBeforeVAT = parseFloat(formData.amountBeforeVAT) || 0;
  const vatRate = parseFloat(formData.vatRate) || 0;
  const discountRate = parseFloat(formData.discountRate) || 0;
  const tdsRate = parseFloat(formData.tdsRate) || 0;

  const discount = round((amountBeforeVAT * discountRate) / 100);
  const taxableAmount = round(amountBeforeVAT - discount);
  const vatAmount = round((taxableAmount * vatRate) / 100);
  const totalBill = round(taxableAmount + vatAmount);
  const tdsAmount = round((taxableAmount * tdsRate) / 100);
  const netPayable = round(totalBill - tdsAmount);

  const amountPaid = parseFloat(formData.amountPaid) || 0;
  const advanceAmount = amountPaid > netPayable ? round(amountPaid - netPayable) : 0;
  const pendingAmount = netPayable > amountPaid ? round(netPayable - amountPaid) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'billAttachment') {
          data.append(key, formData[key]);
        }
      });

      // Append the actual file
      if (formData.billAttachment) {
        data.append('attachment', formData.billAttachment);
      }

      // Add calculated values
      data.append('discount', discount);
      data.append('vatAmount', vatAmount);
      data.append('netPayable', netPayable);
      data.append('tdsAmount', tdsAmount);
      data.append('pendingAmount', pendingAmount);
      data.append('advanceAmount', advanceAmount);
      data.append('status', 'PENDING');

      if (mode === 'edit' && initialData?._id) {
        await API.patch(`/expenses/${initialData._id}`, data);
        showNotification('success', 'Expense updated successfully!');
      } else {
        await API.post('/expenses', data);

        const successMsg = advanceAmount > 0
          ? `Expense recorded with Rs. ${advanceAmount.toFixed(2)} advance!`
          : pendingAmount > 0
            ? `Expense recorded with Rs. ${pendingAmount.toFixed(2)} pending!`
            : 'Expense recorded successfully!';

        showNotification('success', successMsg);
      }

      // Notify the shared transaction hook that entries changed
      window.dispatchEvent(new CustomEvent('transactions:changed'));

      if (refreshData) refreshData();
      onClose();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Error submitting expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] my-4 animate-slideUp">

        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 bg-rose-500 rounded-t-3xl shrink-0">
          <div className="flex justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {mode === 'edit' ? 'Edit Expense Entry' : 'New Expense Entry'}
              </h2>
              <p className="text-rose-100 text-xs sm:text-sm mt-1">
                {mode === 'edit'
                  ? 'Update vendor bill details before approval'
                  : 'Record vendor payments and track payables'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 hover:bg-white/30 hover:rotate-90 transition-all duration-200 flex items-center justify-center text-white text-xl font-bold shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8">
          <form id="expense-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Vendor & Bill Information */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-rose-600 rounded-full" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Vendor & Bill Information</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Vendor Selection */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Select Vendor </label>
                  <div className="relative">
                    <select
                      name="vendorName"
                      required
                      disabled={loadingVendors}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-100 appearance-none cursor-pointer transition-all disabled:opacity-50"
                      onChange={handleInputChange}
                      value={formData.vendorName}
                    >
                      <option value="">
                        {loadingVendors ? 'Loading vendors...' : '-- Choose Registered Vendor --'}
                      </option>
                      {vendors.map(v => (
                        <option key={v._id} value={v.name}>
                          {v.name} {v.pan ? `(PAN: ${v.pan})` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bill Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Bill Number</label>
                  <input
                    type="text"
                    name="billNumber"
                    placeholder="e.g. INV-001"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.billNumber}
                  />
                </div>

                {/* Bill Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Bill Date</label>
                  <input
                    type="date"
                    name="billDate"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.billDate}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Payment Details */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-rose-600  rounded-full" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Payment Details</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Payment Mode */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Payment Mode </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'CASH', label: 'Cash' },
                      { value: 'BANK', label: 'Bank Transfer' },
                      { value: 'CHEQUE', label: 'Cheque' }
                    ].map(mode => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, paymentMode: mode.value }))}
                        className={`py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                          formData.paymentMode === mode.value
                            ? 'bg-rose-500 text-white shadow-lg'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Fields for BANK/CHEQUE */}
                {formData.paymentMode !== 'CASH' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">
                        {formData.paymentMode === 'BANK' ? 'Transaction ID' : 'Cheque Number'}
                      </label>
                      <input
                        type="text"
                        name={formData.paymentMode === 'BANK' ? 'transactionId' : 'chequeNumber'}
                        placeholder={formData.paymentMode === 'BANK' ? 'FonePay Ref / Trans ID' : 'Cheque Number'}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
                        onChange={handleInputChange}
                        value={formData.paymentMode === 'BANK' ? formData.transactionId : formData.chequeNumber}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">Bank Name</label>
                      <input
                        type="text"
                        name="bankName"
                        placeholder="e.g. Nabil Bank"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
                        onChange={handleInputChange}
                        value={formData.bankName}
                      />
                    </div>
                  </>
                )}

                {/* Bill Attachment */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Bill Attachment </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      required
                      accept="image/*,.pdf"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-500 file:text-white hover:file:bg-rose-600 file:cursor-pointer cursor-pointer outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
                    />
                  </div>
                  {formData.billAttachment && (
                    <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {formData.billAttachment.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/*Financial Calculation */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-rose-600 rounded-full" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Financial Details (NPR)</h3>
              </div>

              <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
                
                {/* Base Amount */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-rose-200 shadow-sm">
                  <label className="block text-xs font-bold text-rose-600 mb-3">Bill Amount (Before VAT) </label>
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-500 font-bold text-lg">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      name="amountBeforeVAT"
                      required
                      className="flex-1 text-right text-xl sm:text-3xl font-black text-rose-600 bg-transparent outline-none"
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      value={formData.amountBeforeVAT}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Discount */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Discount (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="discountRate"
                      className="w-full text-base sm:text-lg font-black text-emerald-600 outline-none"
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      value={formData.discountRate}
                      placeholder="0"
                    />
                  </div>
                  <div className="p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-emerald-500 uppercase mb-1">Discount Amount</span>
                    <span className="text-base sm:text-lg font-black text-emerald-700">
                      {discount > 0 ? `- Rs. ${discount.toFixed(2)}` : 'Rs. 0.00'}
                    </span>
                  </div>
                </div>

                {/* VAT */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">VAT Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="vatRate"
                      className="w-full text-base sm:text-lg font-black text-slate-800 outline-none"
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      value={formData.vatRate}
                    />
                  </div>
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-blue-500 uppercase mb-1">VAT Amount</span>
                    <span className="text-base sm:text-lg font-black text-blue-700">+ Rs. {vatAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* TDS */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">TDS Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="tdsRate"
                      className="w-full text-base sm:text-lg font-black text-orange-600 outline-none"
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      value={formData.tdsRate}
                      placeholder="1.5"
                    />
                  </div>
                  <div className="p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-200 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-orange-500 uppercase mb-1">TDS Amount</span>
                    <span className="text-base sm:text-lg font-black text-orange-700">
                      {tdsAmount > 0 ? `- Rs. ${tdsAmount.toFixed(2)}` : 'Rs. 0.00'}
                    </span>
                  </div>
                </div>

                {/* Net Payable  */}
                <div className="p-5 bg-indigo-600 rounded-xl shadow-lg">
                  <div className="flex justify-between items-center text-white">
                    <span className="text-xs font-bold uppercase tracking-wider">Net Payable</span>
                    <span className="text-xl sm:text-2xl font-black font-mono">Rs. {netPayable.toFixed(2)}</span>
                  </div>
                </div>

                {/* Amount Paid */}
                <div className="p-5 bg-emerald-500 rounded-xl shadow-lg">
                  <label className="block text-xs font-bold text-orange-50 uppercase mb-3">Amount Paid </label>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-lg">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      name="amountPaid"
                      required
                      className="flex-1 text-right text-xl sm:text-2xl font-black text-white px-3 py-2 rounded-lg outline-none"
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      value={formData.amountPaid}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Balance Indicator */}
                {(advanceAmount > 0 || pendingAmount > 0) && (
                  <div className={`p-4 rounded-xl border-2 ${
                    advanceAmount > 0
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold uppercase ${
                        advanceAmount > 0 ? 'text-purple-600' : 'text-amber-600'
                      }`}>
                        {advanceAmount > 0 ? 'Advance Payment' : 'Pending Payment'}
                      </span>
                      <span className={`text-xl font-black ${
                        advanceAmount > 0 ? 'text-purple-700' : 'text-amber-700'
                      }`}>
                        Rs. {advanceAmount > 0 ? advanceAmount.toFixed(2) : pendingAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="expense-form"
            disabled={isSubmitting || vendors.length === 0}
            className="px-8 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Recording...
              </span>
            ) : mode === 'edit' ? (
              'Update Expense'
            ) : (
              'Submit Expense'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;