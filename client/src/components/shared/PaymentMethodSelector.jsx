import React from 'react';

const PaymentMethodSelector = ({ formData, handleInputChange, setFormData, themeColor = 'slate', fileLabel = 'Attachment', fileKey = 'paymentScreenshot' }) => {
  const getButtonClass = (isActive) => {
    if (!isActive) return 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100';
    const activeMap = {
      rose: 'bg-rose-500 text-white shadow-lg',
      indigo: 'bg-indigo-600 text-white shadow-lg',
      teal: 'bg-teal-600 text-white shadow-lg',
      slate: 'bg-slate-600 text-white shadow-lg'
    };
    return activeMap[themeColor] || activeMap.slate;
  };

  const getInputClass = () => {
    const focusMap = {
      rose: 'focus:border-rose-500 focus:ring-rose-100',
      indigo: 'focus:border-indigo-500 focus:ring-indigo-100',
      teal: 'focus:border-teal-500 focus:ring-teal-100',
      slate: 'focus:border-slate-500 focus:ring-slate-100'
    };
    return `w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 transition-all ${focusMap[themeColor] || focusMap.slate}`;
  };

  const getFileButtonClass = () => {
    const fileMap = {
      rose: 'file:bg-rose-500 hover:file:bg-rose-600',
      indigo: 'file:bg-indigo-600 hover:file:bg-indigo-700',
      teal: 'file:bg-teal-600 hover:file:bg-teal-700',
      slate: 'file:bg-slate-600 hover:file:bg-slate-700',
    };
    return `w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:text-white file:cursor-pointer cursor-pointer outline-none transition-all ${fileMap[themeColor] || fileMap.slate}`;
  };

  return (
    <>
      {/* Payment Mode */}
      <div className="lg:col-span-2">
        <label className={`block text-xs font-bold text-slate-600 mb-2`}>Payment Mode </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'CASH', label: 'Cash' },
            { value: 'BANK', label: 'Bank Transfer' },
            { value: 'CHEQUE', label: 'Cheque' }
          ].map(mode => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setFormData(p => ({ ...p, paymentMode: mode.value }))}
              className={`py-3 px-4 rounded-xl font-bold text-xs transition-all ${getButtonClass(formData.paymentMode === mode.value)}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Fields for BANK/CHEQUE */}
      {formData.paymentMode !== 'CASH' && (
        <>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              {formData.paymentMode === 'BANK' ? 'Transaction ID / Ref No.' : 'Cheque Number'}
            </label>
            <input
              type="text"
              name={formData.paymentMode === 'BANK' ? 'transactionId' : 'chequeNumber'}
              placeholder={formData.paymentMode === 'BANK' ? 'e.g. TXN-349823' : 'e.g. 123456'}
              className={getInputClass()}
              onChange={handleInputChange}
              value={formData.paymentMode === 'BANK' ? formData.transactionId : formData.chequeNumber}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Bank Name</label>
            <input
              type="text"
              name="bankName"
              placeholder="e.g. Nabil Bank"
              className={getInputClass()}
              onChange={handleInputChange}
              value={formData.bankName}
            />
          </div>
        </>
      )}

      {/* File Attachment */}
      <div className="lg:col-span-2">
        <label className="block text-xs font-bold text-slate-600 mb-2">{fileLabel}</label>
        <div className="relative">
          <input
            type="file"
            onChange={(e) => setFormData(prev => ({ ...prev, [fileKey]: e.target.files[0] }))}
            accept="image/*"
            className={getFileButtonClass()}
          />
        </div>
        {formData[fileKey] && (
          <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {formData[fileKey].name}
          </p>
        )}
      </div>
    </>
  );
};

export default PaymentMethodSelector;
