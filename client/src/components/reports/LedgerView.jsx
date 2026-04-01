import React from 'react';
import ReportFilterBar from './ReportFilterBar';

const LedgerView = ({ data, financialYear, filters, setFilters, accounts, reportType }) => (
  <div className="space-y-6 flex-1 flex flex-col">
    <ReportFilterBar filters={filters} setFilters={setFilters} reportType={reportType} accounts={accounts} />

    {/* Account Identification Header */}
    {data.account ? (
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-center shadow-md">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            {reportType === 'daily-cashbook' ? 'Cash/Bank Ledger' : 'Ledger Account'}
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-3">
             {data.account.name}
             <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider border border-slate-700">
               {data.account.code} / {data.account.type}
             </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Active Balance</div>
          <div className={`text-2xl font-black font-mono tracking-tight ${data.closingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {Math.abs(data.closingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            <span className="text-xs ml-1 text-slate-500 font-sans">{data.closingBalance >= 0 ? 'Dr' : 'Cr'}</span>
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
        Please select an account from the filter above to view its statement.
      </div>
    )}

    {data.account && (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Transaction ID</th>
                <th className="px-5 py-4">Particulars</th>
                <th className="px-5 py-4 text-right">Debit</th>
                <th className="px-5 py-4 text-right">Credit</th>
                <th className="px-5 py-4 text-right bg-slate-100 border-l border-slate-200">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Opening Balance Row */}
              <tr className="bg-slate-50 text-xs font-medium border-b-2 border-slate-200">
                <td className="px-5 py-4" colSpan="3">
                  <div className="font-bold text-slate-800 uppercase tracking-widest">Opening Balance B/d</div>
                </td>
                <td className="px-5 py-4 text-right text-slate-400">-</td>
                <td className="px-5 py-4 text-right text-slate-400">-</td>
                <td className="px-5 py-4 text-right font-black text-slate-900 border-l border-slate-200 bg-slate-100 font-mono">
                  {Math.abs(data.openingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  <span className="text-[10px] ml-1 text-slate-400">{data.openingBalance >= 0 ? 'Dr' : 'Cr'}</span>
                </td>
              </tr>

              {/* Transaction Rows */}
              {data.data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors text-xs font-medium text-slate-600">
                  <td className="px-5 py-3 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-mono text-[10px] text-slate-500">{String(item.transactionId).slice(-6)}</td>
                  <td className="px-5 py-3">
                    <span className="font-bold text-slate-700">{item.particulars}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-emerald-600 font-mono">
                    {item.debit > 0 ? item.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-rose-500 font-mono">
                    {item.credit > 0 ? item.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-slate-800 bg-slate-50 border-l border-slate-200 font-mono">
                    {Math.abs(item.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    <span className="text-[10px] ml-1 text-slate-400">{item.balance >= 0 ? 'Dr' : 'Cr'}</span>
                  </td>
                </tr>
              ))}
              
              {data.data.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <span className="text-sm font-medium">No transactions found for this period.</span>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 border-t border-slate-800 text-white font-mono text-sm">
                <td colSpan="3" className="px-5 py-4 uppercase font-black tracking-widest text-[10px] text-slate-400 text-right font-sans">
                  Closing Balance C/d
                </td>
                <td className="px-5 py-4 text-right text-slate-500">-</td>
                <td className="px-5 py-4 text-right text-slate-500">-</td>
                <td className="px-5 py-4 text-right font-black border-l border-slate-800 text-indigo-400">
                  {Math.abs(data.closingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  <span className="text-[10px] ml-1 text-slate-500 font-sans">{data.closingBalance >= 0 ? 'Dr' : 'Cr'}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )}
  </div>
);

export default LedgerView;
