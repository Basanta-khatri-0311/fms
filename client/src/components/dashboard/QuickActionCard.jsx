import React from 'react';

const QuickActionCard = ({ icon, title, description, bgClass, hoverbgClass, accent, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative overflow-hidden ${bgClass} ${hoverbgClass} p-8 rounded-4xl 
      border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 
      hover:-translate-y-2 text-left w-full h-full flex flex-col`}
  >
    <div className={`absolute top-0 right-0 w-64 h-64 bg-linear-to-br ${accent} rounded-full blur-3xl opacity-20 -mr-20 -mt-20 
      group-hover:scale-150 group-hover:opacity-40 transition-all duration-700 pointer-events-none`} />
    
    <div className="relative z-10 grow flex flex-col">
      <div className="text-5xl mb-6 bg-white/10 w-fit p-4 rounded-2xl border border-white/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-white mb-3 tracking-wide">{title}</h3>
      <p className="text-white/80 font-medium leading-relaxed mb-6 grow">{description}</p>
      
      <div className="mt-auto flex items-center text-white font-bold group-hover:translate-x-3 transition-transform duration-300 bg-white/10 w-fit px-5 py-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
        <span className="text-sm tracking-wider uppercase">Start Entry</span>
        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </div>
  </button>
);

export default QuickActionCard;