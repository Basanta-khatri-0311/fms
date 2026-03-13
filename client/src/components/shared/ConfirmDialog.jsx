import React from 'react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = 'emerald' }) => {
  if (!isOpen) return null;

  const colorClasses = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    rose: 'bg-rose-600 hover:bg-rose-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col my-4 animate-slideUp overflow-hidden">
        
        <div className="px-6 py-5 shrink-0 bg-slate-800">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-white tracking-tight">{title}</h2>
            <button onClick={onCancel} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white font-bold">✕</button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-4 text-center">
          <p className="text-slate-600 font-medium text-lg leading-relaxed">
            {message}
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-100 flex justify-end gap-3 rounded-b-3xl">
          <button onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all ${colorClasses[confirmColor] || colorClasses.emerald}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
