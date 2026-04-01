import React from 'react';
import ReportFilterBar from './ReportFilterBar';

const ExpenseReportView = ({ data, financialYear, filters, setFilters }) => (
  <div className="space-y-6 flex-1 flex flex-col">
    <ReportFilterBar filters={filters} setFilters={setFilters} reportType="expense-report" />

    {/* Group Wise Summary */}
    {data.groupSummary && data.groupSummary.length > 0 && (
      <div className="flex flex-wrap gap-4">
        {data.groupSummary.map((grp, i) => (
          <div key={i} className="bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm flex flex-col items-start min-w-[150px]">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{grp.category}</span>
             <span className="text-sm font-black text-slate-800 font-mono">{grp.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        ))}
      </div>
    )}

    {/* Table */}
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-1">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th className="px-4 py-4">Bill Date</th>
              <th className="px-4 py-4">Bill No</th>
              <th className="px-4 py-4">Purchased From</th>
              <th className="px-4 py-4">Payment Category</th>
              <th className="px-4 py-4">Branch</th>
              <th className="px-4 py-4 text-right">TDS Amt</th>
              <th className="px-4 py-4 text-right">Total Amt Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors text-xs font-medium text-slate-600">
                <td className="px-4 py-3.5 whitespace-nowrap">{new Date(item.billDate).toLocaleDateString()}</td>
                <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-700">{item.billNumber}</td>
                <td className="px-4 py-3.5 font-bold text-slate-800">{item.purchasedFrom}</td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${item.type === 'PAYROLL' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                     {item.paymentCategory}
                   </span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">{item.branch}</td>
                <td className="px-4 py-3.5 text-right font-semibold text-rose-500 font-mono">{item.tdsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3.5 text-right font-bold text-slate-900 font-mono">{item.totalAmountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {data.data.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                  <span className="text-sm font-medium">No expenses/payroll found for this period.</span>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 border-t border-slate-800 text-white font-mono text-sm">
              <td colSpan="5" className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">TOTAL</td>
              <td className="px-4 py-4 text-right font-bold">{data.totals.tdsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-4 py-4 text-right font-black text-rose-400">{data.totals.totalAmountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
);

export default ExpenseReportView;
