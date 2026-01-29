import React, { useState, useEffect } from 'react';
import API from '../../../api/axiosConfig';

const ExpenseModal = ({ onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    vendorId: '', // Storing the ID for the database
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    amountBeforeVAT: '',
    vatRate: '13', // Customizable default
    discount: '0',
    tdsAmount: '0',
    amountPaid: '', // Track actual cash outflow
    paymentMode: 'CASH',
  });

  const [vendors, setVendors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);

  // Fetch Vendors and Lock Scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const fetchVendors = async () => {
      try {
        const response = await API.get('/vendors');
        // Handle both response structures (direct array or .data.data)
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

  // --- PRECISE FINANCIAL CALCULATIONS ---
  const round = (num) => Math.round(num * 100) / 100;

  const amountBeforeVAT = parseFloat(formData.amountBeforeVAT) || 0;
  const vatRate = parseFloat(formData.vatRate) || 0;
  const vatAmount = round((amountBeforeVAT * vatRate) / 100);
  const discount = parseFloat(formData.discount) || 0;
  const tdsAmount = parseFloat(formData.tdsAmount) || 0;

  // Net payable is the official bill total
  const netPayable = round(amountBeforeVAT + vatAmount - discount - tdsAmount);
  
  const amountPaid = parseFloat(formData.amountPaid) || 0;
  const pendingAmount = netPayable > amountPaid ? round(netPayable - amountPaid) : 0;
  const advanceAmount = amountPaid > netPayable ? round(amountPaid - netPayable) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendorId) return alert("Please select a vendor");

    setIsSubmitting(true);
    try {
      const selectedVendor = vendors.find(v => v._id === formData.vendorId);
      
      const payload = {
        ...formData,
        vendorName: selectedVendor?.name, // Sending name for easy display in tables
        amountBeforeVAT,
        vatAmount,
        netPayable,
        amountPaid,
        pendingAmount,
        advanceAmount,
        status: 'PENDING'
      };

      await API.post('/expenses', payload);
      if (refreshData) refreshData();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-rose-100">
        
        {/* Header */}
        <div className="p-8 bg-rose-50 border-b border-rose-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-rose-900 tracking-tight">Expense Entry</h2>
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">Record Vendor Bills & Payments</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-200 rounded-full transition-colors text-rose-900">✕</button>
        </div>

        <div className="p-8 overflow-y-auto">
          <form id="expense-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Vendor & Basic Info */}
            <div className="space-y-6">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Vendor & Bill Info</h3>
               <div className="grid gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase px-1">Select Vendor</label>
                   <select 
                    name="vendorId" 
                    value={formData.vendorId}
                    onChange={handleInputChange} 
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-rose-500 transition-all appearance-none"
                    required
                   >
                     <option value="">{loadingVendors ? 'Loading Vendors...' : '-- Choose Vendor --'}</option>
                     {vendors.map(v => (
                       <option key={v._id} value={v._id}>{v.name}</option>
                     ))}
                   </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase px-1">Bill/Invoice #</label>
                     <input name="billNumber" placeholder="INV-001" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold outline-none" onChange={handleInputChange} required />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase px-1">Date</label>
                     <input name="billDate" type="date" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold outline-none" onChange={handleInputChange} value={formData.billDate} />
                   </div>
                 </div>

                 <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 mt-4">
                   <label className="text-[10px] font-black text-rose-500 uppercase block mb-1">Base Amount (Excl. VAT)</label>
                   <input name="amountBeforeVAT" type="number" step="0.01" placeholder="0.00" className="w-full bg-transparent text-2xl font-black text-rose-900 outline-none" onChange={handleInputChange} required />
                 </div>
               </div>
            </div>

            {/* Right Column: Financial Breakdown */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Tax & Payment</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">VAT Rate (%)</label>
                  <input name="vatRate" type="number" className="w-full bg-transparent font-black text-slate-900 outline-none" onChange={handleInputChange} value={formData.vatRate} />
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">TDS Deducted</label>
                  <input name="tdsAmount" type="number" step="0.01" className="w-full bg-transparent font-black text-orange-600 outline-none" onChange={handleInputChange} value={formData.tdsAmount} />
                </div>

                <div className="col-span-2 p-5 bg-slate-900 rounded-2xl shadow-xl flex justify-between items-center">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Total Bill Value</span>
                  <span className="text-white text-2xl font-black font-mono">Rs. {netPayable.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                  <label className="text-[10px] font-black text-emerald-600 uppercase block mb-1">Amount Actually Paid</label>
                  <input name="amountPaid" type="number" step="0.01" placeholder="0.00" className="w-full bg-transparent text-2xl font-black text-emerald-900 outline-none" onChange={handleInputChange} required />
                </div>

                {pendingAmount > 0 && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
                    <span className="text-[10px] font-black text-amber-600 uppercase">Pending Dues</span>
                    <span className="font-black text-amber-700">Rs. {pendingAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2 text-xs font-black text-slate-400 uppercase">Cancel</button>
          <button 
            type="submit" 
            form="expense-form" 
            disabled={isSubmitting} 
            className="px-10 py-4 bg-rose-600 text-white font-black rounded-2xl shadow-lg hover:bg-rose-700 transition-all disabled:opacity-50 text-[10px] uppercase tracking-widest"
          >
            {isSubmitting ? 'Posting...' : 'Confirm Expense Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;