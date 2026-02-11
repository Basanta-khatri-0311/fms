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
  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 space-y-4">
    <h2 className="text-sm font-black text-slate-600 uppercase">Filters</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Search */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2">Search by Name</label>
        <input
          type="text"
          placeholder="Enter name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2">Start Date</label>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => onDateChange({ ...dateRange, start: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* End Date */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2">End Date</label>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => onDateChange({ ...dateRange, end: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Items Per Page */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2">Items Per Page</label>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>

    {/* Clear Filters Button */}
    {hasActiveFilters && (
      <button
        onClick={onClearFilters}
        className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
      >
        Clear All Filters
      </button>
    )}
  </div>
);

export default TransactionFilters;

