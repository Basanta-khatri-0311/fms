import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';

const TransactionStatus = ({ onRefresh, mode = 'ALL' }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); 
  
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchEntries = async () => {
    try {
      setLoading(true);
      
      // Optimization: Only fetch what the specific mode requires
      const requests = [];
      const needIncome = ['ALL', 'PENDING', 'INCOME', 'ADVANCE', 'DUE'].includes(mode);
      const needExpense = ['ALL', 'PENDING', 'EXPENSE', 'ADVANCE', 'DUE'].includes(mode);

      if (needIncome) requests.push(API.get('/incomes'));
      if (needExpense) requests.push(API.get('/expenses'));

      const responses = await Promise.all(requests);
      
      let combined = [];
      
      // Process Income Response
      if (needIncome) {
        const incData = Array.isArray(responses[0]?.data?.data) 
          ? responses[0].data.data 
          : (responses[0]?.data || []);
        combined = [...combined, ...incData.map(item => ({ ...item, type: 'INCOME' }))];
      }

      // Process Expense Response (handle index shift if income wasn't fetched)
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
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [mode]);

  const getFilteredData = () => {
    return entries.filter(item => {
      const net = item.type === 'INCOME' ? (item.netAmount || 0) : (item.netPayable || 0);
      const paid = item.type === 'INCOME' ? (item.amountReceived || 0) : (item.amountPaid || 0);
      
      if (mode === 'PENDING') return item.status === 'PENDING';
      if (mode === 'INCOME') return item.type === 'INCOME';
      if (mode === 'EXPENSE') return item.type === 'EXPENSE';
      if (mode === 'ADVANCE') return (paid - net) > 0.01; // Avoid floating point dust
      if (mode === 'DUE') return (net - paid) > 0.01;
      return true;
    });
  };

  const handleAction = async (id, action, type) => {
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this entry?`)) return;
    
    setActionLoading(id);
    try {
      const endpoint = type === 'INCOME' ? `/incomes/${id}/status` : `/expenses/${id}/status`;
      await API.patch(endpoint, { status: action });
      
      // Notification helper
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 ${action === 'APPROVED' ? 'bg-emerald-500' : 'bg-orange-500'} text-white px-6 py-4 rounded-xl shadow-2xl z-50 font-bold animate-slideIn`;
      notification.textContent = `Entry ${action.toLowerCase()} successfully!`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

      await fetchEntries();
      if (onRefresh) onRefresh(); 
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const displayEntries = getFilteredData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
          {mode.replace('_', ' ')} RECORDS
          <span className="ml-3 text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-bold">
            {displayEntries.length} Total
          </span>
        </h1>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Transaction Details</th>
                <th className="px-4 py-5 text-right text-[10px] font-black uppercase text-slate-400">Gross</th>
                <th className="px-4 py-5 text-right text-[10px] font-black uppercase text-slate-400">VAT/Disc</th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase text-slate-900 bg-slate-100/30">Net Value</th>
                <th className="px-6 py-5 text-center text-[10px] font-black uppercase text-slate-400">Status</th>
                <th className="px-6 py-5 text-center text-[10px] font-black uppercase text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayEntries.length > 0 ? displayEntries.map((item) => {
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
                             {item.type} • {new Date(item.createdAt).toLocaleDateString()}
                           </p>
                         </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-bold text-slate-600">
                      Rs. {item.amountBeforeVAT?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-[10px] font-bold text-blue-500">V: +{item.vatAmount}</div>
                      <div className="text-[10px] font-bold text-rose-500">D: -{item.discount}</div>
                    </td>
                    <td className="px-6 py-4 text-right bg-slate-50/30">
                      <p className={`text-sm font-black font-mono ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
                        Rs. {net.toLocaleString()}
                      </p>
                      {Math.abs(balance) > 0.01 && (
                        <div className="mt-1">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${balance < 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>
                            {balance < 0 ? `DUE: ${Math.abs(balance).toLocaleString()}` : `ADV: ${balance.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                        item.status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                        item.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                        'bg-red-50 border-red-200 text-red-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.status === 'PENDING' ? (
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
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Archived</span>
                      )}
                    </td>
                  </tr>
                );
              }) : (
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
    </div>
  );
};

export default TransactionStatus;