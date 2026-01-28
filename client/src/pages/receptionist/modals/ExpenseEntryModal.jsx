import React, { useState, useEffect } from 'react';
import API from '../../../api/axiosConfig';

const ExpenseModal = ({ onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    vendorName: '', 
    billNumber: '',
    billDate: '',
    amountBeforeVAT: '',
    vatRate: '13',
    discount: '',
    tdsAmount: '',
    paymentMode: 'CASH',
  });

  const [vendors, setVendors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);

  //Fetch vendors and Lock background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const fetchVendors = async () => {
      try {
        const response = await API.get('/vendors');
        setVendors(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setVendors([]);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Business Logic Calculations
  const amountBeforeVAT = parseFloat(formData.amountBeforeVAT) || 0;
  const vatRatePercent = parseFloat(formData.vatRate) || 0;
  const vatAmount = (amountBeforeVAT * vatRatePercent) / 100;
  const discount = parseFloat(formData.discount) || 0;
  const tdsAmount = parseFloat(formData.tdsAmount) || 0;
  const netPayable = amountBeforeVAT + vatAmount - discount - tdsAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        vendorName: formData.vendorName,
        billNumber: formData.billNumber,
        billDate: formData.billDate,
        amountBeforeVAT: parseFloat(amountBeforeVAT),
        vatAmount: parseFloat(vatAmount.toFixed(2)),
        discount: parseFloat(discount),
        tdsAmount: parseFloat(tdsAmount),
        paymentMode: formData.paymentMode,
        netPayable: parseFloat(netPayable.toFixed(2)),
      };

      await API.post('/expenses', payload); 
      alert("Expense submitted successfully!");
      if (refreshData) refreshData();
      onClose();
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || "Submission failed"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-100 w-screen h-screen bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
      
      {/* MODAL CONTAINER */}
      <div className="relative bg-white w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="relative px-8 py-6 bg-linear-to-r from-red-600 to-rose-600 border-b border-red-700/20 shrink-0">
          <div className="relative flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="text-3xl">💸</span>
                Expense Entry
              </h3>
              <p className="text-red-100 text-sm mt-1">Record and track vendor payments</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          <form id="expense-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Left Column - Vendor dropdown */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-red-500 rounded-full" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Vendor Information</h4>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Vendor/Supplier *</label>
                    {loadingVendors ? (
                      <div className="animate-pulse bg-slate-100 h-11 rounded-xl" />
                    ) : (
                      <select 
                        name="vendorName" 
                        required 
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-500 outline-none font-bold text-sm appearance-none cursor-pointer"
                        onChange={handleInputChange}
                        value={formData.vendorName}
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor._id} value={vendor.name}>{vendor.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Bill Number</label>
                      <input type="text" name="billNumber" placeholder="INV-001" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-500 outline-none font-semibold text-sm" onChange={handleInputChange} value={formData.billNumber} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Bill Date</label>
                      <input type="date" name="billDate" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-500 outline-none font-semibold text-sm" onChange={handleInputChange} value={formData.billDate} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Payment Mode</label>
                    <select name="paymentMode" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-500 outline-none font-bold text-sm" onChange={handleInputChange} value={formData.paymentMode}>
                      <option value="CASH">💵 Cash</option>
                      <option value="BANK">🏦 Bank Transfer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column - Financials */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Calculation</h4>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 space-y-4">
                  <div className="flex justify-between items-center p-3.5 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">Gross Amount</span>
                    <input type="number" step="0.01" name="amountBeforeVAT" required className="text-right text-lg font-black text-red-600 outline-none w-1/2 bg-transparent" onChange={handleInputChange} value={formData.amountBeforeVAT} placeholder="0.00" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-2xl border border-slate-100">
                      <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">VAT %</span>
                      <input type="number" name="vatRate" className="w-full font-black text-slate-800 outline-none" onChange={handleInputChange} value={formData.vatRate} />
                    </div>
                    <div className="p-3 bg-red-50 rounded-2xl border border-red-100 flex flex-col justify-center items-end">
                      <span className="text-[10px] font-black text-red-400 uppercase">VAT Amt</span>
                      <span className="font-black text-red-700">Rs. {vatAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-2xl border border-slate-100">
                      <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Discount</span>
                      <input type="number" name="discount" className="w-full font-black text-red-500 outline-none" onChange={handleInputChange} value={formData.discount} />
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-slate-100">
                      <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">TDS</span>
                      <input type="number" name="tdsAmount" className="w-full font-black text-orange-500 outline-none" onChange={handleInputChange} value={formData.tdsAmount} />
                    </div>
                  </div>

                  <div className="p-5 bg-slate-900 rounded-2xl shadow-xl flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Net Payable</span>
                    <span className="text-2xl font-black text-white font-mono">Rs. {netPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-8 py-3 text-slate-400 font-black hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]">
            Cancel
          </button>
          <button 
            type="submit" 
            form="expense-form"
            disabled={isSubmitting || (vendors.length === 0 && !loadingVendors)} 
            className="px-10 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl hover:bg-red-700 transition-all disabled:opacity-50 uppercase tracking-widest text-[10px]"
          >
            {isSubmitting ? 'Processing...' : 'Submit Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;

