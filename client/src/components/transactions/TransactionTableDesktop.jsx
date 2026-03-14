import React from 'react';
import API from '../../api/axiosConfig';

const getApiOrigin = () => {
  const base = API.defaults.baseURL || '';
  // http://localhost:5500/api -> http://localhost:5500
  return base.replace(/\/api\/?$/, '');
};

const buildAttachmentUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const origin = getApiOrigin();
  const normalizedPath = path.replace(/^\/+/, '');
  return `${origin}/${normalizedPath}`;
};

const TransactionTableDesktop = ({ rows, user, onAction, onEdit, actionLoading, onInvoice }) => (
  <div className="hidden lg:block bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden relative">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200/80">
            <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Transaction Details</th>
            <th className="px-4 py-5 text-right text-[10px] font-black uppercase text-slate-400">Gross</th>
            <th className="px-4 py-5 text-right text-[10px] font-black uppercase text-slate-400">VAT/Disc</th>
            <th className="px-6 py-5 text-right text-[10px] font-black uppercase text-slate-900 bg-slate-100/30">
              Net Value
            </th>
            <th className="px-6 py-5 text-center text-[10px] font-black uppercase text-slate-400">Status</th>
            <th className="px-6 py-5 text-center text-[10px] font-black uppercase text-slate-400">
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-1.5 h-10 rounded-full ${barColor} shadow-sm`} />
                      <div>
                        <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-900 transition-colors">{item.displayName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        {user?.role !== 'AUDITOR' && attachmentUrl && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); window.open(attachmentUrl, '_blank', 'noopener'); }}
                            className="mt-1 flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 hover:underline transition-colors bg-indigo-50 px-2 py-0.5 rounded-md w-fit"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            View Attachment
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-bold text-slate-600">
                    Rs. {(item.amountBeforeVAT || item.grossSalary)?.toLocaleString() || '0'}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {isPay ? (
                      <>
                        <div className="text-[10px] font-bold text-rose-500">
                          T: -{item.taxDeduction || 0}
                        </div>
                        <div className="text-[10px] font-bold text-rose-500">
                          PF: -{item.providentFund || 0}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-[10px] font-bold text-blue-500">
                          V: +{item.vatAmount || 0}
                        </div>
                        <div className="text-[10px] font-bold text-rose-500">
                          D: -{item.discount || 0}
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right bg-slate-50/30">
                    <p className={`text-sm font-black font-mono ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Rs. {net.toLocaleString()}
                    </p>
                    {advanceAmount > 0.01 && (
                      <div className="mt-1">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-purple-50 border-purple-100 text-purple-600">
                          ADV: Rs. {advanceAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {pendingAmount > 0.01 && (
                      <div className="mt-1">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-red-50 border-red-100 text-red-600">
                          DUE: Rs. {pendingAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${item.status === 'PENDING'
                        ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-amber-500/10'
                        : item.status === 'APPROVED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-emerald-500/10'
                          : 'bg-red-50 border-red-200 text-red-600 shadow-red-500/10'
                        }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
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
                        Create Invoice
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
              <td colSpan="6" className="px-6 py-20 text-center text-slate-400 italic font-medium">
                No records found for this category.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default TransactionTableDesktop;
