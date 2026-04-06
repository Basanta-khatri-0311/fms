import React, { useState, useEffect } from 'react';
import { X, Receipt, CreditCard, Truck, Hash, Calendar, ChevronDown, Filter } from 'lucide-react';
import API from '../../../api/axiosConfig';
import { showNotification } from '../../../utils/toast';
import PaymentMethodSelector from '../../../components/shared/PaymentMethodSelector';
import useFinancialCalculations from '../../../hooks/useFinancialCalculations';
import FinancialCalculationsUI from '../../../components/shared/FinancialCalculationsUI';
import { useSystemSettings } from '../../../context/SystemSettingsContext';
import { handleNumberKeyDown, validateField } from '../../../utils/validation';

const ExpenseModal = ({ onClose, refreshData, initialData = null, mode = 'create' }) => {
  const { settings } = useSystemSettings();
  
  // Logic to determine initial branch
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const creatorBranch = storedUser.branch || settings?.branches?.find(b => b.active)?.code || 'KTM';

  const [formData, setFormData] = useState({
    branch: creatorBranch,
    vendorName: '',
    vendorId: '',
    previousDue: 0,
    previousAdvance: 0,
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    amountBeforeVAT: '',
    vatRate: settings?.taxSettings?.vatRate?.toString() || '13',
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

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => {
        const base = { ...prev };
        const amt = initialData.amountBeforeVAT || 0;
        const safeRate = (amount, isTax = true) => {
          const discount = initialData.discount || 0;
          const base = isTax ? (amt - discount) : amt;
          return base > 0 && amount != null ? ((amount * 100) / base).toFixed(2) : '';
        };

        return {
          ...base,
          branch: initialData.branch || prev.branch,
          vendorName: initialData.vendor?.name || initialData.vendorName || '',
          vendorId: initialData.vendor?._id || initialData.vendor || '',
          previousDue: initialData.previousDue || 0,
          previousAdvance: initialData.previousAdvance || 0,
          billNumber: initialData.billNumber || '',
          billDate: initialData.billDate
            ? new Date(initialData.billDate).toISOString().split('T')[0]
            : base.billDate,
          amountBeforeVAT: initialData.amountBeforeVAT ?? '',
          vatRate: initialData.vatRate != null ? String(initialData.vatRate) : safeRate(initialData.vatAmount, true),
          discountRate: initialData.discountRate != null ? String(initialData.discountRate) : safeRate(initialData.discount, false),
          tdsRate: initialData.tdsRate != null ? String(initialData.tdsRate) : safeRate(initialData.tdsAmount, true),
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
    
    if (name === 'vendorName') {
        const vendor = vendors.find(v => v.name === value);
        if (vendor) {
            setFormData(prev => ({
                ...prev,
                vendorName: value,
                vendorId: vendor._id,
                // Balance in vendor is: (+) they owe us (advance), (-) we owe them (due)
                previousDue: vendor.balance < 0 ? Math.abs(vendor.balance) : 0,
                previousAdvance: vendor.balance > 0 ? vendor.balance : 0
            }));
            return;
        }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFocus = (e) => e.target.select();

  const calculations = useFinancialCalculations(formData, 'expense');
  const { vatAmount, discount, tdsAmount, netAmount: netPayable, advanceAmount, pendingAmount } = calculations;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.branch) return showNotification('error', 'Please select a branch');
    if (!formData.vendorName) return showNotification('error', 'Please select a vendor');

    const amtVal = validateField('amount', formData.amountBeforeVAT);
    if (!amtVal.isValid) return showNotification('error', `Bill Amount: ${amtVal.message}`);

    const paidVal = validateField('amount', formData.amountPaid);
    if (!paidVal.isValid) return showNotification('error', `Paid Amount: ${paidVal.message}`);

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'billAttachment') data.append(key, formData[key]);
      });
      if (formData.billAttachment) data.append('attachment', formData.billAttachment);

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
          ? `Expense recorded with ${settings.currencySymbol} ${advanceAmount.toFixed(2)} advance!`
          : pendingAmount > 0
            ? `Expense recorded with ${settings.currencySymbol} ${pendingAmount.toFixed(2)} pending!`
            : 'Expense recorded successfully!';
        showNotification('success', successMsg);
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] my-4 animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="relative px-10 pt-10 pb-8 bg-slate-50/50 shrink-0">
          <button 
            onClick={onClose}
            className="absolute right-8 top-8 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shadow-sm"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 rounded-2xl ${mode === 'edit' ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600 shadow-rose-100'}`}>
              {mode === 'edit' ? <CreditCard size={26} /> : <Receipt size={26} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {mode === 'edit' ? 'Edit Expense' : 'Record Expense'}
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                {mode === 'edit' ? 'Update the details for this expense record.' : 'Enter details for a payment or other expense.'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-10 py-8 scrollbar-hide">
          <form id="expense-form" onSubmit={handleSubmit} className="space-y-12">
            
            {/* Vendor & Bill Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-rose-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Vendor Details</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Branch Selection */}
                <div className="lg:col-span-2 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Transacting Branch *</label>
                  <div className="relative">
                    <select
                      name="branch"
                      required
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-10 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/5 appearance-none cursor-pointer transition-all"
                    >
                      {settings?.branches?.filter(b => b.active).map(b => (
                        <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Filter size={18} />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Vendor Selection */}
                <div className="lg:col-span-2 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Choose Vendor *</label>
                  <div className="relative">
                    <select
                      name="vendorName"
                      required
                      disabled={loadingVendors}
                      className="w-full pl-11 pr-10 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/5 appearance-none cursor-pointer transition-all disabled:opacity-50"
                      onChange={handleInputChange}
                      value={formData.vendorName}
                    >
                      <option value="">
                        {loadingVendors ? 'Loading vendors...' : '-- Choose Vendor --'}
                      </option>
                      {vendors.map(v => (
                        <option key={v._id} value={v.name}>
                          {v.name} {v.pan ? `(${v.pan})` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Truck size={18} />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                  
                  {formData.vendorId && (
                    <div className="flex gap-2 sm:gap-3 pt-1 flex-wrap">
                      {parseFloat(formData.previousDue) > 0.01 && (
                        <div className="px-3 sm:px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                          <span className="text-[9px] sm:text-[10px] font-black text-rose-600 uppercase tracking-widest">Due: {settings.currencySymbol} {parseFloat(formData.previousDue).toLocaleString()}</span>
                        </div>
                      )}
                      {parseFloat(formData.previousAdvance) > 0.01 && (
                        <div className="px-3 sm:px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest">Advance: {settings.currencySymbol} {parseFloat(formData.previousAdvance).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bill Number */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Invoice / Bill Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="billNumber"
                      placeholder="e.g. INV-2024-001"
                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 transition-all"
                      onChange={handleInputChange}
                      value={formData.billNumber}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Hash size={18} />
                    </div>
                  </div>
                </div>

                {/* Bill Date */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Transaction Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="billDate"
                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 transition-all cursor-pointer"
                      onChange={handleInputChange}
                      value={formData.billDate}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Calendar size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-rose-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <PaymentMethodSelector 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    setFormData={setFormData}
                    themeColor="rose"
                    fileLabel="Upload Attachment (Screenshot/Slip)"
                    fileKey="billAttachment"
                  />
                </div>
              </div>
            </div>

            {/*Financial Calculation */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-rose-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial Details ({settings.currencySymbol.replace('.', '')})</h3>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100">
                <FinancialCalculationsUI 
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleFocus={handleFocus}
                  calculations={calculations}
                  themeColor="rose"
                  title="Bill Amount *"
                  netLabel="Total to Pay"
                  amountInputName="amountPaid"
                  amountInputLabel="Amount Paid *"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 rounded-b-3xl flex flex-col-reverse sm:flex-row justify-end gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 text-sm font-black text-slate-500 hover:text-slate-700 hover:bg-white rounded-2xl transition-all uppercase tracking-widest"
          >
            Discard
          </button>
          <button
            type="submit"
            form="expense-form"
            disabled={isSubmitting || vendors.length === 0}
            className="px-10 py-4 bg-rose-600 text-white font-black rounded-2xl shadow-xl shadow-rose-200 hover:bg-rose-500 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;