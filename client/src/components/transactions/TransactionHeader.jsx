import React from 'react';

const TransactionHeader = ({ mode, total }) => (
  <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-8">
    <div className="flex items-center gap-4">
      <div className="w-1.5 h-10 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/20" />
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
          {mode === 'ALL' ? 'Total' : mode.replace('_', ' ')} Records
        </h1>
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
           Confirmed Entries
           <span className="w-1 h-1 rounded-full bg-slate-300" />
           <span className="text-indigo-600 font-black">{total} Total Items</span>
        </p>
      </div>
    </div>
  </div>
);

export default TransactionHeader;

