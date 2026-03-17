import React, { useState, useEffect } from 'react';
import API from '../../../api/axiosConfig';
import { showNotification } from '../../../utils/toast';
import PaymentMethodSelector from '../../../components/shared/PaymentMethodSelector';
import useFinancialCalculations from '../../../hooks/useFinancialCalculations';
import FinancialCalculationsUI from '../../../components/shared/FinancialCalculationsUI';
import { handleNumberKeyDown, validateField } from '../../../utils/validation';

const IncomeModal = ({ onClose, refreshData, initialData = null, mode = 'create' }) => {
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
    transactionId: '', // For FonePay/Bank Ref No
    chequeNumber: '',  // For Cheque
    bankName: '',      // For Cheque/Bank Transfer
    paymentScreenshot: null, // For the file upload
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
        previousDue: student.totalDue || 0,
        previousAdvance: student.totalAdvance || 0
      }));
    }
  };

  // Populate form when editing existing income
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

  const handleWheel = (e) => {
    e.target.blur(); // stop scroll-adjustment
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const calculations = useFinancialCalculations(formData, 'income');
  const { vatAmount, discount, tdsAmount, netAmount, advanceAmount, pendingAmount } = calculations;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
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
      //FormData object
      const data = new FormData();

      // Append all text fields from formData state
      Object.keys(formData).forEach(key => {
        if (key !== 'paymentScreenshot') {
          data.append(key, formData[key]);
        }
      });

      // Append the file if it exists
      if (formData.paymentScreenshot) {
        data.append('attachment', formData.paymentScreenshot);
      }

      // Append calculated fields
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
        showNotification('success', 'Income recorded successfully!');
      }

      // Notify the shared transaction hook that entries changed
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] my-4 animate-slideUp">

        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 bg-indigo-600 rounded-t-3xl shrink-0">
          <div className="flex justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {mode === 'edit' ? 'Edit Income Entry' : 'New Income Entry'}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                {mode === 'edit'
                  ? 'Update client payment details before approval'
                  : 'Record client payments and manage receivables'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 hover:bg-white/30 hover:rotate-90 transition-all duration-200 flex items-center justify-center text-white text-xl font-bold shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8">
          <form id="income-form" onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1: Client Information */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-blue-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Client Information</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Registered Student Select */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2 underline decoration-blue-500/30">Select Registered Student (Optional)</label>
                  <div className="relative">
                    <select
                      value={selectedStudentId}
                      onChange={handleStudentChange}
                      className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                    >
                      <option value="">-- New / Unregistered Client --</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {formData.studentId && (
                    <div className="mt-3 flex gap-3">
                      {formData.previousDue > 0 && (
                        <div className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-red-700 uppercase tracking-tight">Previous Due: NPR. {formData.previousDue}</span>
                        </div>
                      )}
                      {formData.previousAdvance > 0 && (
                        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">Previous Advance: NPR. {formData.previousAdvance}</span>
                        </div>
                      )}
                      {formData.previousDue === 0 && formData.previousAdvance === 0 && (
                        <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Clear Balance</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Client Name */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Client Name </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.name}
                  />
                </div>

                {/* Contact & Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    placeholder="98XXXXXXXX"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.contactNumber}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="client@email.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.email}
                  />
                </div>

                {/* Address */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="City, District"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.address}
                  />
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-blue-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Service Details</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Service Type */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">Service Type </label>
                  <div className="relative">
                    <select
                      name="serviceType"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                      onChange={handleInputChange}
                      value={formData.serviceType}
                    >
                      <option value="">Select Service</option>
                      <option value="Consultancy">Consultancy Fee</option>
                      <option value="Visa Processing">Visa Processing</option>
                      <option value="Language Class">Language Class (IELTS/PTE)</option>
                      <option value="Documentation">Documentation Fee</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Buyer PAN */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Buyer PAN (Optional)</label>
                  <input
                    type="text"
                    name="buyerPan"
                    placeholder="9-digit PAN"
                    maxLength="9"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    onChange={handleInputChange}
                    value={formData.buyerPan}
                  />
                </div>

                {/* Quantity & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                      onChange={handleInputChange}
                      onKeyDown={handleNumberKeyDown}
                      value={formData.quantity}
                      onWheel={handleWheel}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Unit</label>
                    <div className="relative">
                      <select
                        name="unit"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                        onChange={handleInputChange}
                        value={formData.unit}
                      >
                        <option value="Unit">Unit</option>
                        <option value="Month">Month</option>
                        <option value="Course">Course</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <PaymentMethodSelector 
                  formData={formData}
                  handleInputChange={handleInputChange}
                  setFormData={setFormData}
                  themeColor="indigo"
                  fileLabel="Payment Screenshot"
                  fileKey="paymentScreenshot"
                />


              </div>
            </div>

            {/* Section 3: Financial Calculation */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-blue-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Financial Details (NPR)</h3>
              </div>

              <FinancialCalculationsUI 
                formData={formData}
                handleInputChange={handleInputChange}
                handleFocus={handleFocus}
                handleWheel={handleWheel}
                calculations={calculations}
                themeColor="blue"
                title="Service Amount (Before VAT) *"
                netLabel="Net Receivable"
                amountInputName="amountReceived"
                amountInputLabel="Amount Received *"
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="income-form"
            disabled={isSubmitting}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Recording...
              </span>
            ) : mode === 'edit' ? (
              'Update Income'
            ) : (
              'Submit Income'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeModal;