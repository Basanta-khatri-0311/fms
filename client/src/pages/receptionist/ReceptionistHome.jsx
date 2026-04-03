import React, { useState } from 'react';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import IncomeModal from './modals/IncomeEntryModal';
import ExpenseModal from './modals/ExpenseEntryModal';
import PayrollModal from './modals/PayrollEntryModal';

const ReceptionistDashboard = () => {
  const [activeModal, setActiveModal] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canAccessPayroll = user?.permissions?.canAccessPayroll;

  const ACTIONS = [
    { id: 'INCOME', title: "Record Income", desc: "Record received payments and generate invoices", bgClass: "bg-indigo-600", hoverbgClass: "hover:bg-indigo-500", icon: "💰", accent: "from-indigo-400 to-blue-500" },
    { id: 'EXPENSE', title: "Record Expense", desc: "Record vendor bills and company payments", bgClass: "bg-rose-600", hoverbgClass: "hover:bg-rose-500", icon: "🧾", accent: "from-rose-400 to-orange-500" },
    ...(canAccessPayroll ? [{ id: 'PAYROLL', title: "Process Payroll", desc: "Record employee salaries and PF deductions", bgClass: "bg-teal-600", hoverbgClass: "hover:bg-teal-500", icon: "👥", accent: "from-teal-400 to-emerald-500" }] : [])
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100 p-6 md:p-8 space-y-10">

      {/* Header Section */}
      <header className="relative bg-slate-900 rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-slate-900/10 overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-block px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-indigo-300 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
            Staff Dashboard
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-100 to-slate-400 mb-6 tracking-tight leading-tight">
            Daily Transactions
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
            Record and manage daily payments, expenses, and payroll. Select a category below to get started.
          </p>
        </div>
      </header>

      {/* Primary Operations Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto py-4">
        {ACTIONS.map(action => (
          <button
            key={action.id}
            onClick={() => setActiveModal(action.id)}
            className="group relative bg-white rounded-[2.5rem] p-10 text-left shadow-2xl shadow-slate-100 border border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl overflow-hidden"
          >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full bg-linear-to-br ${action.accent} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 -mr-16 -mt-16 blur-2xl`} />

            {/* Icon Sphere */}
            <div className={`w-20 h-20 rounded-[1.75rem] bg-linear-to-br ${action.accent} flex items-center justify-center text-4xl mb-10 shadow-xl group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6`}>
              <span className="drop-shadow-md">{action.icon}</span>
            </div>

            {/* Content Identity */}
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors tracking-tight">
                {action.title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                {action.desc}
              </p>
            </div>

            {/* Action Meta */}
            <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-50">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-400 transition-colors">Record Now</span>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* Modal Controller */}
      {activeModal === 'INCOME' && <IncomeModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'EXPENSE' && <ExpenseModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'PAYROLL' && canAccessPayroll && <PayrollModal onClose={() => setActiveModal(null)} />}
      {/* {activeModal === 'ADVANCE' && <AdvanceModal onClose={() => setActiveModal(null)} />} */}

    </div>
  );
};

export default ReceptionistDashboard;