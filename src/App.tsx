import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Shops from './pages/Shops';
import ShopDetails from './pages/ShopDetails';
import Products from './pages/Products';
import SalesOfficers from './pages/SalesOfficers';
import Schemes from './pages/Schemes';
import WorkHours from './pages/WorkHours';
import AreaSalesManagers from './pages/AreaSalesManagers';
import Admins from './pages/Admins';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Update document title based on login status
    document.title = user ? 'Dashboard PWA' : 'Login - Dashboard PWA';
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="shops" element={<Shops />} />
        <Route path="shops/:shopId" element={<ShopDetails />} />
        <Route path="products" element={<Products />} />
        <Route path="sales-officers" element={<SalesOfficers />} />
        <Route path="schemes" element={<Schemes />} />
        <Route path="work-hours" element={<WorkHours />} />
        
        {/* Admin only routes */}
        <Route path="area-sales-managers" element={
          <ProtectedRoute requiredRole="admin"><AreaSalesManagers /></ProtectedRoute>
        } />
        <Route path="admins" element={
          <ProtectedRoute requiredRole="admin"><Admins /></ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;