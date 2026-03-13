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
    { id: 'INCOME', title: "Income Entry", desc: "Record received payments and generate invoices", bgClass: "bg-indigo-600", hoverbgClass: "hover:bg-indigo-500", icon: "💰", accent: "from-indigo-400 to-blue-500" },
    { id: 'EXPENSE', title: "Expense Entry", desc: "Record vendor bills and company payments", bgClass: "bg-rose-600", hoverbgClass: "hover:bg-rose-500", icon: "🧾", accent: "from-rose-400 to-orange-500" },
    ...(canAccessPayroll ? [{ id: 'PAYROLL', title: "Payroll Entry", desc: "Record employee salaries and PF deductions", bgClass: "bg-teal-600", hoverbgClass: "hover:bg-teal-500", icon: "👥", accent: "from-teal-400 to-emerald-500" }] : [])
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100 p-6 md:p-8 space-y-10">

      {/* Header Section */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-slate-900/10 border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/20 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-indigo-200 text-sm font-bold uppercase tracking-widest mb-6">
            Receptionist Desk
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-300 mb-4 tracking-tight">
            Transaction Entry
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed">
            Record and track daily financial operations. Select an action below to begin a new entry.
          </p>
        </div>
      </header>

      {/* Primary Actions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {ACTIONS.map(action => (
          <QuickActionCard
            key={action.id}
            icon={action.icon}
            title={action.title}
            description={action.desc}
            bgClass={action.bgClass}
            hoverbgClass={action.hoverbgClass}
            accent={action.accent}
            onClick={() => setActiveModal(action.id)}
          />
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