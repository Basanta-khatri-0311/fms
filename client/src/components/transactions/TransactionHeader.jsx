import React from 'react';

const TransactionHeader = ({ mode, total }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4">
    <h1 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">
      {mode.replace('_', ' ')} RECORDS
      <span className="ml-2 sm:ml-3 text-xs bg-slate-100 px-2 sm:px-3 py-1 rounded-full text-slate-500 font-bold">
        {total} Total
      </span>
    </h1>
  </div>
);

export default TransactionHeader;

