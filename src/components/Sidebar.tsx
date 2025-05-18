import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Store, 
  Package,
  Users,
  Banknote, 
  Clock,
  UserCircle,
  Shield
} from 'lucide-react';
import { cn } from '../utils/cn';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => cn(
      "flex items-center py-3 px-4 rounded-md transition-colors duration-150",
      "hover:bg-slate-100",
      isActive 
        ? "bg-primary-50 text-primary-700 font-medium" 
        : "text-slate-600"
    )}
  >
    <span className="w-6 h-6">{icon}</span>
    <span className="ml-3">{label}</span>
  </NavLink>
);

const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="w-64 h-full border-r border-slate-200 bg-white">
      <div className="px-3 py-4 flex flex-col h-full">
        <div className="space-y-1 flex-1">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/orders" icon={<ShoppingCart size={20} />} label="Orders" />
          <NavItem to="/shops" icon={<Store size={20} />} label="Shops" />
          <NavItem to="/products" icon={<Package size={20} />} label="Products" />
          <NavItem to="/sales-officers" icon={<Users size={20} />} label="Sales Officers" />
          <NavItem to="/schemes" icon={<Banknote size={20} />} label="Schemes" />
          <NavItem to="/work-hours" icon={<Clock size={20} />} label="Work Hours" />
          
          {/* Admin only section */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <div className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Admin Section
                </div>
              </div>
              <NavItem to="/area-sales-managers" icon={<UserCircle size={20} />} label="Area Sales Managers" />
              <NavItem to="/admins" icon={<Shield size={20} />} label="Admins" />
            </>
          )}
        </div>
        
        <div className="mt-auto px-4 py-3">
          <div className="px-4 py-3 bg-primary-50 rounded-lg">
            <p className="text-xs font-medium text-primary-800">DashPWA v1.0</p>
            <p className="text-xs text-primary-700 mt-1">Connected to Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;