import React from 'react';

const PurchaseRegisterView = ({ data, financialYear }) => (
  <div className="space-y-6">
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Purchase Register</h4>
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
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Bill No.</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Vendor & PAN</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Discount</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-indigo-500">VAT (13%)</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">TDS</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-900 bg-slate-100/50">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.purchases.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 text-xs font-semibold text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-xs font-bold text-slate-700">{item.billNumber}</td>
                <td className="px-5 py-4">
                  <div className="text-sm font-bold text-slate-800 tracking-wide">{item.vendorName}</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-widest">PAN: <span className="text-slate-600">{item.vendorPan}</span></div>
                </td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-600 font-mono">{item.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-indigo-500 font-mono">{item.discount > 0 ? `-${item.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00'}</td>
                <td className="px-5 py-4 text-right text-sm font-bold text-indigo-600 font-mono">{item.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-rose-500 font-mono">{item.tdsAmount > 0 ? `-${item.tdsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00'}</td>
                <td className="px-5 py-4 text-right text-sm font-black text-slate-900 font-mono">{item.netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
              <td colSpan="3" className="px-5 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL FOR FINANCIAL YEAR:</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono">{data.totals.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono">{data.totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-indigo-400 font-mono">{data.totals.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono">{data.totals.tdsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-base font-black text-white font-mono">{data.totals.netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
);

export default PurchaseRegisterView;
