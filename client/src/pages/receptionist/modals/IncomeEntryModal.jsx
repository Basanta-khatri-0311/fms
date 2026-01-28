import React, { useState, useEffect } from 'react';
import API from '../../../api/axiosConfig';

const IncomeModal = ({ onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    address: '',
    amountBeforeVAT: '',
    vatRate: '13',
    discount: '',
    tdsAmount: '',
    amountReceived: '',
    paymentMode: 'CASH',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Financial Logic
  const amountBeforeVAT = parseFloat(formData.amountBeforeVAT) || 0;
  const vatRatePercent = parseFloat(formData.vatRate) || 0;
  const vatAmount = (amountBeforeVAT * vatRatePercent) / 100;
  const discount = parseFloat(formData.discount) || 0;
  const tdsAmount = parseFloat(formData.tdsAmount) || 0;
  const netAmount = amountBeforeVAT + vatAmount - discount - tdsAmount;
  const amountReceived = parseFloat(formData.amountReceived) || 0;
  
  let pendingAmount = 0;
  let advanceAmount = 0;
  
  if (amountReceived > netAmount) {
    advanceAmount = amountReceived - netAmount;
    pendingAmount = 0;
  } else {
    pendingAmount = netAmount - amountReceived;
    advanceAmount = 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        alert("Session expired. Please login again.");
        return;
      }
      
      const payload = {
        ...formData,
        amountBeforeVAT: parseFloat(amountBeforeVAT),
        vatAmount: parseFloat(vatAmount.toFixed(2)),
        discount: parseFloat(discount),
        tdsAmount: parseFloat(tdsAmount),
        amountReceived: parseFloat(amountReceived),
        netAmount: parseFloat(netAmount.toFixed(2)),
        pendingAmount: parseFloat(pendingAmount.toFixed(2)),
        advanceAmount: parseFloat(advanceAmount.toFixed(2)),
      };

      await API.post('/incomes', payload); 
      alert(advanceAmount > 0 
        ? `Income recorded with Rs. ${advanceAmount.toFixed(2)} Advance!` 
        : "Income submitted successfully!");
      
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
        <div className="relative px-8 py-6 bg-linear-to-r from-blue-600 to-indigo-600 border-b border-blue-700/20 shrink-0">
          <div className="relative flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="text-3xl">💰</span>
                Income Entry
              </h3>
              <p className="text-blue-100 text-sm mt-1">Record client receipts and track advances</p>
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

        {/* Form Body  Scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          <form id="income-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Left Column - Client Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Client Details</h4>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Client Name *</label>
                    <input type="text" name="name" required placeholder="Enter full name" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-semibold text-sm" onChange={handleInputChange} value={formData.name} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Contact</label>
                      <input type="text" name="contactNumber" placeholder="98XXXXXXXX" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-semibold text-sm" onChange={handleInputChange} value={formData.contactNumber} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
                      <input type="email" name="email" placeholder="client@mail.com" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-semibold text-sm" onChange={handleInputChange} value={formData.email} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Address</label>
                    <input type="text" name="address" placeholder="City, Country" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-semibold text-sm" onChange={handleInputChange} value={formData.address} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Payment Mode</label>
                    <select name="paymentMode" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-sm appearance-none cursor-pointer" onChange={handleInputChange} value={formData.paymentMode}>
                      <option value="CASH">💵 Cash</option>
                      <option value="BANK">🏦 Bank / FonePay</option>
                      <option value="CHEQUE">📝 Cheque</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column - Financials */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Financial Breakdown</h4>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                    <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Amount Before VAT</label>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-400 text-sm">Rs.</span>
                      <input type="number" step="0.01" name="amountBeforeVAT" required className="text-right text-xl font-black text-blue-600 outline-none w-1/2 bg-transparent" onChange={handleInputChange} value={formData.amountBeforeVAT} placeholder="0.00" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-2xl border border-slate-100">
                      <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">VAT %</span>
                      <input type="number" name="vatRate" className="w-full font-black text-slate-800 outline-none" onChange={handleInputChange} value={formData.vatRate} />
                    </div>
                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col justify-center items-end">
                      <span className="text-[10px] font-black text-blue-400 uppercase">VAT Amt</span>
                      <span className="font-black text-blue-700">Rs. {vatAmount.toFixed(2)}</span>
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

                  {/* Net Amount Display */}
                  <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg flex justify-between items-center text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Net Amount</span>
                    <span className="text-xl font-black font-mono">Rs. {netAmount.toFixed(2)}</span>
                  </div>

                  {/* Amount Received Input */}
                  <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg flex justify-between items-center text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Amount Received</span>
                    <input type="number" name="amountReceived" className="text-right text-xl font-black font-mono bg-transparent outline-none w-1/2 placeholder-emerald-300" onChange={handleInputChange} value={formData.amountReceived} placeholder="0.00" />
                  </div>

                  {/* Dynamic Status Display */}
                  {advanceAmount > 0 ? (
                    <div className="p-3 bg-purple-100 rounded-xl border-2 border-purple-200 flex justify-between items-center">
                      <span className="text-[10px] font-black text-purple-600 uppercase">✨ Advance</span>
                      <span className="font-black text-purple-700">Rs. {advanceAmount.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-orange-100 rounded-xl border-2 border-orange-200 flex justify-between items-center">
                      <span className="text-[10px] font-black text-orange-600 uppercase">🕒 Pending</span>
                      <span className="font-black text-orange-700">Rs. {pendingAmount.toFixed(2)}</span>
                    </div>
                  )}
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
            form="income-form"
            disabled={isSubmitting} 
            className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase tracking-widest text-[10px]"
          >
            {isSubmitting ? 'Recording...' : 'Submit Income'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeModal;