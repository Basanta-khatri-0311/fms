import React from 'react';

const TransactionTableDesktop = ({ rows, user, onAction, actionLoading }) => (
  <div className="hidden lg:block bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200">
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
              const net = isInc ? item.netAmount || 0 : item.netPayable || 0;
              const paid = isInc ? item.amountReceived || 0 : item.amountPaid || 0;
              const balance = paid - net;

              return (
                <tr key={item._id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-8 rounded-full ${isInc ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.displayName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-bold text-slate-600">
                    Rs. {item.amountBeforeVAT?.toLocaleString() || '0'}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-[10px] font-bold text-blue-500">V: +{item.vatAmount || 0}</div>
                    <div className="text-[10px] font-bold text-rose-500">D: -{item.discount || 0}</div>
                  </td>
                  <td className="px-6 py-4 text-right bg-slate-50/30">
                    <p className={`text-sm font-black font-mono ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Rs. {net.toLocaleString()}
                    </p>
                    {Math.abs(balance) > 0.01 && (
                      <div className="mt-1">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                            balance < 0
                              ? 'bg-red-50 border-red-100 text-red-600'
                              : 'bg-purple-50 border-purple-100 text-purple-600'
                          }`}
                        >
                          {balance < 0
                            ? `DUE: ${Math.abs(balance).toLocaleString()}`
                            : `ADV: ${balance.toLocaleString()}`}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                        item.status === 'PENDING'
                          ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : item.status === 'APPROVED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-red-50 border-red-200 text-red-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.status === 'PENDING' ? (
                      user?.role === 'APPROVER' || user?.role === 'SUPERADMIN' ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => onAction(item._id, 'APPROVED', item.type)}
                            disabled={actionLoading === item._id}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            APPROVE
                          </button>
                          <button
                            onClick={() => onAction(item._id, 'REJECTED', item.type)}
                            disabled={actionLoading === item._id}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-black hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            REJECT
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] text-amber-500 font-black uppercase tracking-wider">
                          Awaiting Approval
                        </span>
                      )
                    ) : (
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan="6"
                className="px-6 py-20 text-center text-slate-400 italic font-medium"
              >
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

