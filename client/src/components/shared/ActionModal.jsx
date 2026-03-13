import React, { useState } from 'react';

const ActionModal = ({ pendingAction, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');

  if (!pendingAction) return null;

  const { action, type } = pendingAction;
  const isReject = action === 'REJECTED';

  const handleConfirm = () => {
    onConfirm(isReject ? reason : null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col my-4 animate-slideUp overflow-hidden">
        
        {/* Header */}
        <div className={`px-6 py-5 ${isReject ? 'bg-orange-500' : 'bg-emerald-500'} shrink-0`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-white tracking-tight">
              {isReject ? 'Confirm Rejection' : 'Confirm Approval'}
            </h2>
            <button onClick={onCancel} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white font-bold">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-4">
          <p className="text-slate-600 font-medium">
            Are you sure you want to {action.toLowerCase()} this {type.toLowerCase()} entry?
          </p>

          {isReject && (
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-2">Reason for Rejection *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows="3"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                placeholder="State the reason here..."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-3xl">
          <button onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isReject && !reason.trim()}
            className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 ${
              isReject ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isReject ? 'Reject Entry' : 'Approve Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
