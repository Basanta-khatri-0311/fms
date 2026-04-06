import React, { useState, useEffect } from 'react';
import { X, Banknote, User, Calendar, ChevronDown, CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import API from '../../../api/axiosConfig';
import { showNotification } from '../../../utils/toast';
import PaymentMethodSelector from '../../../components/shared/PaymentMethodSelector';
import { useSystemSettings } from '../../../context/SystemSettingsContext';
import { handleNumberKeyDown, validateField } from '../../../utils/validation';

const PayrollEntryModal = ({ onClose, refreshData, initialData, mode = 'create' }) => {
  const { settings } = useSystemSettings();
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
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
    previousDue: 0,
    previousAdvance: 0,
  });

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingPayrollStatus, setExistingPayrollStatus] = useState(null); // 'APPROVED', 'PENDING', or null

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
    
    // Populate for edit mode
    if (mode === 'edit' && initialData) {
      setFormData({
        employeeName: initialData.employeeName || '',
        employeeId: initialData.employeeId || '',
        employeeRole: initialData.employeeRole || 'RECEPTIONIST',
        paymentMonth: initialData.paymentMonth || '',
        basicSalary: initialData.basicSalary || '',
        allowances: initialData.allowances || '',
        taxDeduction: initialData.taxDeduction || '',
        providentFund: initialData.providentFund || '',
        amountPaid: initialData.amountPaid || '',
        paymentMode: initialData.paymentMode || 'CASH',
        transactionId: initialData.transactionId || '',
        bankName: initialData.bankName || '',
        previousDue: initialData.previousDue || 0,
        previousAdvance: initialData.previousAdvance || 0,
        paymentScreenshot: null, // Don't pre-populate file
      });
    }

    return () => { document.body.style.overflow = 'unset'; };
  }, [mode, initialData]);

  // Check for existing records for this month/user
  useEffect(() => {
    if (mode === 'create' && formData.employeeName && formData.paymentMonth) {
        const checkExists = async () => {
            try {
                const res = await API.get(`/payroll/check-exists?employeeName=${formData.employeeName}&paymentMonth=${formData.paymentMonth}`);
                const data = res.data?.data || [];
                
                if (data.some(p => p.approval?.status === 'APPROVED')) {
                    setExistingPayrollStatus('APPROVED');
                } else if (data.some(p => p.approval?.status === 'PENDING')) {
                    setExistingPayrollStatus('PENDING');
                } else {
                    setExistingPayrollStatus(null);
                }
            } catch (err) {
                console.error("Check exists failed", err);
            }
        };
        checkExists();
    } else {
        setExistingPayrollStatus(null);
    }
  }, [formData.employeeName, formData.paymentMonth, mode]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'number' && value !== '' && parseFloat(value) < 0) return;
    
    if (name === 'employeeName') {
        const emp = employees.find(e => e.name === value);
        setFormData(prev => ({ 
            ...prev, 
            employeeName: value,
            employeeId: emp?._id || '',
            employeeRole: emp?.role || prev.employeeRole,
            previousDue: emp?.totalDue || 0,
            previousAdvance: emp?.totalAdvance || 0
        }));
        return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFocus = (e) => e.target.select();

  const basicSalary = parseFloat(formData.basicSalary) || 0;
  const allowances = parseFloat(formData.allowances) || 0;
  const taxDeduction = parseFloat(formData.taxDeduction) || 0;
  const providentFund = parseFloat(formData.providentFund) || 0;

  const grossSalary = basicSalary + allowances;
  const deductions = taxDeduction + providentFund;
  const currentNetBalance = grossSalary - deductions;

  // Final Carryforward Logic: (Current Month) + (Last month's unpaid) - (Last month's overpaid)
  const netPayable = currentNetBalance + formData.previousDue - formData.previousAdvance;

  const amountPaid = parseFloat(formData.amountPaid) || 0;
  const pendingAmount = netPayable > amountPaid ? netPayable - amountPaid : 0;
  const advanceAmount = amountPaid > netPayable ? amountPaid - netPayable : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    const fieldsToValidate = [
      { key: 'basicSalary', label: 'Basic Salary' },
      { key: 'allowances', label: 'Allowances' },
      { key: 'taxDeduction', label: 'Tax/TDS' },
      { key: 'providentFund', label: 'Staff Fund (Sanchaya Kosh)' },
      { key: 'amountPaid', label: 'Amount Paid' }
    ];

    for (const field of fieldsToValidate) {
      if (formData[field.key]) {
        const val = validateField('amount', formData[field.key]);
        if (!val.isValid) return showNotification('error', `${field.label}: ${val.message}`);
      }
    }

    if (mode === 'create' && existingPayrollStatus === 'APPROVED') {
        showNotification('error', `Salary for ${formData.employeeName} for ${formData.paymentMonth} is already approved and cannot be duplicated!`);
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
      data.append('advanceAmount', advanceAmount);
      data.append('narration', `Staff Salary Payment - ${formData.employeeName} (${formData.paymentMonth})`);

      if (mode === 'edit') {
        await API.patch(`/payroll/${initialData._id}`, data);
        showNotification('success', 'Payroll record updated!');
      } else {
        await API.post('/payroll', data);
        showNotification('success', 'Payroll recorded successfully!');
      }
      
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
            <div className={`p-3 rounded-2xl bg-emerald-100 text-emerald-600 shadow-emerald-100`}>
              <Banknote size={26} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {mode === 'edit' ? 'Edit Salary Record' : 'Process Salary Payment'}
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                {mode === 'edit' ? 'Update employee salary and deduction records.' : 'Record employee salary, allowances, and fund deductions.'}
              </p>
            </div>
          </div>
        </div>

        {/* Duplicate and Balance Warning UI */}
        <div className="px-10 mt-2 space-y-3">
            {existingPayrollStatus && (
            <div className={`p-4 rounded-2xl flex items-center gap-4 border animate-in slide-in-from-top duration-300 ${
                existingPayrollStatus === 'APPROVED' 
                ? 'bg-rose-50 border-rose-100 text-rose-700' 
                : 'bg-amber-50 border-amber-100 text-amber-700'
            }`}>
                <div className={`p-2 rounded-xl ${existingPayrollStatus === 'APPROVED' ? 'bg-rose-100' : 'bg-amber-100'}`}>
                {existingPayrollStatus === 'APPROVED' ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div className="flex-1">
                <p className="text-sm font-black uppercase tracking-tight">
                    {existingPayrollStatus === 'APPROVED' ? 'Salary Already Provided' : 'Existing Record Pending'}
                </p>
                <p className="text-xs font-bold opacity-80 mt-0.5">
                    {existingPayrollStatus === 'APPROVED' 
                    ? `Salary for ${formData.employeeName} for ${formData.paymentMonth} has already been approved.` 
                    : `A salary record for ${formData.employeeName} for ${formData.paymentMonth} is currently awaiting approval.`}
                </p>
                </div>
            </div>
            )}

            {(formData.previousDue > 0 || formData.previousAdvance > 0) && (
              <div className="flex gap-4">
                {formData.previousDue > 0 && (
                  <div className="flex-1 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                    <div className="bg-rose-100 p-2 rounded-xl text-rose-600">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-rose-400 tracking-widest">Outstanding Salary (+)</p>
                      <p className="text-xs font-black text-rose-700">{settings.currencySymbol} {formData.previousDue.toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {formData.previousAdvance > 0 && (
                  <div className="flex-1 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                      <TrendingDown size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Previous Advance (-)</p>
                      <p className="text-xs font-black text-emerald-700">{settings.currencySymbol} {formData.previousAdvance.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-10 py-8 scrollbar-hide">
          <form id="payroll-form" onSubmit={handleSubmit} className="space-y-12">
            
            {/* Beneficiary Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Employee *</label>
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
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Month of Payment *</label>
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
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Salary Details</h3>
              </div>

              <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-emerald-600 ml-1">Basic Salary *</label>
                    <div className="relative">
                      <input required type="number" name="basicSalary" value={formData.basicSalary} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onFocus={handleFocus} className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-right" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">
                        {settings.currencySymbol}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-emerald-600 ml-1">Allowances</label>
                    <div className="relative">
                      <input type="number" name="allowances" value={formData.allowances} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onFocus={handleFocus} className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-right" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">
                        {settings.currencySymbol}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-rose-500 ml-1">Tax / TDS Deduction</label>
                    <div className="relative">
                      <input type="number" name="taxDeduction" value={formData.taxDeduction} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onFocus={handleFocus} className="w-full pl-11 pr-4 py-4 bg-white border border-rose-100 rounded-2xl text-sm font-bold text-rose-600 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 transition-all text-right" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 font-bold">
                        {settings.currencySymbol}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-orange-500 ml-1">Staff Fund (Sanchaya Kosh)</label>
                    <div className="relative">
                      <input type="number" name="providentFund" value={formData.providentFund} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onFocus={handleFocus} className="w-full pl-11 pr-4 py-4 bg-white border border-orange-100 rounded-2xl text-sm font-bold text-orange-600 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all text-right" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300 font-bold">
                        {settings.currencySymbol}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-6 bg-slate-900 border border-slate-800 text-white rounded-[1.5rem] shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-800 rounded-xl text-slate-400">
                            <CheckCircle2 size={18} />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Base Monthly Net</span>
                            <p className="text-xs font-bold text-slate-300">{settings.currencySymbol} {currentNetBalance.toLocaleString()}</p>
                        </div>
                    </div>
                    { (formData.previousDue > 0 || formData.previousAdvance > 0) && (
                        <div className="text-right">
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Adjustments</span>
                           <p className="text-xs font-bold text-indigo-400">
                             {formData.previousDue > 0 && `+${formData.previousDue.toLocaleString()} Due`}
                             {formData.previousDue > 0 && formData.previousAdvance > 0 && ' | '}
                             {formData.previousAdvance > 0 && `-${formData.previousAdvance.toLocaleString()} Adv.`}
                           </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center p-6 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 uppercase">Total Payout Required</span>
                    <p className="text-sm font-medium opacity-90 mt-0.5">Includes carryover balances</p>
                  </div>
                  <span className="text-3xl font-black tracking-tighter">{settings.currencySymbol} {netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Payment Verification */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount Paid *</label>
                    <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, amountPaid: netPayable }))}
                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700"
                    >
                        Auto-fill Full Amount
                    </button>
                  </div>
                  <div className="relative">
                    <input required type="number" name="amountPaid" value={formData.amountPaid} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onFocus={handleFocus} className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-emerald-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-right" />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">
                      {settings.currencySymbol}
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
            form="payroll-form"
            disabled={isSubmitting}
            className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {isSubmitting ? 'Processing...' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollEntryModal;
