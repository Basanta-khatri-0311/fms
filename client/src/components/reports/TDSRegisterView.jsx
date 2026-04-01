import React from 'react';

const TDSRegisterView = ({ data, financialYear }) => (
  <div className="space-y-6">
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">COMPLIANCE REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">TDS Register</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">For Financial Year {financialYear}</p>
    </div>

    <div className="bg-linear-to-r from-violet-50 to-fuchsia-50 border border-violet-100/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
      <div className="bg-violet-100/50 p-2 rounded-lg text-violet-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          <span className="font-bold text-slate-900">TDS Reports:</span> Automatically tracks Tax Deducted at Source for both Output (Receivable) and Input (Payable) transactions.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total TDS Payable</div>
          <div className="text-3xl font-black font-mono text-rose-500">{data.totals.totalTDSPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
       </div>
       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total TDS Receivable</div>
          <div className="text-3xl font-black font-mono text-emerald-500">{data.totals.totalTDSReceivable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
       </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80">
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Date</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Source</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Party & PAN</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Bill No</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Base Amount</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Type</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-violet-500 whitespace-nowrap">TDS Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.tdsData.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-xs font-bold text-slate-700 whitespace-nowrap">{item.source}</td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-slate-800 tracking-wide">{item.partyName}</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-widest">PAN: <span className="text-slate-600">{item.partyPan}</span></div>
                </td>
                <td className="px-5 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">{item.billNumber}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-600 font-mono whitespace-nowrap">{item.baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${
                    item.type === 'TDS_PAYABLE' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {item.type === 'TDS_PAYABLE' ? 'Payable' : 'Receivable'}
                  </span>
                </td>
                <td className={`px-5 py-4 text-right text-sm font-bold font-mono whitespace-nowrap ${
                    item.type === 'TDS_PAYABLE' ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                    {item.tdsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {data.tdsData.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                  <span className="block text-2xl mb-2">📑</span>
                  <span className="text-sm font-medium">No TDS records found for this period.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default TDSRegisterView;
