import React from 'react';
import { numberToWords } from '../../utils/numberToWords';
import ReportFilterBar from './ReportFilterBar';

const IncomeReportView = ({ data, financialYear, filters, setFilters }) => (
  <div className="space-y-6 flex-1 flex flex-col">
    <ReportFilterBar filters={filters} setFilters={setFilters} reportType="income-report" />

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-1">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th className="px-4 py-4">Bill Date</th>
              <th className="px-4 py-4">Bill No</th>
              <th className="px-4 py-4">Party Details</th>
              <th className="px-4 py-4">Branch</th>
              <th className="px-4 py-4">Service</th>
              <th className="px-4 py-4 text-right">Amt B. VAT</th>
              <th className="px-4 py-4 text-right">VAT</th>
              <th className="px-4 py-4 text-right">Net Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors text-xs font-medium text-slate-600">
                <td className="px-4 py-3.5 whitespace-nowrap">{new Date(item.billDate).toLocaleDateString()}</td>
                <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-700">{item.billNumber}</td>
                <td className="px-4 py-3.5">
                  <div className="font-bold text-slate-800">{item.partyName}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.contactNumber} | {item.address}</div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">{item.branch}</td>
                <td className="px-4 py-3.5 whitespace-nowrap">{item.serviceType}</td>
                <td className="px-4 py-3.5 text-right font-semibold font-mono">{item.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3.5 text-right font-semibold text-indigo-500 font-mono">{item.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3.5 text-right font-bold text-slate-900 font-mono">{item.amountAfterVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {data.data.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                  <span className="text-sm font-medium">No income records found for this period.</span>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 border-t border-slate-800 text-white font-mono text-sm">
              <td colSpan="5" className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">TOTAL</td>
              <td className="px-4 py-4 text-right font-bold">{data.totals.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-4 py-4 text-right font-bold text-indigo-400">{data.totals.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-4 py-4 text-right font-black">{data.totals.amountAfterVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    
    <div className="bg-emerald-50 border border-emerald-500/20 p-5 rounded-2xl flex items-start gap-4 shadow-sm text-emerald-800">
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Total Amount Received In Words (Net)</div>
        <div className="text-sm font-bold capitalize">{numberToWords(data.totals.amountAfterVAT)}</div>
      </div>
    </div>
  </div>
);

export default IncomeReportView;
