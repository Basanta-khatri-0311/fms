import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import TransactionStatus from '../../components/transactions/TransactionStatus';
import IncomeModal from '../receptionist/modals/IncomeEntryModal';
import ExpenseModal from '../receptionist/modals/ExpenseEntryModal';
import PayrollModal from '../receptionist/modals/PayrollEntryModal';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const ApproverDashboard = () => {
  const { settings, loading: settingsLoading } = useSystemSettings();
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

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">

      {/* Decision Center Header */}
      <header className="relative bg-slate-900 rounded-3xl p-10 md:p-12 shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-800 mb-8">
        <div className="absolute top-0 right-0 w-full h-full bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-3">
            <div className="inline-block px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-indigo-300 text-[11px] font-black uppercase tracking-[0.2em] mb-2">
              Approver Access
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-100 to-slate-400 tracking-tight leading-tight">
              Approval Queue
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-xl">
              Review and approve pending transactions, expenses, and payroll records.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveModal('INCOME')}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
            >
              + Record Income
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('EXPENSE')}
              className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-rose-500/20 hover:bg-rose-500 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
            >
              + Record Expense
            </button>
            {canAccessPayroll && (
              <button
                type="button"
                onClick={() => setActiveModal('PAYROLL')}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
              >
                + Process Payroll
              </button>
            )}
          </div>
        </div>
      </header>
      {/* Decision Metrics */}
      <div className={`grid grid-cols-1 gap-8 mb-10 ${(canAccessPayroll || user?.role === 'SUPERADMIN') ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <StatCard label="Awaiting Income" value={stats.incomeCount} color="indigo" />
        <StatCard label="Awaiting Expense" value={stats.expenseCount} color="rose" />
        {(canAccessPayroll || user?.role === 'SUPERADMIN') && (
          <StatCard label="Awaiting Payroll" value={stats.payrollCount} color="emerald" />
        )}
        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Total Pending Value</div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-2">{settings.currencySymbol} {stats.totalValue.toLocaleString()}</div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Pending Amount</span>
              </div>
            </div>
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
    </div>
  );
};

const StatCard = ({ label, value, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100/50',
    rose: 'bg-rose-50 text-rose-600 border-rose-100/50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
  };

  const glowClasses = {
    indigo: 'bg-indigo-500/5',
    rose: 'bg-rose-500/5',
    emerald: 'bg-emerald-500/5',
  };

  return (
    <div className={`relative bg-white p-8 rounded-3xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md hover:border-slate-300 transition-all duration-300`}>
      <div className={`absolute top-0 right-0 w-48 h-48 ${glowClasses[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className={`p-2.5 rounded-xl ${colorClasses[color]} shadow-sm`}>
            {color === 'indigo' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
            {color === 'rose' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>}
            {color === 'emerald' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
          </div>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-slate-400`}>{label}</p>
        </div>
        <div className="flex items-baseline gap-2">
           <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{value}</h2>
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entries</span>
        </div>
      </div>
    </div>
  );
};

export default ApproverDashboard;