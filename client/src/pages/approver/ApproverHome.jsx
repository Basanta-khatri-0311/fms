import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import TransactionStatus from '../receptionist/TransactionTable'; 
const ApproverDashboard = () => {
  const [stats, setStats] = useState({ incomeCount: 0, expenseCount: 0, totalValue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [inc, exp] = await Promise.all([
          API.get('/incomes'),
          API.get('/expenses')
        ]);
        
        const pendingIncomes = inc.data.data.filter(i => i.status === 'PENDING');
        const pendingExpenses = exp.data.filter(e => e.status === 'PENDING');

        setStats({
          incomeCount: pendingIncomes.length,
          expenseCount: pendingExpenses.length,
          totalValue: pendingIncomes.reduce((acc, curr) => acc + curr.netAmount, 0) +
                      pendingExpenses.reduce((acc, curr) => acc + curr.netPayable, 0)
        });
      } catch (err) {
        console.error("Stats fetch error", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Metric Ribbons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-50 shadow-sm">
          <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Pending Incomes</p>
          <h2 className="text-4xl font-black text-slate-900 mt-2">{stats.incomeCount}</h2>
          <div className="h-1 w-12 bg-blue-500 rounded-full mt-4" />
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-rose-50 shadow-sm">
          <p className="text-xs font-black text-rose-400 uppercase tracking-widest">Pending Expenses</p>
          <h2 className="text-4xl font-black text-slate-900 mt-2">{stats.expenseCount}</h2>
          <div className="h-1 w-12 bg-rose-500 rounded-full mt-4" />
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Value for Review</p>
          <h2 className="text-4xl font-black text-white mt-2">Rs. {stats.totalValue.toLocaleString()}</h2>
          <p className="text-emerald-400 text-[10px] font-bold mt-2 uppercase">Awaiting Ledger Entry</p>
        </div>
      </div>

      {/*The Main Decision Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div>
              <h3 className="text-xl font-black text-slate-900">Verification Queue</h3>
              <p className="text-sm text-slate-500 font-medium">Review, Verify, and Post to Ledger</p>
           </div>
           <div className="flex gap-2">
              <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
           </div>
        </div>
        
        {/* Reusing the table but strictly in PENDING mode */}
        <TransactionStatus />
      </div>
    </div>
  );
};

export default ApproverDashboard;