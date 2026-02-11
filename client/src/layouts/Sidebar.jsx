import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MENU_CONFIG } from '../config/menuConfig';

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const currentMenus = MENU_CONFIG[userRole] || [];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserName(parsed.name || userRole);
    }
  }, [userRole]);

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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-700 
          transition-transform duration-500 ease-out transform shadow-2xl border-r border-slate-800/50 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className="relative h-24 flex items-center justify-center border-b border-slate-800/50">
          <div className="absolute inset-0 bgg-slate-800/50" />
          <div className="relative text-center">
            <h1 className="text-2xl font-black tracking-tight text-white">
              CRM
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {currentMenus.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onClose && onClose()}
                className={`group relative flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl animate-slideIn
                  transition-all duration-300 ${isActive
                    ? 'bg-blue-700 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <span className="text-xl mr-4">{item.icon}</span>
                <span className="flex-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;