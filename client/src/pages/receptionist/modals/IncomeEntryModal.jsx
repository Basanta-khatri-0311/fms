import React, { useState, useEffect } from 'react';
import API from '../../../api/axiosConfig';

const IncomeModal = ({ onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    address: '',
    amountBeforeVAT: '',
    vatRate: '13', // Customizable default
    discount: '0',
    tdsAmount: '0',
    amountReceived: '',
    paymentMode: 'CASH',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- PRECISE FINANCIAL CALCULATIONS ---
  const round = (num) => Math.round(num * 100) / 100;

  const amountBeforeVAT = parseFloat(formData.amountBeforeVAT) || 0;
  const vatRate = parseFloat(formData.vatRate) || 0;
  const vatAmount = round((amountBeforeVAT * vatRate) / 100);
  const discount = parseFloat(formData.discount) || 0;
  const tdsAmount = parseFloat(formData.tdsAmount) || 0;
  
  // Official net total client should pay
  const netAmount = round(amountBeforeVAT + vatAmount - discount - tdsAmount);
  
  const amountReceived = parseFloat(formData.amountReceived) || 0;
  const advanceAmount = amountReceived > netAmount ? round(amountReceived - netAmount) : 0;
  const pendingAmount = netAmount > amountReceived ? round(netAmount - amountReceived) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amountBeforeVAT,
        vatAmount,
        netAmount,
        advanceAmount,
        pendingAmount,
        status: 'PENDING'
      };
      await API.post('/incomes', payload);
      if (refreshData) refreshData();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving income");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Income Entry</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="p-8 overflow-y-auto">
          <form id="income-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400">Customer Information</label>
              <input name="name" placeholder="Customer Name" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 font-bold" onChange={handleInputChange} required />
              <input name="contactNumber" placeholder="Contact" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" onChange={handleInputChange} />
              
              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 mt-4">
                <label className="text-[10px] font-black text-blue-500 uppercase block mb-1">Service Value (Excl. VAT)</label>
                <input name="amountBeforeVAT" type="number" placeholder="0.00" className="w-full bg-transparent text-2xl font-black text-blue-900 outline-none" onChange={handleInputChange} required />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400">Tax & Discounts</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">VAT Rate (%)</label>
                  <input name="vatRate" type="number" className="w-full bg-transparent font-black border-none outline-none" value={formData.vatRate} onChange={handleInputChange} />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">VAT Amount</label>
                  <div className="font-black text-slate-800">Rs. {vatAmount}</div>
                </div>
                <input name="discount" type="number" placeholder="Discount" className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-bold text-red-500" onChange={handleInputChange} />
                <input name="tdsAmount" type="number" placeholder="TDS Amount" className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-bold text-orange-500" onChange={handleInputChange} />
              </div>

              <div className="p-5 bg-slate-900 rounded-2xl flex justify-between items-center shadow-lg">
                <span className="text-white text-xs font-bold uppercase tracking-widest">Net Billable</span>
                <span className="text-white text-xl font-black">Rs. {netAmount.toLocaleString()}</span>
              </div>

              <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                <label className="text-[10px] font-black text-emerald-600 uppercase block mb-1">Actual Amount Received</label>
                <input name="amountReceived" type="number" placeholder="0.00" className="w-full bg-transparent text-2xl font-black text-emerald-900 outline-none" onChange={handleInputChange} required />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 bg-slate-50 border-t flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-2 text-xs font-black text-slate-400 uppercase">Cancel</button>
          <button type="submit" form="income-form" disabled={isSubmitting} className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 text-xs uppercase">
            {isSubmitting ? 'Processing...' : 'Submit Income'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeModal;