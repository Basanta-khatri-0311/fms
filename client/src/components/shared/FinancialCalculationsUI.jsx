import React from 'react';
import { numberToWords } from '../../utils/numberToWords';
import { handleNumberKeyDown } from '../../utils/validation';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const FinancialCalculationsUI = ({ 
  formData, 
  handleInputChange, 
  handleFocus, 
  handleWheel,
  calculations,
  themeColor = 'blue',
  title = 'Base Amount *',
  netLabel = 'Total Amount',
  amountInputName = 'amountReceived',
  amountInputLabel = 'Amount Received *'
}) => {
  const { settings } = useSystemSettings();
  const { 
    vatAmount, 
    discount, 
    tdsAmount, 
    netAmount, 
    advanceAmount, 
    pendingAmount 
  } = calculations;

  // Theming map
  const themes = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', textLight: 'text-blue-500', headerBg: 'bg-indigo-600', textBold: 'text-blue-700' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', textLight: 'text-rose-500', headerBg: 'bg-indigo-600', textBold: 'text-rose-700' }
  };
  const theme = themes[themeColor] || themes.blue;

  return (
    <div className={`bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4`}>
      {/* Base Amount */}
      <div className={`bg-white p-4 sm:p-5 rounded-xl border-2 ${theme.border} shadow-sm`}>
        <label className={`block text-xs font-bold ${theme.text} mb-3`}>{title}</label>
        <div className="flex items-baseline gap-2">
          <span className="text-slate-500 font-bold text-lg">{settings.currencySymbol}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            name="amountBeforeVAT"
            required
            className={`flex-1 text-right text-xl sm:text-3xl font-black ${theme.text} bg-transparent outline-none`}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleNumberKeyDown}
            value={formData.amountBeforeVAT}
            placeholder="0.00"
            onWheel={handleWheel}
          />
        </div>
      </div>

      {/* Discount */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Discount (%)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            name="discountRate"
            className="w-full text-base sm:text-lg font-black text-emerald-600 outline-none"
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleNumberKeyDown}
            value={formData.discountRate}
            placeholder="0"
            onWheel={handleWheel}
          />
        </div>
        <div className="p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col justify-center">
          <span className="text-[10px] font-black text-emerald-500 uppercase mb-1">Discount Amount</span>
          <span className="text-base sm:text-lg font-black text-emerald-700">
            {discount > 0 ? `- ${settings.currencySymbol} ${discount.toFixed(2)}` : `${settings.currencySymbol} 0.00`}
          </span>
        </div>
      </div>

      {/* VAT */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">VAT Rate (%)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            name="vatRate"
            className="w-full text-base sm:text-lg font-black text-slate-800 outline-none"
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleNumberKeyDown}
            value={formData.vatRate}
            onWheel={handleWheel}
          />
        </div>
        <div className={`p-3 sm:p-4 ${theme.bg} rounded-xl border ${theme.border} flex flex-col justify-center`}>
          <span className={`text-[10px] font-black ${theme.textLight} uppercase mb-1`}>VAT Amount</span>
          <span className={`text-base sm:text-lg font-black ${theme.textBold}`}>+ {settings.currencySymbol} {vatAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* TDS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">TDS Rate (%)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            name="tdsRate"
            className="w-full text-base sm:text-lg font-black text-orange-600 outline-none"
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleNumberKeyDown}
            value={formData.tdsRate}
            placeholder="0"
            onWheel={handleWheel}
          />
        </div>
        <div className="p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-200 flex flex-col justify-center">
          <span className="text-[10px] font-black text-orange-500 uppercase mb-1">TDS Amount</span>
          <span className="text-base sm:text-lg font-black text-orange-700">
            {tdsAmount > 0 ? `- ${settings.currencySymbol} ${tdsAmount.toFixed(2)}` : `${settings.currencySymbol} 0.00`}
          </span>
        </div>
      </div>

      {/* Net Amount - Highlighted */}
      <div className={`p-5 ${theme.headerBg} rounded-xl shadow-lg`}>
        <div className="flex justify-between items-center text-white">
          <span className="text-xs font-bold uppercase tracking-wider">{netLabel}</span>
          <span className="text-xl sm:text-3xl font-black font-mono">{settings.currencySymbol} {netAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Amount in words toggle/display */}
      <div className="px-1 border-l-2 border-slate-200">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">In Words</p>
        <p className="text-xs font-bold text-slate-600 italic leading-tight">
          {numberToWords(netAmount)}
        </p>
      </div>

      {/* Amount Handled */}
      <div className="p-5 bg-emerald-500 rounded-xl shadow-lg">
        <label className="block text-xs font-bold text-emerald-50 uppercase mb-3">{amountInputLabel}</label>
        <div className="flex items-baseline gap-2">
          <span className="text-white font-bold text-lg">{settings.currencySymbol}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            name={amountInputName}
            required
            className="flex-1 text-right text-xl sm:text-3xl text-white px-3 py-2 rounded-lg outline-none placeholder-emerald-200 bg-transparent font-mono font-bold"
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleNumberKeyDown}
            value={formData[amountInputName]}
            placeholder="0.00"
            onWheel={handleWheel}
          />
        </div>
      </div>

      {/* Balance Indicator */}
      {(advanceAmount > 0 || pendingAmount > 0) && (
        <div className={`p-4 rounded-xl border-2 ${advanceAmount > 0
          ? 'bg-purple-50 border-purple-200'
          : 'bg-amber-50 border-amber-200'
          }`}>
          <div className="flex justify-between items-center">
            <span className={`text-xs font-bold uppercase ${advanceAmount > 0 ? 'text-purple-600' : 'text-amber-600'
              }`}>
              {advanceAmount > 0 ? 'Advance Payment' : 'Pending Payment'}
            </span>
            <span className={`text-xl font-black ${advanceAmount > 0 ? 'text-purple-700' : 'text-amber-700'
              }`}>
              {settings.currencySymbol} {advanceAmount > 0 ? advanceAmount.toFixed(2) : pendingAmount.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialCalculationsUI;
