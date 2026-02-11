import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import TransactionStatus from '../TransactionTable';

const ApproverDashboard = () => {
  const [stats, setStats] = useState({ incomeCount: 0, expenseCount: 0, rejectedCount: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [incRes, expRes] = await Promise.all([API.get('/incomes'), API.get('/expenses')]);
      const incomes = Array.isArray(incRes.data.data) ? incRes.data.data : (incRes.data || []);
      const expenses = Array.isArray(expRes.data) ? expRes.data : (expRes.data.data || []);

      const pendingIn = incomes.filter(i => i.status === 'PENDING');
      const pendingEx = expenses.filter(e => e.status === 'PENDING');
      
      setStats({
        incomeCount: pendingIn.length,
        expenseCount: pendingEx.length,
        rejectedCount: [...incomes, ...expenses].filter(e => e.status === 'REJECTED').length,
        totalValue: pendingIn.reduce((a, c) => a + (c.netAmount || 0), 0) + pendingEx.reduce((a, c) => a + (c.netPayable || 0), 0)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Loading Stats...</div>;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Pending Incomes" value={stats.incomeCount} color="blue" />
        <StatCard label="Pending Expenses" value={stats.expenseCount} color="rose" />
        <StatCard label="Rejected Total" value={stats.rejectedCount} color="red" />
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Value</p>
          <h2 className="text-2xl font-black text-white mt-2">Rs. {stats.totalValue.toLocaleString()}</h2>
        </div>
      </div>

      {/* The Pending Table */}
      <TransactionStatus mode="PENDING" onRefresh={fetchStats} />
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className={`bg-white p-6 rounded-3xl  shadow-sm`}>
    <p className={`text-[10px] font-black text-${color}-400 uppercase tracking-widest`}>{label}</p>
    <h2 className="text-4xl font-black text-slate-900 mt-2">{value}</h2>
  </div>
);

export default ApproverDashboard;