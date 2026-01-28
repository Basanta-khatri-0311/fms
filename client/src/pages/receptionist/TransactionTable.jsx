import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';

const TransactionStatus = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 
  const [entryType, setEntryType] = useState('INCOME'); 
  
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const endpoint = entryType === 'INCOME' ? '/incomes' : '/expenses';
      const response = await API.get(endpoint);
      
      const actualData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || []);
        
      setEntries(actualData);
    } catch (err) {
      console.error("Error fetching status:", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [entryType]);

  const handleApprove = async (id) => {
    if (!window.confirm(`Confirm approval for this ${entryType.toLowerCase()}?`)) return;
    try {
      const endpoint = entryType === 'INCOME' ? `/incomes/${id}/status` : `/expenses/${id}/status`;
      await API.patch(endpoint, { status: 'APPROVED' });
      
      // Optional: Trigger a success toast here
      fetchEntries(); 
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed.");
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (filter === 'ALL') return true;
    return entry.status === filter;
  });

  const stats = {
    total: entries.length,
    pending: entries.filter(e => e.status === 'PENDING').length,
    approved: entries.filter(e => e.status === 'APPROVED').length,
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
            <span className="text-5xl">{entryType === 'INCOME' ? '💰' : '💸'}</span>
            {entryType === 'INCOME' ? 'Income' : 'Expense'} Status
          </h1>
          
          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl mt-4 border border-slate-200 shadow-sm">
            <button 
                onClick={() => setEntryType('INCOME')}
                className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 ${entryType === 'INCOME' ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800'}`}
            >Incomes</button>
            <button 
                onClick={() => setEntryType('EXPENSE')}
                className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 ${entryType === 'EXPENSE' ? 'bg-white text-red-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800'}`}
            >Expenses</button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {['ALL', 'PENDING', 'APPROVED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all
                ${filter === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {status}
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
                <th className="px-4 py-5 text-right text-xs font-black uppercase tracking-wider text-slate-500 text-red-500  decoration-red-200">Discount</th>
                <th className="px-4 py-5 text-right text-xs font-black uppercase tracking-wider text-slate-500 text-blue-500  decoration-blue-200">VAT (Tax)</th>
                <th className="px-4 py-5 text-right text-xs font-black uppercase tracking-wider text-slate-500 text-orange-500  decoration-orange-200">TDS</th>
                <th className="px-6 py-5 text-right text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100/50">Final Net</th>
                <th className="px-6 py-5 text-center text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-5 text-center text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length > 0 ? filteredEntries.map((item) => {
                const displayName = entryType === 'INCOME' ? item.name : (item.vendor?.name || 'Unknown Vendor');
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
                      Rs. {item.amountBeforeVAT?.toLocaleString()}
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
                      <p className={`text-lg font-black font-mono ${entryType === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {entryType === 'INCOME' ? '+' : '-'} Rs. {finalAmount?.toLocaleString()}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.paymentMode}</span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2
                        ${item.status === 'PENDING' 
                          ? 'bg-amber-50 border-amber-200 text-amber-600' 
                          : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'PENDING' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {(user.role === 'APPROVER' || user.role === 'SUPERADMIN') && item.status === 'PENDING' ? (
                        <button 
                          onClick={() => handleApprove(item._id)}
                          className="px-5 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-slate-700 hover:shadow-lg transition-all active:scale-95"
                        >
                          APPROVE
                        </button>
                      ) : (
                        <div className="flex flex-col items-center">
                           <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
                             {item.status === 'APPROVED' ? '✅ Verified' : '🔒 Locked'}
                           </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center text-slate-400 italic">
                    No records found for {entryType.toLowerCase()} with status: {filter}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Visual Key / Legend */}
      {/* <div className="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest justify-center">
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Gross + VAT</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Less Discount</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> Less TDS</div>
      </div> */}
    </div>
  );
};

export default TransactionStatus;