import React from 'react';
import TransactionStatus from '../../components/transactions/TransactionStatus';

const AuditorView = () => {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100 p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

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
