import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full text-center">
        {/* Animated Icon Container */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse" />
          <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <span className="text-7xl">🚫</span>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Access Denied
        </h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          It looks like you don't have the necessary permissions to view this page. 
          Please contact your administrator if you believe this is a mistake.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)} // Go back to where they came from
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl 
              shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all 
              active:scale-[0.98] uppercase tracking-widest text-xs"
          >
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/dashboard')} // Take them to their specific dashboard
            className="w-full py-4 bg-white text-slate-600 font-bold rounded-2xl 
              border-2 border-slate-100 hover:bg-slate-50 transition-all 
              active:scale-[0.98] uppercase tracking-widest text-xs"
          >
            Return Home
          </button>
        </div>

        {/* Help Link */}
        <p className="mt-12 text-slate-400 text-sm font-medium">
          Security Code: <span className="font-mono text-red-400">403_FORBIDDEN</span>
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;