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
  <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-200/60 p-5 sm:p-8 space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-black text-slate-800 tracking-widest uppercase flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter Records
      </h2>
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear All
        </button>
      )}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Search */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Search by Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Start Date */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => onDateChange({ ...dateRange, start: e.target.value })}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      {/* End Date */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => onDateChange({ ...dateRange, end: e.target.value })}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      {/* Items Per Page */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Items Per Page</label>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
        >
          <option value={5}>5 Rows</option>
          <option value={10}>10 Rows</option>
          <option value={25}>25 Rows</option>
          <option value={50}>50 Rows</option>
          <option value={100}>100 Rows</option>
        </select>
      </div>
    </div>
  </div>
);

export default TransactionFilters;

