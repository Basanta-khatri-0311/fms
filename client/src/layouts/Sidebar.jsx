import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MENU_CONFIG } from '../config/menuConfig';

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const currentMenus = MENU_CONFIG[userRole] || [];

  useEffect(() => {
    // Grab the actual name from the stored user object
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserName(parsed.name || userRole); // Fallback to role if name is missing
    }
  }, [userRole]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 
          transition-transform duration-500 ease-out transform shadow-2xl border-r border-slate-800/50 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className="relative h-24 flex items-center justify-center border-b border-slate-800/50">
          <div className="absolute inset-0 bg-[radial-linear(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)]" />
          <div className="relative text-center">
            <h1 className="text-2xl font-black tracking-tight text-white">
              CRM<span className="text-blue-400">.</span>
            </h1>

          </div>
        </div>

        {/* Navigation - flex-1 allows it to grow and push the badge down */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {currentMenus.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onClose && onClose()}
                className={`group relative flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl
                  transition-all duration-300 ${isActive
                    ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <span className="text-xl mr-4">{item.icon}</span>
                <span className="flex-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
