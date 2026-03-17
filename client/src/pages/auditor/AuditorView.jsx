import React from 'react';
import TransactionStatus from '../../components/transactions/TransactionStatus';

const AuditorView = () => {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100 p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Context Notice */}
            <div className="bg-linear-to-r from-blue-900 to-indigo-900 border border-blue-800 p-6 sm:p-8 rounded-4xl flex flex-col sm:flex-row gap-6 items-start shadow-xl shadow-blue-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
                
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 shrink-0 shadow-inner">
                    <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Auditor Access</h3>
                    <p className="text-sm font-medium text-blue-100/80 leading-relaxed max-w-3xl">
                        You have read-only access to view all reports, income, and expenses across the system. You cannot add or change any records.
                    </p>
                </div>
            </div>

            {/* Read-only transaction list */}
            <div className="bg-white rounded-4xl shadow-xl shadow-slate-200/40 border border-slate-200/60 p-6 sm:p-8 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                    <div className="p-4 bg-linear-to-br from-indigo-100 to-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100/50 shadow-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Transaction Logs</h2>
                        <p className="text-slate-500 font-medium mt-1">View all transaction records</p>
                    </div>
                </div>

                {/* Filterable Table Wrapper */}
                <div className="auditor-table-wrapper rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-slate-50/50">
                    <TransactionStatus mode="ALL" />
                </div>
            </div>
        </div>
    );
};

export default AuditorView;
