import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import TransactionStatus from '../../components/transactions/TransactionStatus';
import IncomeModal from '../receptionist/modals/IncomeEntryModal';
import ExpenseModal from '../receptionist/modals/ExpenseEntryModal';
import PayrollModal from '../receptionist/modals/PayrollEntryModal';

const ApproverDashboard = () => {
  const [stats, setStats] = useState({
    incomeCount: 0,
    expenseCount: 0,
    payrollCount: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canAccessPayroll = user?.permissions?.canAccessPayroll;

  const fetchStats = React.useCallback(async () => {
    try {
      const hasPayrollAccess = canAccessPayroll || user?.role === 'SUPERADMIN';
      const [incRes, expRes, payRes] = await Promise.all([
        API.get('/incomes'), 
        API.get('/expenses'),
        ...(hasPayrollAccess ? [API.get('/payroll')] : [])
      ]);
      const incomes = Array.isArray(incRes.data.data) ? incRes.data.data : incRes.data || [];
      const expenses = Array.isArray(expRes.data) ? expRes.data : expRes.data.data || [];
      
      let pendingPay = [];
      let payrollTotal = 0;
      if (hasPayrollAccess && payRes) {
        const payrolls = Array.isArray(payRes.data) ? payRes.data : payRes.data.data || [];
        pendingPay = payrolls.filter((p) => p.status === 'PENDING');
        payrollTotal = pendingPay.reduce((a, c) => a + (c.netPayable || 0), 0);
      }

      const pendingIn = incomes.filter((i) => i.status === 'PENDING');
      const pendingEx = expenses.filter((e) => e.status === 'PENDING');

      setStats({
        incomeCount: pendingIn.length,
        expenseCount: pendingEx.length,
        payrollCount: pendingPay.length,
        totalValue:
          pendingIn.reduce((a, c) => a + (c.netAmount || 0), 0) +
          pendingEx.reduce((a, c) => a + (c.netPayable || 0), 0) +
          payrollTotal,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [canAccessPayroll, user?.role]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <div className="p-10 text-center font-bold text-slate-500">Loading Stats...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100 p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Section */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-900/10 border border-slate-700 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-indigo-200 text-sm font-bold uppercase tracking-widest mb-4">
              Pending Approvals
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-300 tracking-tight">
              Action Required
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveModal('INCOME')}
              className="px-5 py-2.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 border border-indigo-500/50 backdrop-blur-sm transition-all"
            >
              + Income
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('EXPENSE')}
              className="px-5 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 border border-rose-500/50 backdrop-blur-sm transition-all"
            >
              + Expense
            </button>
            {(canAccessPayroll || user?.role === 'SUPERADMIN') && (
              <button
                type="button"
                onClick={() => setActiveModal('PAYROLL')}
                className="px-5 py-2.5 bg-teal-600/90 hover:bg-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 border border-teal-500/50 backdrop-blur-sm transition-all"
              >
                + Payroll
              </button>
            )}
          </div>
        </div>
      </header>
      {/* Stat Cards */}
      <div className={`grid grid-cols-1 gap-6 ${(canAccessPayroll || user?.role === 'SUPERADMIN') ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <StatCard label="Pending Incomes" value={stats.incomeCount} color="blue" />
        <StatCard label="Pending Expenses" value={stats.expenseCount} color="rose" />
        {(canAccessPayroll || user?.role === 'SUPERADMIN') && (
          <StatCard label="Pending Payrolls" value={stats.payrollCount} color="teal" />
        )}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] shadow-xl shadow-slate-900/20 border border-slate-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Awaiting Value</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Rs. {stats.totalValue.toLocaleString()}</h2>
          </div>
        </div>
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
      {activeModal === 'PAYROLL' && (
        <PayrollModal onClose={() => setActiveModal(null)} refreshData={fetchStats} />
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className={`bg-gradient-to-br from-white to-slate-50 p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-${color}-100/50 relative overflow-hidden group`}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />
    <div className="relative z-10">
      <p className={`text-[10px] font-black uppercase tracking-widest text-${color}-600/80 mb-2`}>{label}</p>
      <h2 className="text-4xl md:text-5xl font-black text-slate-800">{value}</h2>
    </div>
  </div>
);

export default ApproverDashboard;