import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
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
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} userRole={user.role} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="relative flex items-center justify-between h-20 px-4 sm:px-8 bg-white/80 backdrop-blur-xl 
          border-b border-slate-200/50 shadow-sm z-30">

          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-blue-50/30 to-violet-50/30 -z-10" />

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
          <div className="flex items-center gap-6 ml-auto">
            {/* User Profile Info */}
            <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mt-1">
                  {user.role}
                </p>
              </div>
             
            </div>

            {/* Logout Button*/}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-200  bg-red-500 rounded-lg transition-all duration-200 group"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-0.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-xs font-bold hidden sm:inline">Sign Out</span>
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