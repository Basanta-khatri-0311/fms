import React from 'react';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const PurchaseRegisterView = ({ data, financialYear }) => {
  const { settings } = useSystemSettings();
  
  return (
    <div className="space-y-6">
      <div className="text-center pb-6 border-b border-slate-200">
        <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">TAX COMPLIANCE REPORT</h3>
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-1">{settings.systemName}</h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">PAN: {settings.taxSettings?.panNumber || '---'}</p>
        <h4 className="text-3xl font-black text-slate-900 tracking-tight">Purchase Register (Internal)</h4>
        <p className="text-sm font-medium text-slate-500 mt-2">For Financial Year {financialYear}</p>
      </div>

      <div className="bg-linear-to-r from-rose-50 to-pink-50 border border-rose-100/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
        <div className="bg-rose-100/50 p-2 rounded-lg text-rose-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <div>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            <span className="font-bold text-slate-900">Purchase Register:</span> A detailed list of all purchases and expenses, including the VAT paid.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80">
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Miti (Date)</th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Bill/Customs No.</th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Supplier Name</th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Supplier PAN</th>
                <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Total Purchase</th>
                <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Exempted Purchase</th>
                <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Taxable Purchase</th>
                <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-indigo-500 whitespace-nowrap">VAT (13%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.purchases.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-700 whitespace-nowrap">{item.billNumber}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-800 whitespace-nowrap">{item.vendorName}</td>
                  <td className="px-5 py-4 text-xs font-medium text-slate-600 font-mono whitespace-nowrap">{item.vendorPan}</td>
                  <td className="px-5 py-4 text-right text-sm font-black text-slate-900 font-mono whitespace-nowrap">{(item.amountBeforeVAT + item.vatAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-4 text-right text-sm font-semibold text-slate-600 font-mono whitespace-nowrap">{item.exemptedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-4 text-right text-sm font-semibold text-slate-600 font-mono whitespace-nowrap">{item.taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-4 text-right text-sm font-bold text-indigo-600 font-mono whitespace-nowrap">{item.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {data.purchases.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    <span className="block text-2xl mb-2">🧾</span>
                    <span className="text-sm font-medium">No purchase records found for this period.</span>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 border-t border-slate-800">
                <td colSpan="4" className="px-5 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">TOTAL FOR FINANCIAL YEAR:</td>
                <td className="px-5 py-5 text-right text-base font-black text-white font-mono whitespace-nowrap">{(data.totals.amountBeforeVAT + data.totals.vatAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-5 text-right text-sm font-black text-white font-mono whitespace-nowrap">{data.totals.exemptedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-5 text-right text-sm font-black text-white font-mono whitespace-nowrap">{data.totals.taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-5 text-right text-sm font-black text-indigo-400 font-mono whitespace-nowrap">{data.totals.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRegisterView;
