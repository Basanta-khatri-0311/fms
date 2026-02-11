import React from 'react';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
const TYPE_OPTIONS = ['ALL', 'INCOME', 'EXPENSE'];

const TransactionTabs = ({ mode, statusFilter, setStatusFilter, typeFilter, setTypeFilter }) => (
  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
    {/* Status Filter */}
    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
      {STATUS_OPTIONS.map((status) => (
        <button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${
            statusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {status}
        </button>
      ))}
    </div>

    {/* Type Filter */}
    {['ALL', 'PENDING', 'ADVANCE', 'DUE'].includes(mode) && (
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
        {TYPE_OPTIONS.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${
              typeFilter === type
                ? type === 'INCOME'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : type === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
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

