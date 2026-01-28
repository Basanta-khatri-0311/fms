import React from 'react';

const TransactionInfoCard = ({ icon, label, title, description, borderColor, bgColor }) => (
  <div className={`bg-white p-6 rounded-xl border-2 ${borderColor} shadow-sm`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
        <p className="text-xl font-black text-slate-900">{title}</p>
      </div>
    </div>
    <p className="text-sm text-slate-600 leading-relaxed">
      {description}
    </p>
  </div>
);

export default TransactionInfoCard;