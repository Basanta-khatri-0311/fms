import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import TransactionStatus from '../receptionist/TransactionTable';

const ApproverDashboard = () => {
  const [stats, setStats] = useState({
    incomeCount: 0,
    expenseCount: 0,
    rejectedCount: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [incResponse, expResponse] = await Promise.all([
        API.get('/incomes'),
        API.get('/expenses')
      ]);

      // Handle both response formats consistently
      const incomes = Array.isArray(incResponse.data)
        ? incResponse.data
        : (incResponse.data.data || []);

      const expenses = Array.isArray(expResponse.data)
        ? expResponse.data
        : (expResponse.data.data || expResponse.data || []);

      const pendingIncomes = incomes.filter(i => i.status === 'PENDING');
      const pendingExpenses = expenses.filter(e => e.status === 'PENDING');
      const rejectedAll = [...incomes, ...expenses].filter(e => e.status === 'REJECTED');

      setStats({
        incomeCount: pendingIncomes.length,
        expenseCount: pendingExpenses.length,
        rejectedCount: rejectedAll.length,
        totalValue: pendingIncomes.reduce((acc, curr) => acc + (curr.netAmount || 0), 0) +
          pendingExpenses.reduce((acc, curr) => acc + (curr.netPayable || 0), 0)
      });
    } catch (err) {
      console.error("Stats fetch error:", err);
      setStats({ incomeCount: 0, expenseCount: 0, rejectedCount: 0, totalValue: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Ribbons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Pending Incomes</p>
            
          </div>
          <h2 className="text-4xl font-black text-slate-900 mt-2">{stats.incomeCount}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-4" />
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-rose-50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-rose-400 uppercase tracking-widest">Pending Expenses</p>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mt-2">{stats.expenseCount}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full mt-4" />
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-red-50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-red-400 uppercase tracking-widest">Rejected Total</p>
            
          </div>
          <h2 className="text-4xl font-black text-slate-900 mt-2">{stats.rejectedCount}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full mt-4" />
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Value</p>
          </div>
          <h2 className="text-3xl font-black text-white mt-2">
            Rs. {stats.totalValue.toLocaleString()}
          </h2>
          <p className="text-emerald-400 text-[10px] font-bold mt-2 uppercase tracking-wider">
            Awaiting Ledger Entry
          </p>
        </div>
      </div>


      {/* The Main Decision Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-blue-50/30">
        </div>

        {/* Transaction Status Table */}
        <TransactionStatus onRefresh={fetchStats} />
      </div>
    </div>
  );
};

export default ApproverDashboard;