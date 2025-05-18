import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Store, 
  Package, 
  Users,
  Banknote,
  Clock,
  UserCircle,
  Shield,
  Menu
} from 'lucide-react';
import { cn } from '../utils/cn';

interface MobileNavProps {
  isAdmin: boolean;
}

const MobileNav: React.FC<MobileNavProps> = ({ isAdmin }) => {
  const [showMore, setShowMore] = React.useState(false);
  
  const toggleMore = () => {
    setShowMore(!showMore);
  };
  
  const baseItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/orders", icon: <ShoppingCart size={20} />, label: "Orders" },
    { to: "/shops", icon: <Store size={20} />, label: "Shops" },
    { to: "/products", icon: <Package size={20} />, label: "Products" },
  ];
  
  const moreItems = [
    { to: "/sales-officers", icon: <Users size={20} />, label: "Sales Officers" },
    { to: "/schemes", icon: <Banknote size={20} />, label: "Schemes" },
    { to: "/work-hours", icon: <Clock size={20} />, label: "Work Hours" },
  ];
  
  const adminItems = [
    { to: "/area-sales-managers", icon: <UserCircle size={20} />, label: "ASMs" },
    { to: "/admins", icon: <Shield size={20} />, label: "Admins" },
  ];
  
  const renderNavItem = (to: string, icon: React.ReactNode, label: string) => (
    <NavLink 
      key={to}
      to={to}
      className={({ isActive }) => cn(
        "flex flex-col items-center justify-center px-2 py-1",
        "text-xs font-medium transition-colors",
        isActive ? "text-primary-600" : "text-slate-600"
      )}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </NavLink>
  );
  
  return (
    <>
      {/* Main mobile navigation */}
      <nav className="bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-30">
        <div className="grid grid-cols-5 h-16">
          {baseItems.map(item => renderNavItem(item.to, item.icon, item.label))}
          
          {/* More button */}
          <button
            onClick={toggleMore}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1",
              "text-xs font-medium transition-colors",
              showMore ? "text-primary-600" : "text-slate-600"
            )}
          >
            <Menu size={20} />
            <span className="mt-1">More</span>
          </button>
        </div>
      </nav>
      
      {/* Expanded menu */}
      {showMore && (
        <div className="fixed bottom-16 inset-x-0 bg-white border-t border-slate-200 z-20 animate-slide-up">
          <div className="grid grid-cols-3 gap-1 p-2">
            {moreItems.map(item => renderNavItem(item.to, item.icon, item.label))}
            
            {/* Admin items */}
            {isAdmin && adminItems.map(item => renderNavItem(item.to, item.icon, item.label))}
          </div>
        </div>
      )}
      
      {/* Backdrop for clicking outside */}
      {showMore && (
        <div 
          className="fixed inset-0 bg-slate-900 bg-opacity-20 z-10"
          onClick={toggleMore}
        ></div>
      )}
    </>
  );
};

export default MobileNav;