import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
  const styles = {
    success: 'bg-emerald-500 shadow-emerald-500/20',
    error: 'bg-rose-500 shadow-rose-500/20',
    warning: 'bg-amber-500 shadow-amber-500/20'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 flex items-center gap-3 px-6 py-4 rounded-2xl text-white font-bold shadow-2xl z-100 animate-slideIn ${styles[type]}`}>
      <span className="text-xl">{icons[type]}</span>
      <p className="text-sm tracking-wide">{message}</p>
      <button onClick={onClose} className="ml-4 hover:opacity-70 text-white/80">✕</button>
      
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
};

export default Toast;