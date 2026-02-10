import React, { useState, useEffect, useMemo } from 'react';
import API from '../../api/axiosConfig';

const TransactionStatus = ({ onRefresh, mode = 'ALL' }) => {
  // State Management
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const user = JSON.parse(localStorage.getItem('user'));

  // Data Fetching with Error Handling
  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      const requests = [];
      const needIncome = ['ALL', 'PENDING', 'INCOME', 'ADVANCE', 'DUE'].includes(mode);
      const needExpense = ['ALL', 'PENDING', 'EXPENSE', 'ADVANCE', 'DUE'].includes(mode);

      if (needIncome) requests.push(API.get('/incomes'));
      if (needExpense) requests.push(API.get('/expenses'));

      const responses = await Promise.all(requests);
      let combined = [];

      if (needIncome) {
        const incData = Array.isArray(responses[0]?.data?.data)
          ? responses[0].data.data
          : (responses[0]?.data || []);
        combined = [...combined, ...incData.map(item => ({ ...item, type: 'INCOME' }))];
      }

      if (needExpense) {
        const expIndex = needIncome ? 1 : 0;
        const expData = Array.isArray(responses[expIndex]?.data)
          ? responses[expIndex].data
          : (responses[expIndex]?.data?.data || []);
        combined = [...combined, ...expData.map(item => ({ ...item, type: 'EXPENSE' }))];
      }

      setEntries(combined);
    } catch (err) {
      console.error("Error fetching entries:", err);
      setError(err.response?.data?.message || "Failed to load transactions. Please try again.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [mode]);

  // Optimized Filtering with useMemo
  const filteredData = useMemo(() => {
    return entries.filter(item => {
      // Status Filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

      // Type Filter
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

      // Search Filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const name = (item.type === 'INCOME' ? item.name : item.vendorName)?.toLowerCase() || '';
        if (!name.includes(search)) return false;
      }

      // Date Range Filter
      if (dateRange.start || dateRange.end) {
        const itemDate = new Date(item.createdAt);
        if (dateRange.start && itemDate < new Date(dateRange.start)) return false;
        if (dateRange.end && itemDate > new Date(dateRange.end)) return false;
      }

      const net = item.type === 'INCOME' ? (item.netAmount || 0) : (item.netPayable || 0);
      const paid = item.type === 'INCOME' ? (item.amountReceived || 0) : (item.amountPaid || 0);

      // Mode Filter
      if (mode === 'PENDING') return item.status === 'PENDING';
      if (mode === 'INCOME') return item.type === 'INCOME';
      if (mode === 'EXPENSE') return item.type === 'EXPENSE';
      if (mode === 'ADVANCE') return (paid - net) > 0.01;
      if (mode === 'DUE') return (net - paid) > 0.01;

      return true;
    });
  }, [entries, statusFilter, typeFilter, searchTerm, dateRange, mode]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchTerm, dateRange, mode]);

  // Action Handler
  const handleAction = async (id, action, type) => {
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this entry?`)) return;

    setActionLoading(id);
    try {
      const endpoint = type === 'INCOME' ? `/incomes/${id}/status` : `/expenses/${id}/status`;
      await API.patch(endpoint, { status: action });

      // Success notification
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 ${action === 'APPROVED' ? 'bg-emerald-500' : 'bg-orange-500'} text-white px-6 py-4 rounded-xl shadow-2xl z-50 font-bold`;
      notification.textContent = `Entry ${action.toLowerCase()} successfully!`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

      await fetchEntries();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  // Clear Filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setStatusFilter('ALL');
    setTypeFilter('ALL');
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 p-4">
        <div className="text-6xl">⚠️</div>
        <p className="text-rose-600 font-bold text-lg text-center">{error}</p>
        <button
          onClick={fetchEntries}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">
          {mode.replace('_', ' ')} RECORDS
          <span className="ml-2 sm:ml-3 text-xs bg-slate-100 px-2 sm:px-3 py-1 rounded-full text-slate-500 font-bold">
            {filteredData.length} Total
          </span>
        </h1>
      </div>

      {/* Search and Filters */}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Items Per Page */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Items Per Page</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
        {(searchTerm || dateRange.start || dateRange.end || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Status and Type Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Status Filter */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
          {['ALL', 'INCOME', 'EXPENSE'].map((type) => (
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
      </div>

      {/* Table - Desktop View */}
      <div className="hidden lg:block bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Transaction Details</th>
                <th className="px-4 py-5 text-right text-[10px] font-black uppercase text-slate-400">Gross</th>
                <th className="px-4 py-5 text-right text-[10px] font-black uppercase text-slate-400">VAT/Disc</th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase text-slate-900 bg-slate-100/30">Net Value</th>
                <th className="px-6 py-5 text-center text-[10px] font-black uppercase text-slate-400">Status</th>
                <th className="px-6 py-5 text-center text-[10px] font-black uppercase text-slate-400">
                  {(user?.role === 'APPROVER' || user?.role === 'SUPERADMIN') ? 'Action' : 'Status Detail'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => {
                  const isInc = item.type === 'INCOME';
                  const net = isInc ? (item.netAmount || 0) : (item.netPayable || 0);
                  const paid = isInc ? (item.amountReceived || 0) : (item.amountPaid || 0);
                  const balance = paid - net;

                  return (
                    <tr key={item._id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-8 rounded-full ${isInc ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{isInc ? item.name : item.vendorName}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-bold text-slate-600">
                        Rs. {item.amountBeforeVAT?.toLocaleString() || '0'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-[10px] font-bold text-blue-500">V: +{item.vatAmount || 0}</div>
                        <div className="text-[10px] font-bold text-rose-500">D: -{item.discount || 0}</div>
                      </td>
                      <td className="px-6 py-4 text-right bg-slate-50/30">
                        <p className={`text-sm font-black font-mono ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
                          Rs. {net.toLocaleString()}
                        </p>
                        {Math.abs(balance) > 0.01 && (
                          <div className="mt-1">
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                                balance < 0
                                  ? 'bg-red-50 border-red-100 text-red-600'
                                  : 'bg-purple-50 border-purple-100 text-purple-600'
                              }`}
                            >
                              {balance < 0 ? `DUE: ${Math.abs(balance).toLocaleString()}` : `ADV: ${balance.toLocaleString()}`}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                            item.status === 'PENDING'
                              ? 'bg-amber-50 border-amber-200 text-amber-600'
                              : item.status === 'APPROVED'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-red-50 border-red-200 text-red-600'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.status === 'PENDING' ? (
                          (user?.role === 'APPROVER' || user?.role === 'SUPERADMIN') ? (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleAction(item._id, 'APPROVED', item.type)}
                                disabled={actionLoading === item._id}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                              >
                                APPROVE
                              </button>
                              <button
                                onClick={() => handleAction(item._id, 'REJECTED', item.type)}
                                disabled={actionLoading === item._id}
                                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-black hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                              >
                                REJECT
                              </button>
                            </div>
                          ) : (
                            <span className="text-[9px] text-amber-500 font-black uppercase tracking-wider">
                              Awaiting Approval
                            </span>
                          )
                        ) : (
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-400 italic font-medium">
                    No records found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((item) => {
            const isInc = item.type === 'INCOME';
            const net = isInc ? (item.netAmount || 0) : (item.netPayable || 0);
            const paid = isInc ? (item.amountReceived || 0) : (item.amountPaid || 0);
            const balance = paid - net;

            return (
              <div key={item._id} className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-12 rounded-full ${isInc ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">{isInc ? item.name : item.vendorName}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-[9px] font-black uppercase border ${
                      item.status === 'PENDING'
                        ? 'bg-amber-50 border-amber-200 text-amber-600'
                        : item.status === 'APPROVED'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'bg-red-50 border-red-200 text-red-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Amount Details */}
                <div className="bg-slate-50 rounded-xl p-3 mb-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold">Gross</span>
                    <span className="text-slate-700 font-bold">Rs. {item.amountBeforeVAT?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-blue-500 font-bold">+ VAT: {item.vatAmount || 0}</span>
                    <span className="text-rose-500 font-bold">- Disc: {item.discount || 0}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="text-xs font-black text-slate-600">Net</span>
                    <span className={`text-base font-black ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Rs. {net.toLocaleString()}
                    </span>
                  </div>
                  {Math.abs(balance) > 0.01 && (
                    <div className="pt-1">
                      <span
                        className={`inline-block px-2 py-1 rounded-lg text-[9px] font-black border ${
                          balance < 0
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : 'bg-purple-50 border-purple-200 text-purple-600'
                        }`}
                      >
                        {balance < 0 ? `DUE: Rs. ${Math.abs(balance).toLocaleString()}` : `ADV: Rs. ${balance.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {item.status === 'PENDING' && (user?.role === 'APPROVER' || user?.role === 'SUPERADMIN') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(item._id, 'APPROVED', item.type)}
                      disabled={actionLoading === item._id}
                      className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      ✓ APPROVE
                    </button>
                    <button
                      onClick={() => handleAction(item._id, 'REJECTED', item.type)}
                      disabled={actionLoading === item._id}
                      className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      ✗ REJECT
                    </button>
                  </div>
                )}
                {item.status === 'PENDING' && user?.role === 'RECEPTIONIST' && (
                  <div className="text-center py-2 bg-amber-50 rounded-xl">
                    <span className="text-xs text-amber-600 font-black uppercase">Awaiting Approval</span>
                  </div>
                )}
                {item.status !== 'PENDING' && (
                  <div className="text-center py-2 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-400 font-black uppercase">✓ Processed</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-slate-400 font-bold">No records found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{' '}
              <span className="text-slate-900">{filteredData.length}</span> entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg text-xs font-black bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg text-xs font-black bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionStatus;