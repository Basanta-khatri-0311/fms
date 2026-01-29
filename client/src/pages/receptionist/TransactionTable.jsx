import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';

const TransactionStatus = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 
  const [entryType, setEntryType] = useState('INCOME'); 
  const [actionLoading, setActionLoading] = useState(null); // Track which item is being actioned
  
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const endpoint = entryType === 'INCOME' ? '/incomes' : '/expenses';
      const response = await API.get(endpoint);
      
      // Handle both response formats consistently
      const actualData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || response.data || []);
        
      setEntries(actualData);
    } catch (err) {
      console.error("Error fetching entries:", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [entryType]);

  const handleAction = async (id, action) => {
    const actionText = action === 'APPROVED' ? 'approve' : 'reject';
    if (!window.confirm(`✓ Confirm ${actionText} this ${entryType.toLowerCase()} entry?`)) return;
    
    setActionLoading(id);
    
    try {
      const endpoint = entryType === 'INCOME' ? `/incomes/${id}/status` : `/expenses/${id}/status`;
      
      const response = await API.patch(endpoint, { status: action });
      
      console.log('Action response:', response.data); // Debug log
      
      // Show success notification
      showNotification(
        action === 'APPROVED' ? 'success' : 'warning',
        `Entry ${action.toLowerCase()} successfully!`
      );
      
      // Wait a moment for backend to process, then refresh
      setTimeout(() => {
        fetchEntries();
        setActionLoading(null);
      }, 500);
      
    } catch (err) {
      console.error(`${actionText} error:`, err.response || err);
      
      // Show detailed error
      const errorMsg = err.response?.data?.message 
        || err.response?.data?.error 
        || `Failed to ${actionText} entry. Please try again.`;
      
      showNotification('error', errorMsg);
      setActionLoading(null);
    }
  };

  const showNotification = (type, message) => {
    const colors = {
      success: 'bg-emerald-500',
      warning: 'bg-orange-500',
      error: 'bg-red-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl z-50 font-bold animate-slideIn`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const filteredEntries = entries.filter(entry => {
    if (filter === 'ALL') return true;
    return entry.status === filter;
  });

  const stats = {
    total: entries.length,
    pending: entries.filter(e => e.status === 'PENDING').length,
    approved: entries.filter(e => e.status === 'APPROVED').length,
    rejected: entries.filter(e => e.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold">Loading {entryType.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 animate-fadeIn">
      {/* Header & Type Toggle */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-3">
            {entryType === 'INCOME' ? 'Income' : 'Expense'} Status
          </h1>
          
          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl mt-4 border border-slate-200 shadow-sm">
            <button 
                onClick={() => setEntryType('INCOME')}
                className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                  entryType === 'INCOME' 
                    ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Incomes
            </button>
            <button 
                onClick={() => setEntryType('EXPENSE')}
                className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                  entryType === 'EXPENSE' 
                    ? 'bg-white text-red-600 shadow-md ring-1 ring-black/5' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Expenses
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all
                ${filter === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {status}
              {status !== 'ALL' && stats[status.toLowerCase()] > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  status === 'PENDING' ? 'bg-amber-200 text-amber-800' : 
                  status === 'APPROVED' ? 'bg-emerald-200 text-emerald-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {stats[status.toLowerCase()]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-500">Party / Date</th>
                <th className="px-4 py-5 text-right text-xs font-black uppercase tracking-wider text-slate-500">Gross Amount</th>
                <th className="px-4 py-5 text-right text-xs font-black uppercase tracking-wider text-red-500">Discount</th>
                <th className="px-4 py-5 text-right text-xs font-black uppercase tracking-wider text-blue-500">VAT (Tax)</th>
                <th className="px-4 py-5 text-right text-xs font-black uppercase tracking-wider text-orange-500">TDS</th>
                <th className="px-6 py-5 text-right text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100/50">Final Net</th>
                <th className="px-6 py-5 text-center text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-5 text-center text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length > 0 ? filteredEntries.map((item) => {
                const displayName = entryType === 'INCOME' 
                  ? item.name 
                  : (item.vendor?.name || item.vendorName || 'Unknown Vendor');
                const finalAmount = entryType === 'INCOME' ? item.netAmount : item.netPayable;

                return (
                  <tr key={item._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{displayName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                             {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 text-right text-sm font-semibold text-slate-600">
                      Rs. {item.amountBeforeVAT?.toLocaleString() || '0'}
                    </td>

                    <td className="px-4 py-4 text-right text-sm font-bold text-red-500">
                      {item.discount > 0 ? `-Rs. ${item.discount.toLocaleString()}` : '—'}
                    </td>

                    <td className="px-4 py-4 text-right text-sm font-bold text-blue-600">
                      {item.vatAmount > 0 ? `+Rs. ${item.vatAmount.toLocaleString()}` : '—'}
                    </td>

                    <td className="px-4 py-4 text-right text-sm font-bold text-orange-500">
                      {item.tdsAmount > 0 ? `-Rs. ${item.tdsAmount.toLocaleString()}` : '—'}
                    </td>

                    <td className="px-6 py-4 text-right bg-slate-50/30">
                      <p className={`text-lg font-black font-mono ${
                        entryType === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {entryType === 'INCOME' ? '+' : '-'} Rs. {finalAmount?.toLocaleString() || '0'}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {item.paymentMode}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2
                        ${item.status === 'PENDING' 
                          ? 'bg-amber-50 border-amber-200 text-amber-600' 
                          : item.status === 'APPROVED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-red-50 border-red-200 text-red-600'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'PENDING' ? 'bg-amber-400 animate-pulse' : 
                          item.status === 'APPROVED' ? 'bg-emerald-400' : 'bg-red-400'
                        }`}></span>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {(user.role === 'APPROVER' || user.role === 'SUPERADMIN') && item.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleAction(item._id, 'APPROVED')}
                            disabled={actionLoading === item._id}
                            className="group relative px-4 py-2 bg-linear-to-r from-emerald-600 to-green-600 
                              text-white text-[10px] font-black rounded-xl 
                              hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5
                              transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === item._id ? (
                              <span className="flex items-center gap-1">
                                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                ...
                              </span>
                            ) : (
                              'APPROVE'
                            )}
                          </button>

                          <button 
                            onClick={() => handleAction(item._id, 'REJECTED')}
                            disabled={actionLoading === item._id}
                            className="group relative px-4 py-2 bg-linear-to-r from-red-600 to-rose-600 
                              text-white text-[10px] font-black rounded-xl 
                              hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5
                              transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === item._id ? '...' : 'REJECT'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                           <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
                             {item.status === 'APPROVED' ? 'Verified' : 
                              item.status === 'REJECTED' ? 'Rejected' : '🔒 Locked'}
                           </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-4xl">
                          {filter === 'PENDING' ? '⏳' : 
                           filter === 'APPROVED' ? '✓' : 
                           filter === 'REJECTED' ? '✕' : '📭'}
                        </span>
                      </div>
                      <p className="text-slate-600 font-bold">
                        No  {entryType.toLowerCase()} entries
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TransactionStatus;