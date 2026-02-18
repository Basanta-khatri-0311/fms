import React from 'react';
import API from '../../api/axiosConfig';

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

const TransactionCardsMobile = ({ rows, user, onAction, onEdit, actionLoading }) => (
  <div className="lg:hidden space-y-4">
    {rows.length > 0 ? (
      rows.map((item) => {
        const isInc = item.type === 'INCOME';
        const net = isInc ? item.netAmount || 0 : item.netPayable || 0;
        const paid = isInc ? item.amountReceived || 0 : item.amountPaid || 0;
        const balance = paid - net;
        const attachmentUrl = buildAttachmentUrl(item.attachmentUrl);

        return (
          <div
            key={item._id}
            className="bg-white rounded-2xl shadow-md border border-slate-200 p-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-12 rounded-full ${isInc ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {isInc ? item.name : item.vendorName}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  {attachmentUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(attachmentUrl, '_blank', 'noopener')}
                      className="mt-1 text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      View Attachment
                    </button>
                  )}
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-[9px] font-black uppercase border ${
                  item.status === 'PENDING'
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : item.status === 'APPROVED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : 'bg-red-50 border-red-200 text-red-600'
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
                  Rs. {item.amountBeforeVAT?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-blue-500 font-bold">+ VAT: {item.vatAmount || 0}</span>
                <span className="text-rose-500 font-bold">- Disc: {item.discount || 0}</span>
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
                      className="flex-1 py-2.5 bg-slate-200 text-slate-800 rounded-xl text-xs font-black hover:bg-slate-300 active:scale-95 transition-all"
                    >
                      EDIT
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onAction(item._id, 'APPROVED', item.type)}
                    disabled={actionLoading === item._id}
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    APPROVE
                  </button>
                  <button
                    type="button"
                    onClick={() => onAction(item._id, 'REJECTED', item.type)}
                    disabled={actionLoading === item._id}
                    className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    REJECT
                  </button>
                </div>
              )}
            {item.status === 'PENDING' && user?.role === 'RECEPTIONIST' && (
              <div className="text-center py-2 bg-amber-50 rounded-xl">
                <span className="text-xs text-amber-600 font-black uppercase">
                  Awaiting Approval
                </span>
              </div>
            )}
            {item.status !== 'PENDING' && (
              <div className="text-center py-2 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400 font-black uppercase">
                  Processed
                </span>
              </div>
            )}
          </div>
        );
      })
    ) : (
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-slate-400 font-bold">No records found</p>
      </div>
    )}
  </div>
);

export default TransactionCardsMobile;
