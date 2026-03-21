import React, { useState, useEffect } from 'react';
import { X, User, Truck, ShieldCheck, Mail, Phone, MapPin, Hash, Receipt, History, ExternalLink, Download, ArrowUpRight, ArrowDownRight, LayoutDashboard, Calendar, CreditCard } from 'lucide-react';
import API from '../../api/axiosConfig';
import { showNotification } from '../../utils/toast';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const EntityHistoryModal = ({ type, entityId, onClose }) => {
  const { settings } = useSystemSettings();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetchHistory();
    return () => { document.body.style.overflow = 'unset'; };
  }, [type, entityId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile if student or employee
      if (type === 'student' || type === 'employee') {
          const userRes = await API.get(`/users/${entityId}`);
          setUser(userRes.data?.data || userRes.data);
      } else if (type === 'vendor') {
          const vendorRes = await API.get(`/vendors`);
          const vendor = vendorRes.data?.data?.find(v => v._id === entityId);
          setUser(vendor);
      }

      const res = await API.get(`/reports/history/${type}/${entityId}`);
      setData(res.data?.data);
    } catch (err) {
      console.error("Failed to load history", err);
      showNotification('error', 'Failed to retrieve transaction history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
        <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Loading Records...</p>
        </div>
      </div>
    );
  }

  const { history, summary } = data || { history: [], summary: { balance: 0, totalPaid: 0, totalInvoiced: 0 } };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-50 w-full max-w-5xl rounded-[2.5rem] shadow-2xl border border-white/20 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header Section */}
        <div className="relative shrink-0 bg-white px-10 pt-10 pb-8 border-b border-slate-100 shadow-sm">
          <button 
            onClick={onClose}
            className="absolute right-0 top-8 p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 ring-4 ring-slate-50 ${
                type === 'vendor' ? 'bg-rose-500' : type === 'student' ? 'bg-indigo-500' : 'bg-emerald-500'
              }`}>
                {type === 'vendor' ? <Truck size={36} /> : type === 'student' ? <User size={36} /> : <ShieldCheck size={36} />}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                    {user?.name || 'Unknown Entity'}
                  </h2>
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    type === 'vendor' ? 'bg-rose-50 text-rose-600' : type === 'student' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {type}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 mt-3">
                   {user?.email && (
                     <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                       <Mail size={14} className="text-slate-300" />
                       {user.email}
                     </div>
                   )}
                   {user?.contactNumber && (
                     <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                       <Phone size={14} className="text-slate-300" />
                       {user.contactNumber}
                     </div>
                   )}
                   {user?.pan && (
                     <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                       <Hash size={14} className="text-slate-300" />
                       PAN: {user.pan}
                     </div>
                   )}
                   {user?.address && (
                     <div className="flex items-center gap-2 text-slate-400 text-sm font-bold lg:col-span-2">
                       <MapPin size={14} className="text-slate-300" />
                       {user.address}
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Main Stats */}
            <div className="flex gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-w-[160px]">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding</p>
                 <p className={`text-xl font-black ${summary.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {settings.currencySymbol} {Math.abs(summary.balance).toLocaleString()}
                 </p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                    {summary.balance > 0 ? (type === 'vendor' ? 'We Owe Them' : 'Owes Us') : 'Settled Balance'}
                 </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-w-[160px]">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Volume</p>
                 <p className="text-xl font-black text-slate-900">
                    {settings.currencySymbol} {summary.totalInvoiced.toLocaleString()}
                 </p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Total Transactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
            <div className="flex items-center gap-3 mb-6">
                <History size={18} className="text-slate-400" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Transaction History</h3>
            </div>

            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                        <Receipt size={32} />
                    </div>
                    <p className="text-slate-500 font-bold">No transactions found for this identity.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Ref</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoiced</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {history.map((tx) => (
                                <tr key={tx._id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900 leading-none">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                               {tx.invoiceNumber || tx.billNumber || tx.paymentMonth || 'Ref #...'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700 leading-tight">
                                                {type === 'student' ? tx.serviceType : type === 'vendor' ? 'Standard Purchase' : 'Salary Disbursement'}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                                                    {tx.status} • {tx.paymentMode}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-slate-900">
                                            {settings.currencySymbol} {(tx.netAmount || tx.netPayable || tx.grossSalary || 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-black ${tx.amountReceived > 0 || tx.amountPaid > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {settings.currencySymbol} {(tx.amountReceived || tx.amountPaid || 0).toLocaleString()}
                                            </span>
                                            {tx.pendingAmount > 0 && (
                                                <span className="bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ring-1 ring-rose-100">
                                                    -{tx.pendingAmount}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {tx.attachmentUrl ? (
                                            <a 
                                               href={tx.attachmentUrl} 
                                               target="_blank" 
                                               rel="noreferrer"
                                               className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all inline-block"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        ) : (
                                            <div className="p-2 text-slate-200">
                                                <Receipt size={16} />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-10 py-6 border-t border-slate-100 flex justify-end">
            <button 
                onClick={onClose}
                className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
            >
                Close Profile
            </button>
        </div>
      </div>
    </div>
  );
};

export default EntityHistoryModal;
