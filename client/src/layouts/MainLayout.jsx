import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user')) || { 
    name: 'User', 
    role: 'RECEPTIONIST',
    email: 'user@example.com'
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} userRole={user.role} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="relative flex items-center justify-between h-20 px-4 sm:px-8 bg-white/80 backdrop-blur-xl 
          border-b border-slate-200/50 shadow-sm z-30">
          
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-violet-50/30 -z-10" />

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-300 
              active:scale-95 text-slate-700 group z-50"
          >
            <svg 
              className="w-6 h-6 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
          </div>

          {/* Right section: User info + Logout */}
          <div className="flex items-center gap-4 sm:gap-10 ml-auto">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-x font-medium  text-slate-900">{user.name}</p>
              </div>

            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="group relative px-4 sm:px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 
                text-white text-sm font-bold rounded-xl
                hover:from-red-600 hover:to-red-700 
                active:scale-95 transition-all duration-300 
                shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30
                overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
              </span>
              
              <div className="absolute inset-0 bg-linear-to-r from-red-600 to-red-700 
                translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-linear-to-br from-slate-50 via-blue-50/20 to-violet-50/20 
          custom-scrollbar">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="animate-fadeIn">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.5);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.4);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.6);
        }
      `}</style>
    </div>
  );
};

export default MainLayout;