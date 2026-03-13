import React from 'react';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
const TYPE_OPTIONS = ['ALL', 'INCOME', 'EXPENSE', 'PAYROLL'];

const TransactionTabs = ({ mode, statusFilter, setStatusFilter, typeFilter, setTypeFilter }) => (
  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-2">
    {/* Status Filter */}
    <div className="flex bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/80 backdrop-blur-sm overflow-x-auto shadow-inner">
      {STATUS_OPTIONS.map((status) => (
        <button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.1em] uppercase transition-all whitespace-nowrap ${
            statusFilter === status 
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-100 scale-100' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95'
          }`}
        >
          {status}
        </button>
      ))}
    </div>

    {/* Type Filter */}
    {['ALL', 'PENDING', 'ADVANCE', 'DUE'].includes(mode) && (
      <div className="flex bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/80 backdrop-blur-sm overflow-x-auto shadow-inner">
        {TYPE_OPTIONS.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.1em] uppercase transition-all whitespace-nowrap ${
              typeFilter === type
                ? type === 'INCOME'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-emerald-400 scale-100'
                  : type === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 border-rose-400 scale-100'
                  : type === 'PAYROLL'
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20 border-teal-400 scale-100'
                  : 'bg-white text-slate-800 shadow-sm border border-slate-100 scale-100'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95'
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

