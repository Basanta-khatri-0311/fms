import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_CONFIG } from '../config/menuConfig';

const Sidebar = ({ isOpen, onClose, userRole, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const currentMenus = MENU_CONFIG[userRole] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-950 
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform shadow-2xl flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-[100px]' : 'lg:w-[320px] w-80'}`}
      >
        {/* Toggle Button (Hidden on Mobile) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-4 top-32 w-8 h-8 bg-indigo-600 rounded-full items-center justify-center text-white shadow-lg shadow-indigo-500/40 z-50 hover:bg-violet-600 transition-all duration-300 hover:scale-110 active:scale-95 group"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Logo Section */}
        <div className={`relative h-28 flex items-center border-b border-white/5 transition-all duration-500 ${isCollapsed ? 'px-6 justify-center' : 'px-10'}`}>
          <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 group overflow-hidden">
            <div className="shrink-0 w-12 h-12 bg-linear-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white text-2xl font-black">xy</span>
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h1 className="text-2xl font-black tracking-tighter text-white">
                  XYZ<span className="text-indigo-500">EDU</span>
                </h1>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em]">Educational Consultency</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-10 space-y-3 overflow-y-auto custom-scrollbar scrollbar-hide transition-all duration-500 ${isCollapsed ? 'px-4' : 'px-6'}`}>
          {currentMenus
            .filter((item) => {
              // ... filtration logic stays same
              if (item.permission) {
                const storedUser = localStorage.getItem('user');
                const parsed = storedUser ? JSON.parse(storedUser) : null;
                if (parsed?.role === 'SUPERADMIN' || parsed?.role === 'AUDITOR') return true;
                return parsed?.permissions?.[item.permission] === true;
              }
              return true;
            })
            .map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onClose && onClose()}
                className={`group relative flex items-center rounded-2xl transition-all duration-400
                  ${isCollapsed ? 'justify-center h-14 w-14 mx-auto mb-2' : 'px-6 py-4 mb-1'}
                  ${isActive
                    ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                title={isCollapsed ? item.name : ""}
              >
                {/* Active Indicator Pill */}
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 w-1.5 h-6 bg-white rounded-full -ml-3 shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                )}

                <span className={`transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} 
                  ${isCollapsed ? 'text-2xl' : 'text-2xl mr-5'}`}>
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className={`tracking-wide font-black uppercase inline-block animate-in fade-in slide-in-from-left-2 duration-400 text-sm tracking-[0.05em]
                    ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {item.name}
                  </span>
                )}

                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;