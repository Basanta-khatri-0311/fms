import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Wallet, User, Mail, Phone, MapPin, Hash, Package, Layers, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import API from '../../../api/axiosConfig';
import { showNotification } from '../../../utils/toast';
import PaymentMethodSelector from '../../../components/shared/PaymentMethodSelector';
import useFinancialCalculations from '../../../hooks/useFinancialCalculations';
import FinancialCalculationsUI from '../../../components/shared/FinancialCalculationsUI';
import { useSystemSettings } from '../../../context/SystemSettingsContext';
import { handleNumberKeyDown, validateField } from '../../../utils/validation';


const IncomeModal = ({ onClose, refreshData, initialData = null, mode = 'create' }) => {
  const { settings } = useSystemSettings();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    contactNumber: '',
    email: '',
    address: '',
    previousDue: 0,
    previousAdvance: 0,
    buyerPan: '',
    serviceType: 'Consultancy',
    quantity: '1',
    unit: 'Unit',
    amountBeforeVAT: '',
    vatRate: '13',
    discountRate: '',
    tdsRate: '',
    amountReceived: '',
    paymentMode: 'CASH',
    transactionId: '',
    chequeNumber: '',
    bankName: '',
    paymentScreenshot: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetchStudents();
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await API.get('/users/students');
      setStudents(response.data.users || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);

    if (!studentId) {
      setFormData(prev => ({
        ...prev,
        studentId: '',
        name: '',
        email: '',
        previousDue: 0,
        previousAdvance: 0
      }));
      return;
    }

    const student = students.find(s => s._id === studentId);
    if (student) {
      setFormData(prev => ({
        ...prev,
        studentId: student._id,
        name: student.name,
        email: student.email,
        previousDue: Math.round((student.totalDue || 0) * 100) / 100,
        previousAdvance: Math.round((student.totalAdvance || 0) * 100) / 100
      }));
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => {
        const base = { ...prev };
        const amt = initialData.amountBeforeVAT || 0;
        const safeRate = (amount) =>
          amt > 0 && amount != null ? ((amount * 100) / amt).toFixed(2) : prev.vatRate;

        return {
          ...base,
          studentId: initialData.studentId || '',
          previousDue: initialData.previousDue || 0,
          previousAdvance: initialData.previousAdvance || 0,
          name: initialData.name || '',
          contactNumber: initialData.contactNumber || '',
          email: initialData.email || '',
          address: initialData.address || '',
          buyerPan: initialData.buyerPan || '',
          serviceType: initialData.serviceType || 'Consultancy',
          quantity: String(initialData.quantity || '1'),
          unit: initialData.unit || 'Unit',
          amountBeforeVAT: initialData.amountBeforeVAT ?? '',
          vatRate: safeRate(initialData.vatAmount),
          discountRate: safeRate(initialData.discount),
          tdsRate: safeRate(initialData.tdsAmount),
          amountReceived: initialData.amountReceived ?? '',
          paymentMode: initialData.paymentMode || 'CASH',
          transactionId: initialData.transactionId || '',
          chequeNumber: initialData.chequeNumber || '',
          bankName: initialData.bankName || '',
          paymentScreenshot: null,
        };
      });
      setSelectedStudentId(initialData.studentId || '');
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'number' && value !== '') {
      if (parseFloat(value) < 0) return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFocus = (e) => e.target.select();

  const calculations = useFinancialCalculations(formData, 'income');
  const { vatAmount, discount, tdsAmount, netAmount, advanceAmount, pendingAmount } = calculations;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameVal = validateField('name', formData.name);
    if (!nameVal.isValid) return showNotification('error', nameVal.message);

    if (formData.contactNumber) {
      const phoneVal = validateField('phone', formData.contactNumber);
      if (!phoneVal.isValid) return showNotification('error', phoneVal.message);
    }

    const amtVal = validateField('amount', formData.amountBeforeVAT);
    if (!amtVal.isValid) return showNotification('error', `Service Amount: ${amtVal.message}`);

    const recVal = validateField('amount', formData.amountReceived);
    if (!recVal.isValid) return showNotification('error', `Received Amount: ${recVal.message}`);

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'paymentScreenshot') return;
        if (key === 'studentId' && !formData[key]) return;
        data.append(key, formData[key]);
      });
      if (formData.paymentScreenshot) data.append('attachment', formData.paymentScreenshot);

      data.append('vatAmount', vatAmount);
      data.append('discount', discount);
      data.append('tdsAmount', tdsAmount);
      data.append('netAmount', netAmount);
      data.append('pendingAmount', pendingAmount);
      data.append('advanceAmount', advanceAmount);
      data.append('branch', 'KTM');
      data.append('status', 'PENDING');

      if (mode === 'edit' && initialData?._id) {
        await API.patch(`/incomes/${initialData._id}`, data);
        showNotification('success', 'Income updated successfully!');
      } else {
        await API.post('/incomes', data);
        const successMsg = advanceAmount > 0
          ? `Income recorded with ${settings.currencySymbol} ${advanceAmount.toFixed(2)} advance!`
          : pendingAmount > 0
            ? `Income recorded with ${settings.currencySymbol} ${pendingAmount.toFixed(2)} pending!`
            : 'Income recorded successfully!';
        showNotification('success', successMsg);
      }
      window.dispatchEvent(new CustomEvent('transactions:changed'));
      if (refreshData) refreshData();
      onClose();
    } catch (err) {
      showNotification('error', err.response?.data?.message || "Error saving income");
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
            <div className={`p-3 rounded-2xl ${mode === 'edit' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600 shadow-emerald-100'}`}>
              {mode === 'edit' ? <Wallet size={26} /> : <TrendingUp size={26} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {mode === 'edit' ? 'Edit Income' : 'Record Income'}
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                {mode === 'edit' ? 'Update the details for this income record.' : 'Enter details for a payment or other income.'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-10 py-8 scrollbar-hide">
          <form id="income-form" onSubmit={handleSubmit} className="space-y-12">

            {/* Section 1: Client Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Information</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Registered Student Select */}
                <div className="lg:col-span-2 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Student (Optional)</label>
                  <div className="relative">
                    <select
                      value={selectedStudentId}
                      onChange={handleStudentChange}
                      className="w-full pl-11 pr-10 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 appearance-none cursor-pointer transition-all"
                    >
                      <option value="">-- Guest / Custom Client --</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.name} • {student.email}
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

                  {formData.studentId && (
                    <div className="flex gap-2 sm:gap-3 pt-1 flex-wrap">
                      {parseFloat(formData.previousDue) > 0.01 && (
                        <div className="px-3 sm:px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                          <span className="text-[9px] sm:text-[10px] font-black text-rose-600 uppercase tracking-widest">Arrears: {settings.currencySymbol} {parseFloat(formData.previousDue).toLocaleString()}</span>
                        </div>
                      )}
                      {parseFloat(formData.previousAdvance) > 0.01 && (
                        <div className="px-3 sm:px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest">Credit: {settings.currencySymbol} {parseFloat(formData.previousAdvance).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Client Name */}
                <div className="lg:col-span-2 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Customer Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Johnathan Smith"
                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                      onChange={handleInputChange}
                      value={formData.name}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={18} />
                    </div>
                  </div>
                </div>

                {/* Contact & Email */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="contactNumber"
                      placeholder="98XXXXXXXX"
                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                      onChange={handleInputChange}
                      value={formData.contactNumber}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      placeholder="client@domain.com"
                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                      onChange={handleInputChange}
                      value={formData.email}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={18} />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="address"
                      placeholder="Street, City, District"
                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                      onChange={handleInputChange}
                      value={formData.address}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <MapPin size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Income Category</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Service *</label>
                  <div className="relative">
                    <select
                      name="serviceType"
                      required
                      className="w-full pl-11 pr-10 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 appearance-none cursor-pointer transition-all"
                      onChange={handleInputChange}
                      value={formData.serviceType}
                    >
                      <option value="">Select Category</option>
                      <option value="Consultancy">Consultancy</option>
                      <option value="Visa Processing">Visa Processing</option>
                      <option value="Language Class">Language Classes (IELTS/PTE)</option>
                      <option value="Documentation">Documentation</option>
                      <option value="Other">Other Services</option>
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Layers size={18} />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tax Reference (PAN)</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="buyerPan"
                      placeholder="9-digit identifier"
                      maxLength="9"
                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                      onChange={handleInputChange}
                      value={formData.buyerPan}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Hash size={18} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Qty</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                        onChange={handleInputChange}
                        onKeyDown={handleNumberKeyDown}
                        value={formData.quantity}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Package size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit</label>
                    <div className="relative">
                      <select
                        name="unit"
                        className="w-full pl-4 pr-10 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 appearance-none cursor-pointer transition-all"
                        onChange={handleInputChange}
                        value={formData.unit}
                      >
                        <option value="Unit">Unit</option>
                        <option value="Month">Month</option>
                        <option value="Course">Course</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <PaymentMethodSelector
                    formData={formData}
                    handleInputChange={handleInputChange}
                    setFormData={setFormData}
                    themeColor="indigo"
                    fileLabel="Upload Attachment (Screenshot/Slip)"
                    fileKey="paymentScreenshot"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Financial Calculation */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial Details ({settings.currencySymbol.replace('.', '')})</h3>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100">
                <FinancialCalculationsUI
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleFocus={handleFocus}
                  calculations={calculations}
                  themeColor="indigo"
                  title="Total Amount *"
                  netLabel="Total to Receive"
                  amountInputName="amountReceived"
                  amountInputLabel="Amount Received *"
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
            form="income-form"
            disabled={isSubmitting}
            className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeModal;