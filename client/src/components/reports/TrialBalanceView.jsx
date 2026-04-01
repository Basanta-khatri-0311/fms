import React from 'react';

const TrialBalanceView = ({ data, financialYear }) => (
  <div className="space-y-6">
    {/* Report Header */}
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Trial Balance</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">As of Financial Year {financialYear}</p>
    </div>

    {/* Info Banner */}
    <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
      <div className="bg-blue-100/50 p-2 rounded-lg text-blue-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          <span className="font-bold text-slate-900">Trial Balance:</span> This report lists all your accounts and their totals. The total Debits must match the total Credits to ensure your books are balanced.
        </p>
      </div>
    </div>

    {/* Grouped Accounts Table */}
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80">
              <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">
                Account Name
              </th>
              <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                Debit
              </th>
              <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                Credit
              </th>
              <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.groups.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                {/* Group Header */}
                <tr className="bg-slate-50/50">
                  <td colSpan="4" className="px-6 py-4">
                    <span className="font-bold text-[11px] text-indigo-600 uppercase tracking-widest">
                      {group.groupLabel}
                    </span>
                  </td>
                </tr>
                
                {/* Group Accounts */}
                {group.accounts.map((account, accIdx) => (
                  <tr key={accIdx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 pl-12 text-sm font-medium text-slate-700">
                      {account.accountName}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold text-slate-600 font-mono">
                      {account.debitTotal > 0 ? account.debitTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold text-slate-600 font-mono">
                      {account.creditTotal > 0 ? account.creditTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td className={`px-6 py-3.5 text-right text-sm font-semibold font-mono ${
                      account.balance >= 0 ? 'text-slate-900' : 'text-rose-600'
                    }`}>
                      {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                
                {/* Group Subtotal */}
                <tr className="bg-slate-50/80 border-t border-slate-200/60">
                  <td className="px-6 py-4 pl-12 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Subtotal
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 font-mono">
                    {group.subtotalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 font-mono">
                    {group.subtotalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 font-mono">
                    {group.subtotalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
          
          {/* Grand Total */}
          <tfoot>
            <tr className="bg-slate-900 border-t border-slate-800">
              <td className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">GRAND TOTAL</td>
              <td className="px-6 py-5 text-right text-base font-black text-white font-mono">{data.grandTotalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-6 py-5 text-right text-base font-black text-white font-mono">{data.grandTotalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-6 py-5 text-right text-sm">
                {data.isBalanced ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Balanced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Unbalanced
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
);

export default TrialBalanceView;
