import React, { useState } from 'react';

const IncomeStatementView = ({ data, financialYear }) => {
  const [depreciation, setDepreciation] = useState('');
  
  const depAmount = parseFloat(depreciation) || 0;
  const operatingProfit = data.operatingProfit;
  const pbit = operatingProfit - depAmount;

  return (
  <div className="space-y-6">
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Income Statement</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">From Shrawan 1 to Ashadh 31 - {financialYear}</p>
    </div>

    <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
      <div className="bg-emerald-100/50 p-2 rounded-lg text-emerald-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          <span className="font-bold text-slate-900">Income Statement:</span> View your Revenue Sales (e.g., IELTS/PTE) and Other Incomes against categorized expenditures. Enter depreciation manually to calculate Profit Before Interest & Tax (PBIT).
        </p>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-8 space-y-8">
        <div>
          <h5 className="text-[10px] font-black text-indigo-500 mb-3 uppercase tracking-widest border-b border-slate-100 pb-2">
            Revenue & Other Incomes
          </h5>
          <div className="space-y-1">
            {data.revenue.breakdown.map((acc, idx) => (
              <div key={idx} className="flex justify-between py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                <span className="text-sm font-semibold text-slate-800 font-mono">
                  {acc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between py-3 px-4 bg-slate-50 rounded-lg mt-3 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Revenue (Gross Profit)</span>
            <span className="text-sm font-black text-slate-900 font-mono text-indigo-600">
              {data.revenue.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div>
          <h5 className="text-[10px] font-black text-rose-500 mb-3 uppercase tracking-widest border-b border-slate-100 pb-2">
            Categorized Expenditures (Inc. Payroll)
          </h5>
          <div className="space-y-1">
            {data.expenses.breakdown.map((acc, idx) => (
              <div key={idx} className="flex justify-between py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                <span className="text-sm font-semibold text-slate-800 font-mono">
                  {acc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between py-3 px-4 bg-slate-50 rounded-lg mt-3 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Operating Expenses</span>
            <span className="text-sm font-black text-slate-900 font-mono text-rose-600">
              {data.expenses.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div>
          <h5 className="text-[10px] font-black text-amber-600 mb-3 uppercase tracking-widest border-b border-slate-100 pb-2">
            Non-Cash Expenditures
          </h5>
          <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-amber-50/50 border border-amber-100">
            <span className="text-sm text-amber-800 font-bold">Manual Depreciation Value</span>
            <input 
              type="number" 
              placeholder="Enter amount..."
              value={depreciation}
              onChange={(e) => setDepreciation(e.target.value)}
              className="text-right text-sm font-semibold text-slate-800 font-mono px-3 py-1.5 rounded-lg border border-slate-300 w-40 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className={`p-8 rounded-2xl border bg-slate-900 ${
          pbit >= 0 
            ? 'border-emerald-500/50 shadow-emerald-500/10' 
            : 'border-rose-500/50 shadow-rose-500/10'
        } shadow-lg transition-colors duration-300`}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm ${pbit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Profit Before Interest and Tax (PBIT)
              </div>
              <div className="text-sm text-slate-400 font-medium">
                {pbit >= 0 ? 'Your business achieved a positive PBIT.' : 'Your business achieved a negative PBIT.'}
              </div>
            </div>
            <div className={`text-4xl font-black font-mono tracking-tight drop-shadow-sm ${pbit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {Math.abs(pbit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-sm ml-2 text-slate-500 font-sans">{pbit >= 0 ? 'Profit' : 'Loss'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default IncomeStatementView;
