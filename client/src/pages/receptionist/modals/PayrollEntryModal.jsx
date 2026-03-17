import React, { useState, useEffect } from 'react';
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

  const handleWheel = (e) => {
    e.target.blur();
  };

  const handleFocus = (e) => {
    e.target.select();
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] my-4">
        
        <div className="px-6 sm:px-8 py-5 sm:py-6 bg-teal-600 rounded-t-3xl shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Payroll Entry</h2>
            <p className="text-teal-100 text-xs sm:text-sm mt-1">Record employee salaries and deductions</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 transition text-white font-bold text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <form id="payroll-form" onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Employee Name</label>
                <div className="relative">
                  <select
                    name="employeeName"
                    required
                    disabled={loadingEmployees}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none"
                    onChange={handleInputChange}
                    value={formData.employeeName}
                  >
                    <option value="">{loadingEmployees ? 'Loading...' : 'Select an Employee'}</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp.name}>
                        {emp.name} ({emp.role})
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
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Payment Month</label>
                <input required type="month" name="paymentMonth" value={formData.paymentMonth} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>

            <div className="p-5 bg-teal-50 rounded-2xl border border-teal-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-teal-800 mb-2">Basic Salary</label>
                  <input required type="number" name="basicSalary" value={formData.basicSalary} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onWheel={handleWheel} onFocus={handleFocus} className="w-full px-4 py-3" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-teal-800 mb-2">Allowances</label>
                  <input type="number" name="allowances" value={formData.allowances} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onWheel={handleWheel} onFocus={handleFocus} className="w-full px-4 py-3" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-rose-800 mb-2">Tax/TDS</label>
                  <input type="number" name="taxDeduction" value={formData.taxDeduction} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onWheel={handleWheel} onFocus={handleFocus} className="w-full px-4 py-3 border-rose-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-800 mb-2">Provident Fund</label>
                  <input type="number" name="providentFund" value={formData.providentFund} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onWheel={handleWheel} onFocus={handleFocus} className="w-full px-4 py-3 border-orange-200" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-teal-600 text-white rounded-xl">
                <span className="font-bold">Net Payable</span>
                <span className="text-2xl font-black">Rs. {netPayable.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Amount Paid</label>
                  <input required type="number" name="amountPaid" value={formData.amountPaid} onChange={handleInputChange} onKeyDown={handleNumberKeyDown} onWheel={handleWheel} onFocus={handleFocus} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                 <PaymentMethodSelector 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    setFormData={setFormData}
                    themeColor="teal"
                    fileLabel="Payment Screenshot"
                    fileKey="paymentScreenshot"
                  />
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t rounded-b-3xl flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-600">Cancel</button>
          <button type="submit" form="payroll-form" disabled={isSubmitting} className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition">
            {isSubmitting ? 'Recording...' : 'Submit Payroll'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollEntryModal;
