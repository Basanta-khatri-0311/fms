import React from 'react';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
const TYPE_OPTIONS = ['ALL', 'INCOME', 'EXPENSE', 'PAYROLL'];

const TransactionTabs = ({ mode, statusFilter, setStatusFilter, typeFilter, setTypeFilter }) => (
  <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between py-6">
    {/* Status Synthesis Filter */}
    <div className="flex bg-slate-900/5 p-1.5 rounded-[1.5rem] border border-slate-100 backdrop-blur-sm overflow-x-auto shadow-inner">
      {STATUS_OPTIONS.map((status) => (
        <button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={`px-6 sm:px-8 py-3 rounded-2xl text-[10px] font-black tracking-[0.15em] uppercase transition-all duration-300 whitespace-nowrap ${
            statusFilter === status 
              ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-100' 
              : 'text-slate-400 hover:text-slate-900 hover:bg-white/50 scale-95'
          }`}
        >
          {status}
        </button>
      ))}
    </div>

    {/* Entity Category Filter */}
    {['ALL', 'PENDING', 'ADVANCE', 'DUE'].includes(mode) && (
      <div className="flex bg-slate-900/5 p-1.5 rounded-[1.5rem] border border-slate-100 backdrop-blur-sm overflow-x-auto shadow-inner">
        {TYPE_OPTIONS.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 sm:px-8 py-3 rounded-2xl text-[10px] font-black tracking-[0.15em] uppercase transition-all duration-300 whitespace-nowrap ${
              typeFilter === type
                ? type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 scale-100'
                  : type === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-xl shadow-rose-500/20 scale-100'
                  : type === 'PAYROLL'
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-100'
                  : 'bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-100'
                : 'text-slate-400 hover:text-slate-900 hover:bg-white/50 scale-95'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default TransactionTabs;

