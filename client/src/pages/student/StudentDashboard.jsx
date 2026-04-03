import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import { showNotification } from '../../utils/toast';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const StudentDashboard = () => {
  const [data, setData] = useState({
    totalDue: 0,
    totalAdvance: 0,
    email: '',
    createdAt: null,
    transactions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { settings, loading: settingsLoading } = useSystemSettings();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('/incomes/student/dashboard');
      setData(response.data.data);
    } catch (err) {
      showNotification('error', 'Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
              Hello, <span className="text-indigo-600">{user?.name}</span>
            </h1>
            <p className="text-slate-500 font-medium">Welcome to your student payment dashboard.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-indigo-700">Account Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Due Balance Card */}
          <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200/60 border border-white flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
            <div>
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Total Due</h3>
              <p className="text-4xl font-black text-slate-800 tabular-nums">{settings.currencySymbol} {data.totalDue.toLocaleString()}</p>
            </div>
            <p className="mt-6 text-xs font-bold text-slate-400 italic">This amount will be added to your next service fee.</p>
          </div>

          {/* Advance Balance Card */}
          <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200/60 border border-white flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
            <div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Total Advance</h3>
              <p className="text-4xl font-black text-slate-800 tabular-nums">{settings.currencySymbol} {data.totalAdvance.toLocaleString()}</p>
            </div>
            <p className="mt-6 text-xs font-bold text-slate-400 italic">This will be deducted from your next service payment.</p>
          </div>

          {/* Quick Info Card */}
          <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-lg shadow-indigo-200/60 border border-indigo-500 flex flex-col justify-between text-white lg:col-span-1 md:col-span-2">
            <div>
              <h3 className="text-sm font-black text-indigo-200 uppercase tracking-widest mb-4">Account Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-indigo-500/50">
                   <span className="text-indigo-100 text-sm">Registered Email</span>
                   <span className="font-bold text-sm tracking-tight">{data.email || '...'}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-indigo-500/50">
                   <span className="text-indigo-100 text-sm">Member Since</span>
                   <span className="font-bold text-sm tracking-tight">
                     {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '...'}
                   </span>
                </div>
              </div>
            </div>
            <div className="mt-6 px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-tighter text-center">
              Authorized Student Account
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
          <div className="px-8 py-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-indigo-600 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Payment History</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Invoice Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount Paid</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                           </svg>
                        </div>
                        <p className="text-slate-400 font-bold">No payment records found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-700">{new Date(tx.createdAt).toLocaleDateString()}</span>
                           <span className="text-[10px] font-bold text-slate-400 tracking-tighter">{tx.invoiceNumber || 'PENDING'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-tight">{tx.serviceType}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-sm font-bold text-slate-600">{settings.currencySymbol} {tx.netAmount.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-sm font-black text-emerald-600">{settings.currencySymbol} {tx.amountReceived.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            tx.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                            tx.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {tx.status === 'APPROVED' ? 'Approved' : 
                             tx.status === 'REJECTED' ? 'Rejected' : 
                             'Not Approved'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
