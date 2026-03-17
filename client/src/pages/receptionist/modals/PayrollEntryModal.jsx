import React, { useState, useEffect } from 'react';
import { X, Banknote, User, Calendar, DollarSign, ChevronDown, CheckCircle2 } from 'lucide-react';
import API from '../../../api/axiosConfig';
import { showNotification } from '../../../utils/toast';
import PaymentMethodSelector from '../../../components/shared/PaymentMethodSelector';
import { handleNumberKeyDown, validateField } from '../../../utils/validation';

const PayrollEntryModal = ({ onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeRole: 'RECEPTIONIST',
    paymentMonth: '',
    basicSalary: '',
    allowances: '',
    taxDeduction: '',
    providentFund: '',
    amountPaid: '',
    paymentMode: 'CASH',
    transactionId: '',
    bankName: '',
    paymentScreenshot: null,
  });

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Fetch employees for dropdown
    const fetchEmployees = async () => {
      try {
        const response = await API.get('/users/employees');
        setEmployees(response.data?.users || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
        showNotification('error', 'Failed to load employees list');
      } finally {
        setLoadingEmployees(false);
      }
    };
    
    fetchEmployees();

    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'number' && value !== '' && parseFloat(value) < 0) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWheel = (e) => e.target.blur();
  const handleFocus = (e) => e.target.select();

  const basicSalary = parseFloat(formData.basicSalary) || 0;
  const allowances = parseFloat(formData.allowances) || 0;
  const taxDeduction = parseFloat(formData.taxDeduction) || 0;
  const providentFund = parseFloat(formData.providentFund) || 0;

  const grossSalary = basicSalary + allowances;
  const deductions = taxDeduction + providentFund;
  const netPayable = grossSalary - deductions;
  const amountPaid = parseFloat(formData.amountPaid) || 0;
  const pendingAmount = netPayable > amountPaid ? netPayable - amountPaid : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    const fieldsToValidate = [
      { key: 'basicSalary', label: 'Basic Salary' },
      { key: 'allowances', label: 'Allowances' },
      { key: 'taxDeduction', label: 'Tax/TDS' },
      { key: 'providentFund', label: 'Provident Fund' },
      { key: 'amountPaid', label: 'Amount Paid' }
    ];

    for (const field of fieldsToValidate) {
      if (formData[field.key]) {
        const val = validateField('amount', formData[field.key]);
        if (!val.isValid) return showNotification('error', `${field.label}: ${val.message}`);
      }
    }

    if (amountPaid > netPayable) {
      showNotification('error', 'Amount paid cannot exceed net payable!');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'paymentScreenshot') data.append(key, formData[key]);
      });
      if (formData.paymentScreenshot) data.append('attachment', formData.paymentScreenshot);
      
      data.append('grossSalary', grossSalary);
      data.append('netPayable', netPayable);
      data.append('pendingAmount', pendingAmount);

      await API.post('/payroll', data);
      showNotification('success', 'Payroll recorded successfully!');
      
      window.dispatchEvent(new CustomEvent('transactions:changed'));
      if (refreshData) refreshData();
      onClose();
    } catch (err) {
      showNotification('error', err.response?.data?.message || "Error saving payroll");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50   flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] my-4 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative px-10 pt-10 pb-8 bg-slate-50/50 shrink-0">
          <button 
            onClick={onClose}
            className="absolute right-8 top-8 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shadow-sm"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 rounded-2xl bg-emerald-100 text-emerald-600 shadow-emerald-100`}>
              <Banknote size={26} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Payroll Disbursement</h2>
              <p className="text-slate-500 text-sm font-medium mt-0.5">Process employee salary, allowances, and statutory deductions.</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-10 py-8 scrollbar-hide">
          <form id="payroll-form" onSubmit={handleSubmit} className="space-y-12">
            
            {/* Beneficiary Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Beneficiary Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Employee Select *</label>
                  <div className="relative">
                    <select
                      name="employeeName"
                      required
                      disabled={loadingEmployees}
                      className="w-full pl-11 pr-10 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 appearance-none cursor-pointer transition-all disabled:opacity-50"
                      onChange={handleInputChange}
                      value={formData.employeeName}
                    >
                      <option value="">{loadingEmployees ? 'Synchronizing...' : '-- Search Staff Directory --'}</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp.name}>
                          {emp.name} • {emp.role}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={18} />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Disbursement Period *</label>
                  <div className="relative">
                    <input 
                      required 
                      type="month" 
                      name="paymentMonth" 
                      value={formData.paymentMonth} 
                      onChange={handleInputChange} 
                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all cursor-pointer" 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Calendar size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Components */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Salary Configuration</h3>
              </div>

              <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-emerald-600 ml-1">Basic Salary *</label>
                    <div className="relative">
                      <input required type="number" name="basicSalary" value={formData.basicSalary} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onWheel={handleWheel} onFocus={handleFocus} className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400">
                        <DollarSign size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-emerald-600 ml-1">Allowances</label>
                    <div className="relative">
                      <input type="number" name="allowances" value={formData.allowances} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onWheel={handleWheel} onFocus={handleFocus} className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400">
                        <DollarSign size={18} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-rose-500 ml-1">Tax / TDS Deduction</label>
                    <div className="relative">
                      <input type="number" name="taxDeduction" value={formData.taxDeduction} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onWheel={handleWheel} onFocus={handleFocus} className="w-full pl-11 pr-4 py-4 bg-white border border-rose-100 rounded-2xl text-sm font-bold text-rose-600 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 transition-all" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300">
                        <DollarSign size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-orange-500 ml-1">Provident Fund (PF)</label>
                    <div className="relative">
                      <input type="number" name="providentFund" value={formData.providentFund} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onWheel={handleWheel} onFocus={handleFocus} className="w-full pl-11 pr-4 py-4 bg-white border border-orange-100 rounded-2xl text-sm font-bold text-orange-600 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300">
                        <DollarSign size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-6 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Net Disbursement Amount</span>
                    <p className="text-sm font-medium opacity-90 mt-0.5">Automated Calculation</p>
                  </div>
                  <span className="text-3xl font-black tracking-tighter">NPR {netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Payment Verification */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Settlement</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount Actually Remitted *</label>
                  <div className="relative">
                    <input required type="number" name="amountPaid" value={formData.amountPaid} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onWheel={handleWheel} onFocus={handleFocus} className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-emerald-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                      <DollarSign size={18} />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <PaymentMethodSelector 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    setFormData={setFormData}
                    themeColor="emerald"
                    fileLabel="Disbursement Proof (Slip/Screenshot)"
                    fileKey="paymentScreenshot"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 rounded-b-[2.5rem] flex flex-col-reverse sm:flex-row justify-end gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 text-sm font-black text-slate-500 hover:text-slate-700 hover:bg-white rounded-2xl transition-all uppercase tracking-widest"
          >
            Discard
          </button>
          <button
            type="submit"
            form="payroll-form"
            disabled={isSubmitting}
            className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {isSubmitting ? 'Processing...' : 'Commit Payroll'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollEntryModal;

