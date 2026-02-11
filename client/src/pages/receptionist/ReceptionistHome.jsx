import React, { useState } from 'react';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import IncomeModal from './modals/IncomeEntryModal';
import ExpenseModal from './modals/ExpenseEntryModal';
// import AdvanceModal from './modals/AdvanceModal';

const ReceptionistDashboard = () => {
  const [activeModal, setActiveModal] = useState(null);

  const ACTIONS = [
    { id: 'INCOME', title: "Income Entry", desc: "Record received payments", color: "indigo-600" },
    { id: 'EXPENSE', title: "Expense Entry", desc: "Record bills and payments", color: "rose-600" },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Section */}
      <header className="bg-slate-800 rounded-3xl p-10 shadow-2xl border border-slate-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96  rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="relative">
          <h1 className="text-5xl font-black text-white mb-2">Transaction Entry</h1>
          <p className="text-blue-200 text-lg font-medium">Record and track your daily financial operations</p>
        </div>
      </header>

      {/* Primary Actions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ACTIONS.map(action => (
          <QuickActionCard
            key={action.id}
            icon={action.icon}
            title={action.title}
            description={action.desc}
            color={action.color}
            onClick={() => setActiveModal(action.id)}
          />
        ))}
      </section>

      {/* Modal Controller */}
      {activeModal === 'INCOME' && <IncomeModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'EXPENSE' && <ExpenseModal onClose={() => setActiveModal(null)} />}
      {/* {activeModal === 'ADVANCE' && <AdvanceModal onClose={() => setActiveModal(null)} />} */}

    </div>
  );
};

export default ReceptionistDashboard;