import React from 'react';

const SalesRegisterView = ({ data, financialYear }) => (
  <div className="space-y-6">
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Sales Register</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">For Financial Year {financialYear}</p>
    </div>

    <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-100/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
      <div className="bg-amber-100/50 p-2 rounded-lg text-amber-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          <span className="font-bold text-slate-900">Sales Register:</span> A detailed list of all sales and invoices, including the VAT collected.
        </p>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80">
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Miti (Date)</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Invoice No.</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Buyer Name</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">PAN</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Item/Service</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Qty</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Total Sales</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Exempted Sales</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Export Sales</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Taxable Sales</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-indigo-500 whitespace-nowrap">VAT (13%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.sales.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-xs font-bold text-slate-700 whitespace-nowrap">{item.invoiceNumber}</td>
                <td className="px-5 py-4 text-sm font-bold text-slate-800 whitespace-nowrap">{item.buyerName}</td>
                <td className="px-5 py-4 text-xs font-medium text-slate-600 font-mono whitespace-nowrap">{item.buyerPan}</td>
                <td className="px-5 py-4 text-xs font-bold text-slate-700 whitespace-nowrap">{item.serviceType}</td>
                <td className="px-5 py-4 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">{item.quantity} {item.unit}</td>
                <td className="px-5 py-4 text-right text-sm font-black text-slate-900 font-mono whitespace-nowrap">{(item.amountBeforeVAT + item.vatAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-600 font-mono whitespace-nowrap">{item.exemptedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-600 font-mono whitespace-nowrap">{item.exportSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-600 font-mono whitespace-nowrap">{item.taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right text-sm font-bold text-indigo-600 font-mono whitespace-nowrap">{item.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {data.sales.length === 0 && (
              <tr>
                <td colSpan="11" className="px-6 py-12 text-center text-slate-500">
                  <span className="block text-2xl mb-2">📄</span>
                  <span className="text-sm font-medium">No sales records found for this period.</span>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 border-t border-slate-800">
              <td colSpan="6" className="px-5 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">TOTAL FOR FINANCIAL YEAR:</td>
              <td className="px-5 py-5 text-right text-base font-black text-white font-mono whitespace-nowrap">{(data.totals.amountBeforeVAT + data.totals.vatAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono whitespace-nowrap">{data.totals.exemptedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono whitespace-nowrap">{data.totals.exportSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono whitespace-nowrap">{data.totals.taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-indigo-400 font-mono whitespace-nowrap">{data.totals.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
);

export default SalesRegisterView;
