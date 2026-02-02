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
    discountRate: '',     
    tdsRate: '',          
    amountReceived: '',
    paymentMode: 'CASH',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

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
      const payload = {
        name: formData.name,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: formData.address,
        amountBeforeVAT: round(amountBeforeVAT),
        vatAmount: round(vatAmount),
        discount: round(discount),
        tdsAmount: round(tdsAmount),
        netAmount: round(netAmount),
        amountReceived: round(amountReceived),
        pendingAmount: round(pendingAmount),
        advanceAmount: round(advanceAmount),
        paymentMode: formData.paymentMode,
        status: 'PENDING'
      };

      await API.post('/incomes', payload);
      
      const successMsg = advanceAmount > 0 
        ? `Income recorded with Rs. ${advanceAmount.toFixed(2)} advance!`
        : pendingAmount > 0
        ? `Income recorded with Rs. ${pendingAmount.toFixed(2)} pending!`
        : 'Income recorded successfully!';
      
      showNotification('success', successMsg);
      
      if (refreshData) refreshData();
      onClose();
    } catch (err) {
      showNotification('error', err.response?.data?.message || "Error saving income");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-8">
        
        <div className="px-8 py-6 bg-linear-to-r from-blue-600 to-indigo-600 shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">Income Entry</h2>
              <p className="text-blue-100 text-sm mt-1">Record client receipts and track advances</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <form id="income-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-linear-to-b from-blue-500 to-indigo-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">Client Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Client Name *</label>
                  <input type="text" name="name" required placeholder="Enter full name" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" onChange={handleInputChange} value={formData.name} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Contact</label>
                    <input type="text" name="contactNumber" placeholder="98XXXXXXXX" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" onChange={handleInputChange} value={formData.contactNumber} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Email</label>
                    <input type="email" name="email" placeholder="client@mail.com" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" onChange={handleInputChange} value={formData.email} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Address</label>
                  <input type="text" name="address" placeholder="City, Country" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" onChange={handleInputChange} value={formData.address} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Payment Mode</label>
                  <select name="paymentMode" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 appearance-none cursor-pointer" onChange={handleInputChange} value={formData.paymentMode}>
                    <option value="CASH">💵 Cash</option>
                    <option value="BANK">🏦 Bank / FonePay</option>
                    <option value="CHEQUE">📝 Cheque</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-linear-to-b from-emerald-500 to-blue-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">Financial Details (NPR)</h3>
              </div>
              <div className="bg-linear-to-br from-slate-50 to-blue-50/30 p-6 rounded-2xl border-2 border-slate-200 space-y-4">
                <div className="bg-white p-4 rounded-xl border-2 border-blue-200 shadow-sm">
                  <label className="block text-xs font-bold text-blue-600 mb-2 uppercase">Service Value (Before VAT) *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">Rs.</span>
                    <input type="number" step="0.01" name="amountBeforeVAT" required className="flex-1 text-right text-xl font-black text-blue-600 bg-transparent outline-none" onChange={handleInputChange} onFocus={handleFocus} value={formData.amountBeforeVAT} placeholder="0.00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">VAT %</label>
                    <input type="number" step="0.01" name="vatRate" className="w-full font-black text-slate-800 outline-none" onChange={handleInputChange} onFocus={handleFocus} value={formData.vatRate} />
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex flex-col justify-center items-end">
                    <span className="text-[10px] font-black text-blue-400 uppercase">VAT Amount</span>
                    <span className="font-black text-blue-700">Rs. {vatAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Discount %</label>
                    <input type="number" step="0.01" name="discountRate" className="w-full font-black text-green-600 outline-none" onChange={handleInputChange} onFocus={handleFocus} value={formData.discountRate} placeholder="0" />
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl border border-green-200 flex flex-col justify-center items-end">
                    <span className="text-[10px] font-black text-green-500 uppercase">Discount Amt</span>
                    <span className="font-black text-green-700">{discount > 0 ? `-Rs. ${discount.toFixed(2)}` : 'Rs. 0.00'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">TDS %</label>
                    <input type="number" step="0.01" name="tdsRate" className="w-full font-black text-orange-600 outline-none" onChange={handleInputChange} onFocus={handleFocus} value={formData.tdsRate} placeholder="0" />
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 flex flex-col justify-center items-end">
                    <span className="text-[10px] font-black text-orange-500 uppercase">TDS Amount</span>
                    <span className="font-black text-orange-700">{tdsAmount > 0 ? `-Rs. ${tdsAmount.toFixed(2)}` : 'Rs. 0.00'}</span>
                  </div>
                </div>
                <div className="p-4 bg-linear-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg">
                  <div className="flex justify-between items-center text-white">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">Net Amount</span>
                    <span className="text-xl font-black font-mono">Rs. {netAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="p-4 bg-linear-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg">
                  <label className="block text-xs font-bold text-emerald-100 uppercase mb-2">Amount Actually Received *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">Rs.</span>
                    <input type="number" step="0.01" name="amountReceived" required className="flex-1 text-right text-xl font-black text-white bg-transparent outline-none placeholder-emerald-200" onChange={handleInputChange} onFocus={handleFocus} value={formData.amountReceived} placeholder="0.00" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2 text-xs font-black text-slate-400 uppercase hover:text-slate-600 transition-colors">Cancel</button>
          <button type="submit" form="income-form" disabled={isSubmitting} className="px-10 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider">
            {isSubmitting ? 'Recording...' : 'Submit Income'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeModal;