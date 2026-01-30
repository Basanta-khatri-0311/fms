import React, { useState, useEffect } from 'react';
import API from '../../../api/axiosConfig';

const ExpenseModal = ({ onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    vendorName: '', // For lookup
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    amountBeforeVAT: '',
    vatRate: '13',
    discount: '0',
    tdsAmount: '0',
    amountPaid: '', // Track actual payment
    paymentMode: 'CASH',
  });

  const [vendors, setVendors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const fetchVendors = async () => {
      try {
        const response = await API.get('/vendors');
        const vendorList = Array.isArray(response.data) ? response.data : response.data.data || [];
        setVendors(vendorList);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Precise calculations with rounding
  const round = (num) => Math.round(num * 100) / 100;

  const amountBeforeVAT = parseFloat(formData.amountBeforeVAT) || 0;
  const vatRate = parseFloat(formData.vatRate) || 0;
  const vatAmount = round((amountBeforeVAT * vatRate) / 100);
  const discount = parseFloat(formData.discount) || 0;
  const tdsAmount = parseFloat(formData.tdsAmount) || 0;
  const netPayable = round(amountBeforeVAT + vatAmount - discount - tdsAmount);
  
  const amountPaid = parseFloat(formData.amountPaid) || 0;
  const pendingAmount = amountPaid < netPayable ? round(netPayable - amountPaid) : 0;
  const advanceAmount = amountPaid > netPayable ? round(amountPaid - netPayable) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendorName) {
      alert("Please select a vendor");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        vendorName: formData.vendorName,
        billNumber: formData.billNumber,
        billDate: formData.billDate,
        amountBeforeVAT: round(amountBeforeVAT),
        vatAmount: round(vatAmount),
        discount: round(discount),
        tdsAmount: round(tdsAmount),
        netPayable: round(netPayable),
        amountPaid: round(amountPaid),
        pendingAmount: round(pendingAmount),
        advanceAmount: round(advanceAmount),
        paymentMode: formData.paymentMode,
      };

      console.log('Submitting expense payload:', payload);

      await API.post('/expenses', payload);
      
      alert(advanceAmount > 0 
        ? `✓ Expense recorded with Rs. ${advanceAmount.toFixed(2)} advance to vendor!`
        : pendingAmount > 0
        ? `✓ Expense recorded with Rs. ${pendingAmount.toFixed(2)} pending payment!`
        : '✓ Expense recorded successfully!'
      );
      
      if (refreshData) refreshData();
      onClose();
    } catch (err) {
      console.error('Expense submission error:', err);
      alert(err.response?.data?.message || "Error saving expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-8">
        
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-rose-500 to-pink-600 shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <span className="text-3xl">💸</span>
                Expense Entry
              </h2>
              <p className="text-rose-100 text-sm mt-1">Record vendor bills and payments</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 
                transition-all flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          <form id="expense-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Vendor & Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                  Vendor & Bill Info
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                    Select Vendor *
                  </label>
                  {loadingVendors ? (
                    <div className="animate-pulse bg-slate-100 h-12 rounded-xl" />
                  ) : (
                    <select 
                      name="vendorName" 
                      value={formData.vendorName}
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 
                        rounded-xl text-sm font-bold outline-none 
                        focus:border-rose-500 transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="">-- Choose Vendor --</option>
                      {vendors.map(v => (
                        <option key={v._id} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  )}
                  {vendors.length === 0 && !loadingVendors && (
                    <p className="text-xs text-red-600 mt-1">
                      No vendors found. Please add vendors first.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                      Bill Number
                    </label>
                    <input 
                      name="billNumber" 
                      placeholder="INV-001" 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 
                        rounded-xl text-sm font-semibold outline-none focus:border-rose-500" 
                      onChange={handleInputChange} 
                      value={formData.billNumber}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                      Bill Date
                    </label>
                    <input 
                      type="date" 
                      name="billDate" 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 
                        rounded-xl text-sm font-semibold outline-none focus:border-rose-500" 
                      onChange={handleInputChange} 
                      value={formData.billDate}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                    Payment Mode
                  </label>
                  <select 
                    name="paymentMode" 
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 
                      rounded-xl text-sm font-bold outline-none focus:border-rose-500 
                      appearance-none cursor-pointer"
                    onChange={handleInputChange} 
                    value={formData.paymentMode}
                  >
                    <option value="CASH">💵 Cash</option>
                    <option value="BANK">🏦 Bank Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Financial Calculation */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                  Financial Details
                </h3>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 p-6 rounded-2xl border-2 border-slate-200 space-y-4">
                
                {/* Base Amount */}
                <div className="bg-white p-4 rounded-xl border-2 border-rose-200 shadow-sm">
                  <label className="block text-xs font-bold text-rose-600 mb-2 uppercase">
                    Amount Before VAT *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">Rs.</span>
                    <input 
                      type="number" 
                      step="0.01"
                      name="amountBeforeVAT" 
                      required
                      className="flex-1 text-right text-xl font-black text-rose-600 
                        bg-transparent outline-none" 
                      onChange={handleInputChange} 
                      value={formData.amountBeforeVAT}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* VAT */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                      VAT %
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="vatRate" 
                      className="w-full font-black text-slate-800 outline-none" 
                      onChange={handleInputChange} 
                      value={formData.vatRate}
                    />
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 
                    flex flex-col justify-center items-end">
                    <span className="text-[10px] font-black text-blue-400 uppercase">
                      VAT Amount
                    </span>
                    <span className="font-black text-blue-700">
                      Rs. {vatAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Discount & TDS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                      Discount
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="discount" 
                      className="w-full font-black text-green-600 outline-none" 
                      onChange={handleInputChange} 
                      value={formData.discount}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                      TDS
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="tdsAmount" 
                      className="w-full font-black text-orange-600 outline-none" 
                      onChange={handleInputChange} 
                      value={formData.tdsAmount}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Net Payable */}
                <div className="p-4 bg-slate-900 rounded-xl shadow-lg">
                  <div className="flex justify-between items-center text-white">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                      Total Bill Value
                    </span>
                    <span className="text-xl font-black font-mono">
                      Rs. {netPayable.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Amount Paid */}
                <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg">
                  <label className="block text-xs font-bold text-emerald-100 uppercase mb-2">
                    Amount Actually Paid *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">Rs.</span>
                    <input 
                      type="number" 
                      step="0.01"
                      name="amountPaid" 
                      required
                      className="flex-1 text-right text-xl font-black text-white 
                        bg-transparent outline-none placeholder-emerald-200" 
                      onChange={handleInputChange} 
                      value={formData.amountPaid}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Status Display */}
                {pendingAmount > 0 && (
                  <div className="p-3 bg-orange-100 rounded-xl border-2 border-orange-200 
                    flex justify-between items-center">
                    <span className="text-xs font-black text-orange-600 uppercase">
                      ⏳ Pending Payment
                    </span>
                    <span className="font-black text-orange-700">
                      Rs. {pendingAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                {advanceAmount > 0 && (
                  <div className="p-3 bg-purple-100 rounded-xl border-2 border-purple-200 
                    flex justify-between items-center">
                    <span className="text-xs font-black text-purple-600 uppercase">
                      ✨ Advance to Vendor
                    </span>
                    <span className="font-black text-purple-700">
                      Rs. {advanceAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2 text-xs font-black text-slate-400 uppercase 
              hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="expense-form" 
            disabled={isSubmitting || vendors.length === 0} 
            className="px-10 py-4 bg-gradient-to-r from-rose-600 to-pink-600 
              text-white font-black rounded-2xl shadow-lg 
              hover:shadow-xl hover:-translate-y-0.5
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
              text-xs uppercase tracking-wider"
          >
            {isSubmitting ? 'Processing...' : 'Submit Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;