import React from 'react';

const QuickActionCard = ({ icon, title, description, color, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative overflow-hidden bg-linear-to-br ${color} p-8 rounded-2xl 
      border-2 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 
      hover:-translate-y-2 text-left w-full`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 
      group-hover:scale-150 transition-transform duration-500" />
    
    <div className="relative">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-black text-white mb-2">{title}</h3>
      <p className="text-white/80 font-medium">{description}</p>
      
      <div className="mt-6 flex items-center text-white font-bold group-hover:translate-x-2 transition-transform">
        <span>Start Entry</span>
        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </div>
  </button>
);

export default QuickActionCard;