// import React, { useState, useEffect } from 'react';
// import IncomeModal from './modals/IncomeModal';
// import API from '../../api/axiosConfig';

// const TransactionDashboard = () => {
//   const [showTransactionMenu, setShowTransactionMenu] = useState(false);
//   const [activeModal, setActiveModal] = useState(null);
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchTransactions = async () => {
//     try {
//       setLoading(true);
//       const response = await API.get('/incomes?status=APPROVED&limit=20');
//       const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
//       setTransactions(data);
//     } catch (err) {
//       console.error("Error fetching transactions:", err);
//       setTransactions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTransactions();
//   }, []);

//   const handleRefresh = () => {
//     setActiveModal(null);
//     fetchTransactions();
//   };

//   const totalAmount = transactions.reduce((sum, txn) => sum + Number(txn.netAmount || 0), 0);

//   return (
//     <div className="space-y-8 animate-fadeIn">
//       {/* Header Section */}
//       <div className="bg-linear-to-br from-slate-900 via-blue-900 to-violet-900 rounded-3xl p-8 shadow-2xl 
//         border border-slate-700/50 overflow-hidden relative">
        
//         {/* Background decoration */}
//         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
//         <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl -ml-48 -mb-48" />
        
//         <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//           <div>
//             <h1 className="text-5xl font-black text-white mb-3 flex items-center gap-3">
//               <span className="text-6xl">💼</span>
//               Accounts Overview
//             </h1>
//             <p className="text-blue-200 font-medium text-lg">
//               All financial transactions and ledger entries
//             </p>
//             <div className="mt-4 flex items-baseline gap-2">
//               <span className="text-white/60 text-sm font-bold uppercase tracking-wider">Total Value:</span>
//               <span className="text-4xl font-black text-white font-mono">
//                 Rs. {totalAmount.toLocaleString()}
//               </span>
//             </div>
//           </div>
          
//           {/* Action Button with Dropdown */}
//           <div className="relative">
//             <button 
//               onClick={() => setShowTransactionMenu(!showTransactionMenu)}
//               className="group relative px-8 py-4 bg-white text-slate-900 font-black rounded-2xl 
//                 shadow-lg hover:shadow-2xl hover:-translate-y-1
//                 transition-all duration-300 active:scale-95 overflow-hidden"
//             >
//               <span className="relative z-10 flex items-center gap-3">
//                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                 </svg>
//                 Add Transaction
//                 <svg 
//                   className={`w-5 h-5 transition-transform duration-300 ${showTransactionMenu ? 'rotate-180' : ''}`} 
//                   fill="none" 
//                   viewBox="0 0 24 24" 
//                   stroke="currentColor"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </span>
//               <div className="absolute inset-0 bg-linear-to-r from-blue-50 to-violet-50 
//                 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
//             </button>

//             {/* Dropdown Menu */}
//             {showTransactionMenu && (
//               <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 
//                 overflow-hidden z-50 animate-slideDown">
                
//                 <div className="p-3 bg-linear-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
//                   <p className="text-xs font-black uppercase tracking-wider text-slate-600">
//                     Transaction Type
//                   </p>
//                 </div>

//                 <div className="p-2">
//                   <button 
//                     onClick={() => {
//                       setActiveModal('INCOME');
//                       setShowTransactionMenu(false);
//                     }} 
//                     className="w-full flex items-center gap-4 px-4 py-3 rounded-xl
//                       hover:bg-linear-to-r hover:from-blue-50 hover:to-violet-50 
//                       transition-all duration-200 group text-left"
//                   >
//                     <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 
//                       flex items-center justify-center text-white text-2xl
//                       group-hover:scale-110 transition-transform shadow-lg">
//                       💰
//                     </div>
//                     <div className="flex-1">
//                       <p className="font-bold text-slate-800 text-sm">Income / Inflow</p>
//                       <p className="text-xs text-slate-500">Add new income entry</p>
//                     </div>
//                     <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" 
//                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </button>

//                   <button 
//                     className="w-full flex items-center gap-4 px-4 py-3 rounded-xl
//                       opacity-50 cursor-not-allowed text-left"
//                     disabled
//                   >
//                     <div className="w-12 h-12 rounded-xl bg-linear-to-br from-red-500 to-pink-600 
//                       flex items-center justify-center text-white text-2xl shadow-lg">
//                       💸
//                     </div>
//                     <div className="flex-1">
//                       <p className="font-bold text-slate-800 text-sm">Expense / Outflow</p>
//                       <p className="text-xs text-slate-500">Coming soon</p>
//                     </div>
//                   </button>

//                   <button 
//                     className="w-full flex items-center gap-4 px-4 py-3 rounded-xl
//                       opacity-50 cursor-not-allowed text-left"
//                     disabled
//                   >
//                     <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 
//                       flex items-center justify-center text-white text-2xl shadow-lg">
//                       🏦
//                     </div>
//                     <div className="flex-1">
//                       <p className="font-bold text-slate-800 text-sm">Bank Transaction</p>
//                       <p className="text-xs text-slate-500">Coming soon</p>
//                     </div>
//                   </button>

//                   <div className="my-2 border-t border-slate-200" />

//                   <button 
//                     className="w-full flex items-center gap-4 px-4 py-3 rounded-xl
//                       opacity-50 cursor-not-allowed text-left"
//                     disabled
//                   >
//                     <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-violet-600 
//                       flex items-center justify-center text-white text-2xl shadow-lg">
//                       👥
//                     </div>
//                     <div className="flex-1">
//                       <p className="font-bold text-slate-800 text-sm">Employee Payroll</p>
//                       <p className="text-xs text-slate-500">Coming soon</p>
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Transaction Table */}
//       <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
//         <div className="bg-linear-to-r from-slate-50 to-blue-50/30 px-6 py-4 border-b border-slate-200">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
//               <span className="text-2xl">📊</span>
//               Recent Transactions
//             </h3>
//             <button 
//               onClick={fetchTransactions}
//               className="p-2 hover:bg-white rounded-lg transition-all duration-200 group"
//               title="Refresh"
//             >
//               <svg className="w-5 h-5 text-slate-600 group-hover:rotate-180 transition-transform duration-500" 
//                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                   d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-slate-50/50 border-b border-slate-200">
//                 <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-600">
//                   Date
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-600">
//                   Description
//                 </th>
//                 <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-600">
//                   Type
//                 </th>
//                 <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-600">
//                   Amount
//                 </th>
//                 <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-600">
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {loading ? (
//                 <tr>
//                   <td colSpan="5" className="px-6 py-16 text-center">
//                     <div className="flex flex-col items-center gap-4">
//                       <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
//                       <p className="text-slate-500 font-medium">Loading transactions...</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : transactions.length > 0 ? (
//                 transactions.map((txn, index) => (
//                   <tr 
//                     key={txn._id} 
//                     className="hover:bg-blue-50/30 transition-colors group"
//                     style={{
//                       animation: `slideIn 0.3s ease-out ${index * 50}ms forwards`,
//                       opacity: 0
//                     }}
//                   >
//                     <td className="px-6 py-4">
//                       <div className="flex flex-col">
//                         <p className="text-sm font-bold text-slate-800">
//                           {new Date(txn.createdAt).toLocaleDateString('en-US', {
//                             month: 'short',
//                             day: 'numeric',
//                             year: 'numeric'
//                           })}
//                         </p>
//                         <p className="text-xs text-slate-500 font-medium mt-0.5">
//                           {new Date(txn.createdAt).toLocaleTimeString('en-US', {
//                             hour: '2-digit',
//                             minute: '2-digit'
//                           })}
//                         </p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-violet-600 
//                           flex items-center justify-center text-white font-black text-sm
//                           group-hover:scale-110 transition-transform">
//                           {txn.name[0]}
//                         </div>
//                         <p className="font-bold text-slate-800">{txn.name}</p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
//                         bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider
//                         border-2 border-emerald-300">
//                         💰 Income
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <p className="text-lg font-black text-slate-900 font-mono">
//                         Rs. {Number(txn.netAmount || 0).toLocaleString()}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
//                         bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider
//                         border-2 border-emerald-300">
//                         ✓ {txn.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5" className="px-6 py-16 text-center">
//                     <div className="flex flex-col items-center gap-4">
//                       <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
//                         <span className="text-4xl">📭</span>
//                       </div>
//                       <div>
//                         <p className="text-slate-800 font-bold text-lg mb-1">No transactions yet</p>
//                         <p className="text-slate-500">Add your first transaction to get started</p>
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal */}
//       {activeModal === 'INCOME' && (
//         <IncomeModal 
//           onClose={() => setActiveModal(null)} 
//           refreshData={handleRefresh}
//         />
//       )}

//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         @keyframes slideIn {
//           from { opacity: 0; transform: translateX(-10px); }
//           to { opacity: 1; transform: translateX(0); }
//         }

//         @keyframes slideDown {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.5s ease-out;
//         }

//         .animate-slideDown {
//           animation: slideDown 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default TransactionDashboard;