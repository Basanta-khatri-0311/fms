import React, { useState } from 'react';
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
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">

      {/* Header Section */}
      <header className="relative bg-slate-900 rounded-3xl p-10 md:p-12 shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-full h-full bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />

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
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
        {ACTIONS.map(action => (
          <button
            key={action.id}
            onClick={() => setActiveModal(action.id)}
            className="group relative bg-white rounded-3xl p-8 text-left shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-md hover:border-slate-300 overflow-hidden"
          >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-linear-to-br ${action.accent} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 -mr-10 -mt-10 blur-xl pointer-events-none`} />

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
      </div>
    </div>
  );
};

export default ReceptionistDashboard;