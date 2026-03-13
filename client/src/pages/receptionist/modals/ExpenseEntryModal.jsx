import React, { useState, useEffect } from 'react';
import API from '../../../api/axiosConfig';
import { showNotification } from '../../../utils/toast';
import PaymentMethodSelector from '../../../components/shared/PaymentMethodSelector';
import useFinancialCalculations from '../../../hooks/useFinancialCalculations';
import FinancialCalculationsUI from '../../../components/shared/FinancialCalculationsUI';

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handleWheel = (e) => {
    e.target.blur();
  };

  const calculations = useFinancialCalculations(formData, 'expense');
  // netPayable is aliased to netAmount in the hook
  const { vatAmount, discount, tdsAmount, netAmount: netPayable, advanceAmount, pendingAmount } = calculations;


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
                <PaymentMethodSelector 
                  formData={formData}
                  handleInputChange={handleInputChange}
                  setFormData={setFormData}
                  themeColor="rose"
                  fileLabel="Bill Attachment"
                  fileKey="billAttachment"
                />
              </div>
            </div>

            {/*Financial Calculation */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-rose-600 rounded-full" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Financial Details (NPR)</h3>
              </div>

              <FinancialCalculationsUI 
                formData={formData}
                handleInputChange={handleInputChange}
                handleFocus={handleFocus}
                handleWheel={handleWheel}
                calculations={calculations}
                themeColor="rose"
                title="Bill Amount (Before VAT) *"
                netLabel="Net Payable"
                amountInputName="amountPaid"
                amountInputLabel="Amount Paid *"
              />

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