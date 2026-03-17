import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import CoaModal from './modals/AddCoaModal';
import Toast from '../../components/Toast'; 
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const COAManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [activeAccount, setActiveAccount] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const { data } = await API.get('/coa');
      setAccounts(data.data || data || []);
    } catch (err) { 
      console.error(err); 
    } finally {
      setIsLoading(false);
    }
  };

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await API.delete(`/coa/${confirmDeleteId}`);
      fetchAccounts();
      triggerToast("Account deleted successfully", "success");
    } catch (err) {
      triggerToast(err.response?.data?.message || "Delete failed", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const accountTypes = ['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
  
  // FILTER LOGIC
  const filteredAccounts = filterType === 'ALL' 
    ? accounts 
    : accounts.filter(a => a.type === filterType);

  return (
    <div className="max-w-7xl mx-auto p-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 italic underline decoration-indigo-200 underline-offset-8">Chart of Accounts</h2>
        <button 
            onClick={() => { setActiveAccount(null); setShowModal(true); }} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2"
        >
          <span>Add Account</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {accountTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterType === type 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 min-h-[300px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">Loading Ledger Accounts...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Account Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Code</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAccounts.map((account) => (
              <tr key={account._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{account.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500 font-mono">{account.code}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                    account.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {account.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => { setActiveAccount(account); setShowModal(true); }} className="text-slate-400 hover:text-indigo-600 text-sm font-medium">Edit</button>
                  <button onClick={() => setConfirmDeleteId(account._id)} className="text-slate-400 hover:text-red-600 text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {showModal && (
        <CoaModal
          editData={activeAccount}
          onClose={() => setShowModal(false)}
          refreshData={fetchAccounts}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Delete Account"
        message="Are you sure you want to delete this chart of account? This action cannot be undone."
        confirmText="Delete"
        confirmColor="rose"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
    </div>
  );
};

export default COAManagement;