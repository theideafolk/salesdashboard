import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  
  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="mr-4 md:hidden text-slate-500 hover:text-slate-700 focus:outline-none"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/dashboard" className="flex items-center">
              <img 
                src="/assets/Benzorgo_revised_logo.png" 
                alt="Benzorgo Logo" 
                className="h-12 w-auto"
              />
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="mr-4 text-right">
              <p className="text-sm font-medium">{user?.email || user?.phone_number}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role || 'User'}</p>
            </div>
            <button 
              onClick={signOut}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - desktop */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        {/* Sidebar - mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div 
              className="fixed inset-0 bg-slate-600 bg-opacity-75 transition-opacity"
              onClick={toggleSidebar}
            ></div>
            <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white">
              <Sidebar />
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden">
        <MobileNav isAdmin={isAdmin} />
      </div>
    </div>
  );
};

export default Layout;