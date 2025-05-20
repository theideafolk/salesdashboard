import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, Users, ShoppingCart, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useCallback } from 'react';

// Define types for our dashboard data
interface DashboardStats {
  totalSales: number;
  activeShops: number;
  ordersCount: number;
  activeSalesOfficers: number;
  percentChanges: {
    sales: number;
    shops: number;
    orders: number;
    officers: number;
  };
}

interface SalesDataPoint {
  month: string;
  value: number;
}

interface RecentActivity {
  id: string;
  description: string;
  time: string;
}

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    activeShops: 0,
    ordersCount: 0,
    activeSalesOfficers: 0,
    percentChanges: {
      sales: 0,
      shops: 0,
      orders: 0,
      officers: 0
    }
  });
  
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  
  // Calculate max value for chart scaling
  const maxValue = Math.max(...salesData.map(item => item.value), 1);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // For ASM, first get their sales officers
        let salesOfficerIds: string[] = [];
        
        if (!isAdmin && user) {
          const { data: officers, error: officersError } = await supabase
            .from('sales_officers')
            .select('sales_officers_id')
            .eq('reporting_manager_id', user.id)
            .eq('is_active', true);
            
          if (officersError) throw new Error(`Error fetching sales officers: ${officersError.message}`);
          salesOfficerIds = officers?.map(o => o.sales_officers_id) || [];
        }
        
        // Build orders query based on role
        let ordersQuery = supabase
          .from('orders_view')
          .select('*')
          .eq('is_deleted', false);
          
        // Filter by sales officers if ASM
        if (!isAdmin && salesOfficerIds.length > 0) {
          ordersQuery = ordersQuery.in('sales_officers_id', salesOfficerIds);
        }
        
        const { data: ordersData, error: ordersError } = await ordersQuery;
          
        if (ordersError) throw new Error(`Error fetching orders data: ${ordersError.message}`);
        
        const totalSales = ordersData?.reduce((sum, order) => sum + parseFloat(order.amount), 0) || 0;
        
        // Fetch active shops count
        let shopsQuery = supabase
          .from('shops')
          .select('shop_id', { count: 'exact', head: true });
          
        // For ASM, only count shops with orders from their team
        if (!isAdmin && salesOfficerIds.length > 0) {
          shopsQuery = shopsQuery.in('created_by', salesOfficerIds);
        }
        
        const { count: activeShops, error: shopsError } = await shopsQuery;
          
        if (shopsError) throw new Error(`Error fetching shops data: ${shopsError.message}`);
        
        // Fetch orders count
        const ordersCount = ordersData?.length || 0;
          
        // Fetch active sales officers count
        let officersQuery = supabase
          .from('sales_officers')
          .select('sales_officers_id', { count: 'exact', head: true })
          .eq('is_active', true);
        
        // For ASM, only count their team
        if (!isAdmin && user) {
          officersQuery = officersQuery.eq('reporting_manager_id', user.id);
        }
        
        const { count: activeSalesOfficers, error: officersError } = await officersQuery;
          
        if (officersError) throw new Error(`Error fetching sales officers data: ${officersError.message}`);
        
        // Process monthly sales data
        const monthlyData = processMonthlyData(ordersData || []);
        
        // Fetch recent activity (5 most recent orders)
        const recentOrders = ordersData
          ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        const recentActivity = (recentOrders || []).map(order => ({
          id: order.order_id,
          description: `${order.sales_officer_name} placed order for ${order.product_name} at ${order.shop_name}`,
          time: getRelativeTime(new Date(order.created_at))
        }));
        
        // Calculate mock percent changes - in a real app, this would compare with previous periods
        const percentChanges = {
          sales: calculatePercentChange(ordersData || [], 'amount'),
          shops: 7, // Placeholder - would calculate from historical data
          orders: calculatePercentChange(ordersData || [], 'count'),
          officers: 0 // Placeholder - would calculate from historical data
        };
        
        setStats({
          totalSales,
          activeShops: activeShops || 0,
          ordersCount: ordersCount || 0,
          activeSalesOfficers: activeSalesOfficers || 0,
          percentChanges
        });
        
        setSalesData(monthlyData);
        setRecentActivity(recentActivity);
        
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Helper function to calculate percent change
  const calculatePercentChange = useCallback((data: any[], type: 'amount' | 'count') => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const currentData = data.filter(item => new Date(item.created_at) >= lastMonth);
    const previousData = data.filter(item => {
      const date = new Date(item.created_at);
      return date >= new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, lastMonth.getDate()) &&
             date < lastMonth;
    });
    
    if (type === 'amount') {
      const currentTotal = currentData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const previousTotal = previousData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      return previousTotal === 0 ? 0 : Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
    } else {
      return previousData.length === 0 ? 0 : 
        Math.round(((currentData.length - previousData.length) / previousData.length) * 100);
    }
  }, []);
  
  // Helper function to process monthly sales data
  const processMonthlyData = (orders: any[]): SalesDataPoint[] => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    
    // Initialize data for the last 6 months
    const monthlyData: Record<string, number> = {};
    
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = monthNames[date.getMonth()];
      monthlyData[monthKey] = { month: monthName, value: 0 };
    }
    
    // Sum order amounts by month
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].value += parseFloat(order.amount);
      }
    });
    
    // Convert to array and sort by month
    return Object.values(monthlyData).sort((a, b) => {
      const monthA = monthNames.indexOf(a.month);
      const monthB = monthNames.indexOf(b.month);
      return monthA - monthB;
    });
  };
  
  // Helper function to format relative time
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  };
  
  // If there's an error loading the dashboard data
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium">Error loading dashboard data</h3>
            <p className="mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.email || user?.phone_number}
          </p>
        </div>
        
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
            {new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-100">Total Sales</p>
              <h3 className="text-2xl font-bold mt-1">
                {isLoading ? "Loading..." : `₹${stats.totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              </h3>
              <div className="text-primary-100 text-sm flex items-center mt-2">
                <TrendingUp size={16} className="mr-1" />
                <span>+{stats.percentChanges.sales}% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <BarChart3 size={24} />
            </div>
          </div>
        </div>
        
        <div className="card border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500">Active Shops</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {isLoading ? "Loading..." : stats.activeShops.toLocaleString()}
              </h3>
              <div className="text-green-600 text-sm flex items-center mt-2">
                <TrendingUp size={16} className="mr-1" />
                <span>+{stats.percentChanges.shops}% from last week</span>
              </div>
            </div>
            <div className="p-3 bg-secondary-100 text-secondary-600 rounded-lg">
              <Store size={24} />
            </div>
          </div>
        </div>
        
        <div className="card border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500">New Orders</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {isLoading ? "Loading..." : stats.ordersCount.toLocaleString()}
              </h3>
              <div className="text-green-600 text-sm flex items-center mt-2">
                <TrendingUp size={16} className="mr-1" />
                <span>+{stats.percentChanges.orders}% from yesterday</span>
              </div>
            </div>
            <div className="p-3 bg-accent-100 text-accent-600 rounded-lg">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>
        
        <div className="card border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500">Active Sales Officers</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {isLoading ? "Loading..." : stats.activeSalesOfficers.toLocaleString()}
              </h3>
              <div className="text-amber-600 text-sm flex items-center mt-2">
                <TrendingUp size={16} className={`mr-1 ${stats.percentChanges.officers === 0 ? 'rotate-90' : ''}`} />
                <span>
                  {stats.percentChanges.officers === 0 
                    ? 'Same as last week' 
                    : `+${stats.percentChanges.officers}% from last week`
                  }
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">
              Monthly Sales
            </h3>
            <div className="flex space-x-2">
              <button className="text-xs px-2 py-1 rounded-md bg-primary-100 text-primary-700">
                This Year
              </button>
              <button className="text-xs px-2 py-1 rounded-md text-slate-500 hover:bg-slate-100">
                Last Year
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-slate-500">Loading sales data...</p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-end space-x-4">
              {salesData.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-primary-200 rounded-t-sm hover:bg-primary-300 transition-colors"
                    style={{ height: `${(item.value / maxValue) * 200}px` }}
                  ></div>
                  <div className="text-xs text-slate-600 mt-2">{item.month}</div>
                  <div className="text-xs font-medium">₹{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Recent activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Recent Activity
          </h3>
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-slate-500">Loading recent activity...</p>
              </div>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 flex-shrink-0">
                    <Activity size={18} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-slate-500">No recent activity found</p>
              </div>
            </div>
          )}
          
          {recentActivity.length > 0 && (
            <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-800 font-medium">
              View all activity
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Additional components used in this page
const Store: React.FC<{ size: number }> = ({ size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
  </svg>
);

const Activity: React.FC<{ size: number }> = ({ size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default Dashboard;