import React from 'react';
import API from '../../api/axiosConfig';
import { useSystemSettings } from '../../context/SystemSettingsContext';


const buildAttachmentUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const origin = getApiOrigin();
  const normalizedPath = path.replace(/^\/+/, '');
  return `${origin}/${normalizedPath}`;
};

const TransactionTableDesktop = ({ rows, user, onAction, onEdit, actionLoading, onInvoice, onViewHistory }) => {
  const { settings } = useSystemSettings();
  return (
    <div className="hidden md:block bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden relative">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200/80">
            <th className="px-4 lg:px-6 py-5 text-[9px] lg:text-[10px] font-black uppercase text-slate-400">Transaction Details</th>
            <th className="px-2 lg:px-4 py-5 text-left text-[9px] lg:text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">Invoice No.</th>
            <th className="px-2 lg:px-4 py-5 text-right text-[9px] lg:text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">Base Amount</th>
            <th className="px-2 lg:px-4 py-5 text-right text-[9px] lg:text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">Tax/Disc</th>
            <th className="px-4 lg:px-6 py-5 text-right text-[9px] lg:text-[10px] font-black uppercase text-slate-900 bg-slate-100/30 whitespace-nowrap">
              Paid Amount
            </th>
            <th className="px-4 lg:px-6 py-5 text-center text-[9px] lg:text-[10px] font-black uppercase text-slate-400">Status</th>
            <th className="px-4 lg:px-6 py-5 text-center text-[9px] lg:text-[10px] font-black uppercase text-slate-400">
              {user?.role === 'APPROVER' || user?.role === 'SUPERADMIN' ? 'Action' : 'Status Detail'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length > 0 ? (
            rows.map((item) => {
              const isInc = item.type === 'INCOME';
              const isPay = item.type === 'PAYROLL';
              const net = isInc ? item.netAmount || 0 : item.netPayable || 0;
              const pendingAmount = item.pendingAmount || 0;
              const advanceAmount = item.advanceAmount || 0;
              const attachmentUrl = buildAttachmentUrl(item.attachmentUrl);
              const barColor = isInc ? 'bg-emerald-500' : isPay ? 'bg-teal-500' : 'bg-rose-500';

              return (
                <tr key={item._id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center gap-2 lg:gap-4">
                      <div className={`w-1 h-8 lg:w-1.5 lg:h-10 rounded-full ${barColor} shadow-sm shrink-0`} />
                      <div className="min-w-0">
                        {onViewHistory && (item.studentId || item.vendor?._id || item.employeeId) ? (
                          <button 
                            onClick={() => {
                              const type = item.studentId ? 'student' : item.vendor?._id ? 'vendor' : 'employee';
                              const id = item.studentId || item.vendor?._id || item.employeeId;
                              onViewHistory(type, id);
                            }}
                            className="font-bold text-slate-800 text-[11px] lg:text-sm hover:text-indigo-600 hover:underline transition-all text-left truncate block w-full"
                          >
                            {item.displayName}
                          </button>
                        ) : (
                          <p className="font-bold text-slate-800 text-[11px] lg:text-sm truncate">
                            {item.displayName}
                          </p>
                        )}
                        <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        {attachmentUrl && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); window.open(attachmentUrl, '_blank', 'noopener'); }}
                            className="mt-1 inline-flex items-center text-indigo-500 hover:text-indigo-700 transition-colors"
                            title="View Attachment"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 lg:px-4 py-4 text-left">
                    <span className="text-[10px] lg:text-[11px] font-bold text-indigo-600 tracking-wider whitespace-nowrap">
                       {item.invoiceNumber || item.billNumber || '-'}
                    </span>
                  </td>
                  <td className="px-2 lg:px-4 py-4 text-right text-[11px] lg:text-sm font-bold text-slate-600 whitespace-nowrap">
                    {settings.currencySymbol} {(item.amountBeforeVAT || item.grossSalary)?.toLocaleString() || '0'}
                  </td>
                  <td className="px-2 lg:px-4 py-4 text-right">
                    {isPay ? (
                      <>
                        <div className="text-[8px] lg:text-[10px] font-bold text-rose-500 whitespace-nowrap">
                          T: -{item.taxDeduction || 0}
                        </div>
                        <div className="text-[8px] lg:text-[10px] font-bold text-rose-500 whitespace-nowrap">
                          PF: -{item.providentFund || 0}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-[8px] lg:text-[10px] font-bold text-blue-500 whitespace-nowrap">
                          V: +{item.vatAmount || 0}
                        </div>
                        <div className="text-[8px] lg:text-[10px] font-bold text-rose-500 whitespace-nowrap">
                          D: -{item.discount || 0}
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-right bg-slate-50/30 whitespace-nowrap">
                    <p className={`text-[11px] lg:text-sm font-black font-mono ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {settings.currencySymbol} {(isInc ? item.amountReceived || 0 : item.amountPaid || 0).toLocaleString()}
                    </p>
                    {advanceAmount > 0.01 && (
                      <div className="mt-1">
                        <span className="text-[8px] lg:text-[9px] font-black px-1.5 py-0.5 rounded border bg-purple-50 border-purple-100 text-purple-600">
                          ADV: {advanceAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {pendingAmount > 0.01 && (
                      <div className="mt-1">
                        <span className="text-[8px] lg:text-[9px] font-black px-1.5 py-0.5 rounded border bg-red-50 border-red-100 text-red-600">
                          DUE: {pendingAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-center">
                    <span
                      className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-wider border shadow-sm ${item.status === 'PENDING'
                        ? 'bg-amber-50 border-amber-200 text-amber-600'
                        : item.status === 'APPROVED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-red-50 border-red-200 text-red-600'
                        }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-center">
                    {item.status === 'PENDING' ? (
                      user?.role === 'APPROVER' || user?.role === 'SUPERADMIN' ? (
                        <div className="flex gap-2 justify-center">
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() => onEdit(item)}
                              className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg text-[9px] font-black hover:bg-slate-300 transition-all active:scale-95"
                            >
                              EDIT
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onAction(item._id, 'APPROVED', item.type)}
                            disabled={actionLoading === item._id}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            APPROVE
                          </button>
                          <button
                            type="button"
                            onClick={() => onAction(item._id, 'REJECTED', item.type)}
                            disabled={actionLoading === item._id}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-black hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            REJECT
                          </button>
                        </div>
                      ) : (
                        <div className="inline-block px-3 py-1.5 bg-amber-50/50 rounded-lg">
                          <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider">
                            Awaiting Approval
                          </span>
                        </div>
                      )
                    ) : item.status === 'APPROVED' && user?.role !== 'AUDITOR' ? (
                      <button
                        type="button"
                        onClick={() => onInvoice(item)}
                        className="px-4 py-2 bg-indigo-50 border border-indigo-100/50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-300 shadow-sm hover:shadow-indigo-500/25 active:scale-95"
                      >
                        View Invoice
                      </button>

                    ) : (
                      <div className="inline-block px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                          Processed
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-20 text-center text-slate-400 italic font-medium">
                No records found for this category.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default TransactionTableDesktop;
