import React from 'react';
import API from '../../api/axiosConfig';
import { Inbox } from 'lucide-react';

const getApiOrigin = () => {
  const base = API.defaults.baseURL || '';
  return base.replace(/\/api\/?$/, '');
};

const buildAttachmentUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const origin = getApiOrigin();
  const normalizedPath = path.replace(/^\/+/, '');
  return `${origin}/${normalizedPath}`;
};

const TransactionCardsMobile = ({ rows, user, onAction, onEdit, actionLoading, onInvoice }) => (
  <div className="lg:hidden space-y-4">
    {rows.length > 0 ? (
      rows.map((item) => {
        const isInc = item.type === 'INCOME';
        const isPay = item.type === 'PAYROLL';
        const net = isInc ? item.netAmount || 0 : item.netPayable || 0;
        const paid = isInc ? item.amountReceived || 0 : item.amountPaid || 0;
        const balance = paid - net;
        const attachmentUrl = buildAttachmentUrl(item.attachmentUrl);
        const barColor = isInc ? 'bg-emerald-500' : isPay ? 'bg-teal-500' : 'bg-rose-500';

        return (
          <div
            key={item._id}
            className="bg-white rounded-2xl shadow-md border border-slate-200 p-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-14 rounded-full ${barColor} shadow-md`} />
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight">
                    {item.displayName || (isInc ? item.name : item.vendorName)}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  {user?.role !== 'AUDITOR' && attachmentUrl && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); window.open(attachmentUrl, '_blank', 'noopener'); }}
                      className="mt-1.5 flex items-center gap-1 bg-indigo-50/80 px-2 py-1 rounded-md text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      View Attachment
                    </button>
                  )}
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${
                  item.status === 'PENDING'
                    ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-amber-500/10'
                    : item.status === 'APPROVED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-emerald-500/10'
                    : 'bg-red-50 border-red-200 text-red-600 shadow-red-500/10'
                }`}
              >
                {item.status}
              </span>
            </div>

            {/* Amount Details */}
            <div className="bg-slate-50 rounded-xl p-3 mb-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-bold">Gross</span>
                <span className="text-slate-700 font-bold">
                  Rs. {(item.amountBeforeVAT || item.grossSalary)?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex flex-col text-[10px] space-y-1 mb-1">
                {isPay ? (
                  <div className="flex justify-between">
                    <span className="text-rose-500 font-bold">- Tax: {item.taxDeduction || 0}</span>
                    <span className="text-rose-500 font-bold">- PF: {item.providentFund || 0}</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-blue-500 font-bold">+ VAT: {item.vatAmount || 0}</span>
                    <span className="text-rose-500 font-bold">- Disc: {item.discount || 0}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="text-xs font-black text-slate-600">Net</span>
                <span
                  className={`text-base font-black ${
                    isInc ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  Rs. {net.toLocaleString()}
                </span>
              </div>
              {Math.abs(balance) > 0.01 && (
                <div className="pt-1">
                  <span
                    className={`inline-block px-2 py-1 rounded-lg text-[9px] font-black border ${
                      balance < 0
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-purple-50 border-purple-200 text-purple-600'
                    }`}
                  >
                    {balance < 0
                      ? `DUE: Rs. ${Math.abs(balance).toLocaleString()}`
                      : `ADV: Rs. ${balance.toLocaleString()}`}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            {item.status === 'PENDING' &&
              (user?.role === 'APPROVER' || user?.role === 'SUPERADMIN') && (
                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="flex-1 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[11px] font-black uppercase tracking-wide hover:bg-slate-200 active:scale-95 transition-all shadow-sm"
                    >
                      EDIT
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onAction(item._id, 'APPROVED', item.type)}
                    disabled={actionLoading === item._id}
                    className="flex-1 py-2.5 bg-emerald-600 border border-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wide hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all shadow-sm shadow-emerald-500/20"
                  >
                    APPROVE
                  </button>
                  <button
                    type="button"
                    onClick={() => onAction(item._id, 'REJECTED', item.type)}
                    disabled={actionLoading === item._id}
                    className="flex-1 py-2.5 bg-rose-600 border border-rose-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wide hover:bg-rose-700 active:scale-95 disabled:opacity-50 transition-all shadow-sm shadow-rose-500/20"
                  >
                    REJECT
                  </button>
                </div>
              )}
            {item.status === 'PENDING' && user?.role === 'RECEPTIONIST' && (
              <div className="text-center py-2.5 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-600 font-black uppercase tracking-widest">
                  Awaiting Approval
                </span>
              </div>
            )}
            {item.status !== 'PENDING' && (
              <div className="flex gap-2">
                <div className="flex-1 text-center py-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Processed
                  </span>
                </div>
                {item.status === 'APPROVED' && user?.role !== 'AUDITOR' && (
                  <button
                    type="button"
                    onClick={() => onInvoice(item)}
                    className="flex-1 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-indigo-500/20"
                  >
                    Create Invoice
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })
    ) : (
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center flex flex-col items-center">
        <Inbox className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-400 font-bold">No records found</p>
      </div>
    )}
  </div>
);

export default TransactionCardsMobile;
