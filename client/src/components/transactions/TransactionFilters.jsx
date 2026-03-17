import React from 'react';

const TransactionFilters = ({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateChange,
  itemsPerPage,
  onItemsPerPageChange,
  hasActiveFilters,
  onClearFilters,
}) => (
  <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-100/50 border border-slate-100 p-8 sm:p-10 space-y-10">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        </div>
        <h2 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase">
          Analytical Filters
        </h2>
      </div>
      
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="text-[10px] font-black text-rose-500 hover:text-white hover:bg-rose-500 px-5 py-2 rounded-xl transition-all duration-300 border border-rose-100 uppercase tracking-widest active:scale-95"
        >
          Reset
        </button>
      )}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Search Identity */}
      <div className="space-y-3">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entity Identity</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-focus-within:text-indigo-600 transition-colors"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Temporal Bounds - Start */}
      <div className="space-y-3">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Origin</label>
        <div className="relative">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateChange({ ...dateRange, start: e.target.value })}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all appearance-none"
          />
        </div>
      </div>

      {/* Temporal Bounds - End */}
      <div className="space-y-3">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Horizon</label>
        <div className="relative">
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateChange({ ...dateRange, end: e.target.value })}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all appearance-none"
          />
        </div>
      </div>

      {/* Data Density */}
      <div className="space-y-3">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Density</label>
        <div className="relative group">
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value={5}>05 Records / Screen</option>
            <option value={10}>10 Records / Screen</option>
            <option value={25}>25 Records / Screen</option>
            <option value={50}>50 Records / Screen</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TransactionFilters;

