import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import TransactionStatus from '../../components/transactions/TransactionStatus';
import IncomeModal from '../receptionist/modals/IncomeEntryModal';
import ExpenseModal from '../receptionist/modals/ExpenseEntryModal';

const ApproverDashboard = () => {
  const [stats, setStats] = useState({
    incomeCount: 0,
    expenseCount: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  

  const fetchStats = async () => {
    try {
      const [incRes, expRes] = await Promise.all([API.get('/incomes'), API.get('/expenses')]);
      const incomes = Array.isArray(incRes.data.data) ? incRes.data.data : incRes.data || [];
      const expenses = Array.isArray(expRes.data) ? expRes.data : expRes.data.data || [];

      const pendingIn = incomes.filter((i) => i.status === 'PENDING');
      const pendingEx = expenses.filter((e) => e.status === 'PENDING');

      setStats({
        incomeCount: pendingIn.length,
        expenseCount: pendingEx.length,
        rejectedCount: [...incomes, ...expenses].filter((e) => e.status === 'REJECTED').length,
        totalValue:
          pendingIn.reduce((a, c) => a + (c.netAmount || 0), 0) +
          pendingEx.reduce((a, c) => a + (c.netPayable || 0), 0),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-10 text-center font-bold text-slate-500">Loading Stats...</div>;
  }

  return (
    <div className="space-y-6">

      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Pending Incomes" value={stats.incomeCount} color="blue" />
        <StatCard label="Pending Expenses" value={stats.expenseCount} color="rose" />
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Value</p>
          <h2 className="text-2xl font-black text-white mt-2">Rs. {stats.totalValue.toLocaleString()}</h2>
        </div>
      </div>


      {/* Quick entry buttons for Approver */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setActiveModal('INCOME')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
        >
          Add Income
        </button>
        <button
          type="button"
          onClick={() => setActiveModal('EXPENSE')}
          className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
        >
          Add Expense
        </button>
      </div>


      {/* The Pending Table */}
      <TransactionStatus mode="PENDING" onRefresh={fetchStats} />

      {/* Creation modals */}
      {activeModal === 'INCOME' && (
        <IncomeModal onClose={() => setActiveModal(null)} refreshData={fetchStats} />
      )}
      {activeModal === 'EXPENSE' && (
        <ExpenseModal onClose={() => setActiveModal(null)} refreshData={fetchStats} />
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm">
    <p className={`text-[10px] font-black uppercase tracking-widest text-${color}-400`}>{label}</p>
    <h2 className="text-4xl font-black text-slate-900 mt-2">{value}</h2>
  </div>
);

export default ApproverDashboard;