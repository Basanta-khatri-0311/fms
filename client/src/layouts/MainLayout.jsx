import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || {
    name: 'User',
    role: 'RECEPTIONIST',
    email: 'user@example.com'
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        userRole={user.role} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Premium Top Navigation */}
        <header className="relative flex items-center justify-between h-24 px-8 sm:px-12 bg-white/70 backdrop-blur-2xl 
          border-b border-slate-100 z-30 shadow-xs">
          
          <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent opacity-50" />

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
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Management Suite</h2>
            </div>
          </div>

          {/* Right section: System User + Critical Actions */}
          <div className="flex items-center gap-8 ml-auto">
            {/* User Identity Portfolio */}
            <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-tight">{user.name}</p>
                <div className="flex justify-end items-center gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.1em]">
                    {user.role} Identity
                  </p>
                </div>
              </div>
              <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-slate-200 border border-slate-800 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Termination Action */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-6 py-3 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-2xl transition-all duration-300 group shadow-sm active:scale-95"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:rotate-12"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">LOGOUT</span>
            </button>
          </div>
        </header>

        {/* Main Operational Surface */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100/50 scrollbar-hide">
          <div className="max-w-7xl mx-auto p-8 lg:p-12">
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        confirmColor="rose"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default MainLayout;