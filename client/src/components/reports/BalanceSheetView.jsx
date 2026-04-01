import React from 'react';

const BalanceSheetView = ({ data, financialYear }) => (
  <div className="space-y-6">
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Balance Sheet</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">As of Financial Year {financialYear}</p>
    </div>

    <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
      <div className="bg-blue-100/50 p-2 rounded-lg text-blue-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          <span className="font-bold text-slate-900">Balance Sheet:</span> A summary of what your business owns (Assets) and what it owes (Liabilities and Equity).
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* ASSETS */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 p-5">
          <h5 className="text-[10px] font-black text-indigo-500 tracking-widest uppercase">ASSETS</h5>
        </div>
        <div className="p-6 space-y-6 flex-1">
          
          <div>
            <h6 className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Current Assets</h6>
            <div className="space-y-1">
              {data.assets.current.accounts.map((acc, idx) => (
                <div key={idx} className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">
                    {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between py-3 px-3 bg-slate-50 rounded-lg mt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Current Assets</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                {data.assets.current.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <h6 className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Fixed Assets</h6>
            <div className="space-y-1">
              {data.assets.fixed.accounts.map((acc, idx) => (
                <div key={idx} className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">
                    {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between py-3 px-3 bg-slate-50 rounded-lg mt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Fixed Assets</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                {data.assets.fixed.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6 pt-0 mt-auto">
          <div className="flex justify-between py-4 px-5 bg-slate-900 text-white rounded-xl shadow-md border border-slate-700">
            <span className="text-xs font-black uppercase tracking-widest">TOTAL ASSETS</span>
            <span className="text-lg font-black font-mono">
              {data.assets.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* LIABILITIES & EQUITY */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 p-5">
          <h5 className="text-[10px] font-black text-rose-500 tracking-widest uppercase">LIABILITIES & EQUITY</h5>
        </div>
        <div className="p-6 space-y-6 flex-1">
          
          <div>
            <h6 className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Current Liabilities & Creditors</h6>
            <div className="space-y-1">
              {data.liabilities.current.accounts.map((acc, idx) => (
                <div key={idx} className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">
                    {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between py-3 px-3 bg-slate-50 rounded-lg mt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Current Lib.</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                {data.liabilities.current.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {data.liabilities.longTerm.total > 0 && (
            <div>
              <h6 className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Long-term (Non-Current) Liabilities</h6>
              <div className="space-y-1">
                {data.liabilities.longTerm.accounts.map((acc, idx) => (
                  <div key={idx} className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                    <span className="text-sm font-semibold text-slate-800 font-mono">
                      {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between py-3 px-3 bg-slate-50 rounded-lg mt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Non-Current Lib.</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {data.liabilities.longTerm.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <div>
            <h6 className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Capital (Equity)</h6>
            <div className="space-y-1">
              <div className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600 font-medium">Reserves & Surplus (Retained Earnings)</span>
                <span className="text-sm font-semibold text-slate-800 font-mono">
                  {data.equity.retainedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="flex justify-between py-3 px-3 bg-slate-50 rounded-lg mt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Equity</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                {data.equity.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 mt-auto">
          <div className="flex justify-between py-4 px-5 bg-slate-900 text-white rounded-xl shadow-md border border-slate-700">
            <span className="text-xs font-black uppercase tracking-widest">TOTAL</span>
            <span className="text-lg font-black font-mono">
              {data.totalLiabilitiesAndEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className={`p-4 rounded-xl text-center font-bold text-xs tracking-widest uppercase border ${
      data.isBalanced 
        ? 'bg-emerald-50 border-emerald-500/30 text-emerald-600' 
        : 'bg-rose-50 border-rose-500/30 text-rose-600'
    }`}>
      {data.isBalanced 
        ? '(✓) Balance Sheet is in equilibrium' 
        : '(⚠️) Warning: Balance Sheet is not balanced'}
    </div>
  </div>
);

export default BalanceSheetView;
