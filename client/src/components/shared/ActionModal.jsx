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
        <div className="relative px-8 pt-8 pb-6 bg-slate-50/50 shrink-0 border-b border-slate-100">
          <button 
            onClick={onCancel}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isReject ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600 shadow-emerald-100'}`}>
              {isReject ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              )}
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {isReject ? 'Confirm Rejection' : 'Confirm Approval'}
            </h2>
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
        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl shrink-0">
          <button 
            onClick={onCancel} 
            className="px-6 py-2.5 text-xs font-black text-slate-500 hover:text-slate-700 hover:bg-white rounded-xl transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isReject && !reason.trim()}
            className={`px-8 py-2.5 text-white text-xs font-black rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest ${
              isReject 
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-200' 
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200'
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
