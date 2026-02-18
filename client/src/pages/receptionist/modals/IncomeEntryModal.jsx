import React, { useState, useEffect } from 'react';
import API from '../../../api/axiosConfig';

const IncomeModal = ({ onClose, refreshData, initialData = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    address: '',
    buyerPan: '',
    serviceType: 'Consultancy',
    quantity: '1',
    unit: 'Unit',
    amountBeforeVAT: '',
    vatRate: '13',
    discountRate: '',
    tdsRate: '',
    amountReceived: '',
    paymentMode: 'CASH',
    transactionId: '', // For FonePay/Bank Ref No
    chequeNumber: '',  // For Cheque
    bankName: '',      // For Cheque/Bank Transfer
    paymentScreenshot: null, // For the file upload
  });


  const [isSubmitting, setIsSubmitting] = useState(false);



  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Populate form when editing existing income
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => {
        const base = { ...prev };
        const amt = initialData.amountBeforeVAT || 0;

        const safeRate = (amount) =>
          amt > 0 && amount != null ? ((amount * 100) / amt).toFixed(2) : prev.vatRate;

        return {
          ...base,
          name: initialData.name || '',
          contactNumber: initialData.contactNumber || '',
          email: initialData.email || '',
          address: initialData.address || '',
          buyerPan: initialData.buyerPan || '',
          serviceType: initialData.serviceType || 'Consultancy',
          quantity: String(initialData.quantity || '1'),
          unit: initialData.unit || 'Unit',
          amountBeforeVAT: initialData.amountBeforeVAT ?? '',
          vatRate: safeRate(initialData.vatAmount),
          discountRate: safeRate(initialData.discount),
          tdsRate: safeRate(initialData.tdsAmount),
          amountReceived: initialData.amountReceived ?? '',
          paymentMode: initialData.paymentMode || 'CASH',
          transactionId: initialData.transactionId || '',
          chequeNumber: initialData.chequeNumber || '',
          bankName: initialData.bankName || '',
          paymentScreenshot: null,
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
    const { name, value, type } = e.target;

    if (type === 'number' && value !== '') {
      if (parseFloat(value) < 0) return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWheel = (e) => {
    e.target.blur(); // stop scroll-adjustment
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const round = (num) => Math.round(num * 100) / 100;

  const amountBeforeVAT = parseFloat(formData.amountBeforeVAT) || 0;
  const vatRate = parseFloat(formData.vatRate) || 0;
  const discountRate = parseFloat(formData.discountRate) || 0;
  const tdsRate = parseFloat(formData.tdsRate) || 0;

  const vatAmount = round((amountBeforeVAT * vatRate) / 100);
  const discount = round((amountBeforeVAT * discountRate) / 100);
  const tdsAmount = round((amountBeforeVAT * tdsRate) / 100);

  const netAmount = round(amountBeforeVAT + vatAmount - discount - tdsAmount);

  const amountReceived = parseFloat(formData.amountReceived) || 0;
  const advanceAmount = amountReceived > netAmount ? round(amountReceived - netAmount) : 0;
  const pendingAmount = netAmount > amountReceived ? round(netAmount - amountReceived) : 0;

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    //FormData object
    const data = new FormData();

    // Append all text fields from formData state
    Object.keys(formData).forEach(key => {
      if (key !== 'paymentScreenshot') {
        data.append(key, formData[key]);
      }
    });

    // Append the file if it exists
    if (formData.paymentScreenshot) {
      data.append('attachment', formData.paymentScreenshot);
    }

    // Append calculated fields
    data.append('vatAmount', vatAmount);
    data.append('discount', discount);
    data.append('tdsAmount', tdsAmount);
    data.append('netAmount', netAmount);
    data.append('pendingAmount', pendingAmount);
    data.append('advanceAmount', advanceAmount);
    data.append('branch', 'KTM');
    data.append('status', 'PENDING');

    if (mode === 'edit' && initialData?._id) {
      await API.patch(`/incomes/${initialData._id}`, data);
      showNotification('success', 'Income updated successfully!');
    } else {
      await API.post('/incomes', data);
      showNotification('success', 'Income recorded successfully!');
    }

    // Notify the shared transaction hook that entries changed
    window.dispatchEvent(new CustomEvent('transactions:changed'));

    if (refreshData) refreshData();
    onClose();
  } catch (err) {
    showNotification('error', err.response?.data?.message || "Error saving income");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] my-4 animate-slideUp">

        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 bg-indigo-600 rounded-t-3xl shrink-0">
          <div className="flex justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {mode === 'edit' ? 'Edit Income Entry' : 'New Income Entry'}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                {mode === 'edit'
                  ? 'Update client payment details before approval'
                  : 'Record client payments and manage receivables'}
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
          <form id="income-form" onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1: Client Information */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-blue-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Client Information</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Client Name */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Client Name </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.name}
                  />
                </div>

                {/* Contact & Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    placeholder="98XXXXXXXX"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.contactNumber}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="client@email.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.email}
                  />
                </div>

                {/* Address */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="City, District"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.address}
                  />
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-blue-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Service Details</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Service Type */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Service Type </label>
                  <div className="relative">
                    <select
                      name="serviceType"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                      onChange={handleInputChange}
                      value={formData.serviceType}
                    >
                      <option value="">Select Service</option>
                      <option value="Consultancy">Consultancy Fee</option>
                      <option value="Visa Processing">Visa Processing</option>
                      <option value="Language Class">Language Class (IELTS/PTE)</option>
                      <option value="Documentation">Documentation Fee</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Buyer PAN */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Buyer PAN (Optional)</label>
                  <input
                    type="text"
                    name="buyerPan"
                    placeholder="9-digit PAN"
                    maxLength="9"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.buyerPan}
                  />
                </div>

                {/* Quantity & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                      onChange={handleInputChange}
                      value={formData.quantity}
                      onWheel={handleWheel}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Unit</label>
                    <div className="relative">
                      <select
                        name="unit"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                        onChange={handleInputChange}
                        value={formData.unit}
                      >
                        <option value="Unit">Unit</option>
                        <option value="Month">Month</option>
                        <option value="Course">Course</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Payment Mode </label>
                  <div className="relative">
                    <select
                      name="paymentMode"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                      onChange={handleInputChange}
                      value={formData.paymentMode}
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK">Bank Transfer / FonePay</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Conditional Fields based on Payment Mode */}
                {['BANK', 'CHEQUE'].includes(formData.paymentMode) && (
                  <div className="mt-4 animate-fadeIn rounded-2xl border border-slate-200 bg-white/70 p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* BANK MODE */}
                      {formData.paymentMode === 'BANK' && (
                        <>
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Transaction ID / Ref No.
                            </label>
                            <input
                              type="text"
                              name="transactionId"
                              placeholder="e.g. TXN-349823"
                              value={formData.transactionId}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Payment Screenshot
                            </label>

                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs text-slate-500 transition hover:border-blue-400 hover:bg-blue-50">
                              📤 Upload Image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    paymentScreenshot: e.target.files[0],
                                  }))
                                }
                              />
                            </label>

                            {formData.paymentScreenshot && (
                              <p className="mt-1 text-[11px] text-green-600">
                                ✔ {formData.paymentScreenshot.name}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {/* CHEQUE MODE */}
                      {formData.paymentMode === 'CHEQUE' && (
                        <>
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Cheque Number
                            </label>
                            <input
                              type="text"
                              name="chequeNumber"
                              placeholder="e.g. 123456"
                              value={formData.chequeNumber}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Issuing Bank
                            </label>
                            <input
                              type="text"
                              name="bankName"
                              placeholder="e.g. Nabil Bank"
                              value={formData.bankName}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Section 3: Financial Calculation */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-blue-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Financial Details (NPR)</h3>
              </div>

              <div className="bg-linear-to-br from-slate-50 to-blue-50/50 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">

                {/* Base Amount */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-blue-200 shadow-sm">
                  <label className="block text-xs font-bold text-blue-600 mb-3">Service Amount (Before VAT) *</label>
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-500 font-bold text-lg">Rs.</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      name="amountBeforeVAT"
                      required
                      className="flex-1 text-right text-xl sm:text-3xl font-black text-blue-600 bg-transparent outline-none"
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      value={formData.amountBeforeVAT}
                      placeholder="0.00"
                      onWheel={handleWheel}
                    />
                  </div>
                </div>

                {/* VAT */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">VAT Rate (%)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      name="vatRate"
                      className="w-full text-base sm:text-lg font-black text-slate-800 outline-none"
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      value={formData.vatRate}
                      onWheel={handleWheel}
                    />
                  </div>
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-blue-500 uppercase mb-1">VAT Amount</span>
                    <span className="text-base sm:text-lg font-black text-blue-700">+ Rs. {vatAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Discount */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Discount (%)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      name="discountRate"
                      className="w-full text-base sm:text-lg font-black text-emerald-600 outline-none"
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      value={formData.discountRate}
                      placeholder="0"
                      onWheel={handleWheel}
                    />
                  </div>
                  <div className="p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-emerald-500 uppercase mb-1">Discount Amount</span>
                    <span className="text-base sm:text-lg font-black text-emerald-700">
                      {discount > 0 ? `- Rs. ${discount.toFixed(2)}` : 'Rs. 0.00'}
                    </span>
                  </div>
                </div>

                {/* TDS */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">TDS Rate (%)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      name="tdsRate"
                      className="w-full text-base sm:text-lg font-black text-orange-600 outline-none"
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      value={formData.tdsRate}
                      placeholder="0"
                      onWheel={handleWheel}
                    />
                  </div>
                  <div className="p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-200 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-orange-500 uppercase mb-1">TDS Amount</span>
                    <span className="text-base sm:text-lg font-black text-orange-700">
                      {tdsAmount > 0 ? `- Rs. ${tdsAmount.toFixed(2)}` : 'Rs. 0.00'}
                    </span>
                  </div>
                </div>

                {/* Net Amount - Highlighted */}
                <div className="p-5 bg-indigo-600 rounded-xl shadow-lg">
                  <div className="flex justify-between items-center text-white">
                    <span className="text-xs font-bold uppercase tracking-wider">Net Receivable</span>
                    <span className="text-xl sm:text-3xl font-black font-mono">Rs. {netAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Amount Received */}
                <div className="p-5 bg-emerald-500 rounded-xl shadow-lg">
                  <label className="block text-xs font-bold text-emerald-50 uppercase mb-3">Amount Received *</label>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-lg">Rs.</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      name="amountReceived"
                      required
                      className="flex-1 text-right text-xl sm:text-3xl text-whit px-3 py-2 rounded-lg outline-none placeholder-emerald-20 text-emerald-50 font-mono font-bold"
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      value={formData.amountReceived}
                      placeholder="0.00"
                      onWheel={handleWheel}
                    />
                  </div>
                </div>

                {/* Balance Indicator */}
                {(advanceAmount > 0 || pendingAmount > 0) && (
                  <div className={`p-4 rounded-xl border-2 ${advanceAmount > 0
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-amber-50 border-amber-200'
                    }`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold uppercase ${advanceAmount > 0 ? 'text-purple-600' : 'text-amber-600'
                        }`}>
                        {advanceAmount > 0 ? 'Advance Payment' : 'Pending Payment'}
                      </span>
                      <span className={`text-xl font-black ${advanceAmount > 0 ? 'text-purple-700' : 'text-amber-700'
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
            form="income-form"
            disabled={isSubmitting}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
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
              'Update Income'
            ) : (
              'Submit Income'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeModal;