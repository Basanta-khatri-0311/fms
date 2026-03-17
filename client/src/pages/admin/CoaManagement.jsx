import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers, BookOpen, Edit3, Trash2, Filter, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import API from '../../api/axiosConfig';
import CoaModal from './modals/AddCoaModal';
import { showNotification } from '../../utils/toast';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const COAManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [activeAccount, setActiveAccount] = useState(null); 
  const [showModal, setShowModal] = useState(false);
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
      showNotification('error', 'Failed to fetch account directory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await API.delete(`/coa/${confirmDeleteId}`);
      fetchAccounts();
      showNotification('success', 'Master account removed successfully');
    } catch (err) {
      showNotification('error', err.response?.data?.message || "Eviction failed");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const accountTypes = ['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
  
  // FILTER LOGIC
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         account.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || account.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-indigo-600">
              <BookOpen size={24} strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Financial Core</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Chart of Accounts</h1>
            <p className="text-slate-500 font-medium max-w-lg">
              Manage your master ledger structure and financial classifications for precise reporting.
            </p>
          </div>
          
          <button 
            onClick={() => { setActiveAccount(null); setShowModal(true); }} 
            className="group flex items-center justify-center gap-2.5 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
            Create Account
          </button>
        </div>

        {/* Tactical Toolbar */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by account name or system code..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl w-full lg:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
            {accountTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterType === type 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Account Directory */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-24">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                <BookOpen className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-200" size={24} />
              </div>
              <p className="mt-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Hydrating Ledger Matrix...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                {searchQuery ? <ShieldAlert className="text-slate-300" size={32} /> : <CheckCircle2 className="text-slate-300" size={32} />}
              </div>
              <h3 className="text-lg font-black text-slate-800">No account records found</h3>
              <p className="text-slate-500 text-sm font-medium mt-1 max-w-xs mx-auto">
                {searchQuery 
                  ? "We couldn't find any accounts matching your current search or filter criteria." 
                  : "The chart of accounts is currently empty. Initialize your ledger by creating your first account."}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setFilterType('ALL'); }}
                  className="mt-6 text-sm font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 underline underline-offset-4"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Account</th>
                    <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">System Identifier</th>
                    <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Classification</th>
                    <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Administrative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAccounts.map((account) => (
                    <tr key={account._id} className="group hover:bg-slate-50/30 transition-all duration-200">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                            account.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' :
                            account.type === 'EXPENSE' ? 'bg-rose-50 text-rose-600' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {account.name[0]}
                          </div>
                          <span className="text-sm font-bold text-slate-800">{account.name}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="px-3 py-1.5 bg-slate-50 text-slate-500 text-xs font-mono font-bold rounded-lg border border-slate-100 uppercase tracking-tighter">
                          {account.code}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          account.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          account.type === 'EXPENSE' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          account.type === 'ASSET' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          account.type === 'LIABILITY' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                          'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          <Layers size={10} />
                          {account.type}
                        </span>
                      </td>
                      <td className="px-10 py-6 relative">
                        <div className="flex items-center justify-end gap-2 transition-all duration-300">
                          <button 
                            onClick={() => { setActiveAccount(account); setShowModal(true); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Edit Account"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteId(account._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete Account"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
        title="Delete Account Record"
        message="Are you sure you want to remove this ledger classification? This action will impact your financial hierarchies and cannot be reversed."
        confirmText="Remove Record"
        confirmColor="rose"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default COAManagement;