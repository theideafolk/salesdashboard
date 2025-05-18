// src/pages/ShopDetails/index.tsx
// Shop details page showing comprehensive information about a single shop including
// recent orders, top products, total sales, and top sales officers

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, Calendar, Package, ShoppingBag, Users, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { cn } from '../../utils/cn';

interface ShopDetails {
  shop_id: string;
  name: string;
  address: string | null;
  territory: string | null;
  city: string | null;
  state: string | null;
  country: string;
  photo: string | null;
  gps_location: string | null;
  owner_name: string | null;
  phone_number: string | null;
  created_at: string;
}

interface ShopOrder {
  order_id: string;
  created_at: string;
  total_amount: number;
  currency: string;
  sales_officer_name: string;
  product_count: number;
}

interface TopProduct {
  product_id: string;
  product_name: string;
  quantity: number;
  amount: number;
}

interface TopSalesOfficer {
  sales_officers_id: string;
  name: string;
  visit_count: number;
  order_count: number;
  total_amount: number;
}

const ShopDetails: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
  const [recentOrders, setRecentOrders] = useState<ShopOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [salesCurrency, setSalesCurrency] = useState<string>('INR');
  const [topSalesOfficers, setTopSalesOfficers] = useState<TopSalesOfficer[]>([]);
  
  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!shopId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch shop details
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('shop_id', shopId)
          .eq('is_deleted', false)
          .single();
          
        if (shopError) throw new Error(`Error fetching shop details: ${shopError.message}`);
        if (!shopData) throw new Error('Shop not found');
        
        setShopDetails(shopData);
        
        // Fetch orders from orders_view for this shop
        const { data: visitsData, error: visitsError } = await supabase
          .from('visits')
          .select('visit_id')
          .eq('shop_id', shopId)
          .eq('is_deleted', false);
          
        if (visitsError) throw new Error(`Error fetching shop visits: ${visitsError.message}`);
        
        const visitIds = visitsData.map(visit => visit.visit_id);
        
        if (visitIds.length === 0) {
          // No visits, so no orders to fetch
          setIsLoading(false);
          return;
        }
        
        // Fetch orders and related data from orders_view
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders_view')
          .select('*')
          .in('visit_id', visitIds)
          .eq('is_deleted', false);
          
        if (ordersError) throw new Error(`Error fetching orders: ${ordersError.message}`);
        
        // Process the orders data
        const ordersByOrderId: Record<string, any[]> = {};
        let totalSalesAmount = 0;
        let currencyUsed = 'INR';
        
        // Group orders by order_id
        ordersData.forEach(order => {
          if (!ordersByOrderId[order.order_id]) {
            ordersByOrderId[order.order_id] = [];
          }
          ordersByOrderId[order.order_id].push(order);
          
          totalSalesAmount += parseFloat(order.amount);
          currencyUsed = order.currency; // Assume all orders use the same currency
        });
        
        // Process for recent orders
        const recentOrdersData: ShopOrder[] = Object.entries(ordersByOrderId)
          .map(([orderId, orders]) => {
            const firstOrderItem = orders[0]; // Use the first item for order metadata
            return {
              order_id: orderId,
              created_at: firstOrderItem.created_at,
              total_amount: orders.reduce((sum, order) => sum + parseFloat(order.amount), 0),
              currency: firstOrderItem.currency,
              sales_officer_name: firstOrderItem.sales_officer_name,
              product_count: orders.length
            };
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5); // Get the most recent 5 orders
        
        setRecentOrders(recentOrdersData);
        setTotalSales(totalSalesAmount);
        setSalesCurrency(currencyUsed);
        
        // Process for top products
        const productSales: Record<string, TopProduct> = {};
        
        ordersData.forEach(order => {
          if (!productSales[order.product_id]) {
            productSales[order.product_id] = {
              product_id: order.product_id,
              product_name: order.product_name,
              quantity: 0,
              amount: 0
            };
          }
          
          productSales[order.product_id].quantity += order.quantity;
          productSales[order.product_id].amount += parseFloat(order.amount);
        });
        
        const topProductsData = Object.values(productSales)
          .sort((a, b) => b.amount - a.amount) // Sort by amount
          .slice(0, 3); // Get top 3
        
        setTopProducts(topProductsData);
        
        // Process for top sales officers
        const salesOfficers: Record<string, TopSalesOfficer> = {};
        
        // Count visits by sales officer
        visitsData.forEach(visit => {
          const matchingOrders = ordersData.filter(order => order.visit_id === visit.visit_id);
          const officerId = matchingOrders[0]?.sales_officers_id;
          const officerName = matchingOrders[0]?.sales_officer_name;
          
          if (officerId && !salesOfficers[officerId]) {
            salesOfficers[officerId] = {
              sales_officers_id: officerId,
              name: officerName || 'Unknown',
              visit_count: 0,
              order_count: 0,
              total_amount: 0
            };
          }
          
          if (officerId) {
            salesOfficers[officerId].visit_count += 1;
          }
        });
        
        // Count orders and amounts by sales officer
        Object.keys(ordersByOrderId).forEach(orderId => {
          const orders = ordersByOrderId[orderId];
          const officerId = orders[0]?.sales_officers_id;
          
          if (officerId && salesOfficers[officerId]) {
            salesOfficers[officerId].order_count += 1;
            
            // Sum up total amount for this order
            const orderTotal = orders.reduce((sum, order) => sum + parseFloat(order.amount), 0);
            salesOfficers[officerId].total_amount += orderTotal;
          }
        });
        
        const topSalesOfficersData = Object.values(salesOfficers)
          .sort((a, b) => b.total_amount - a.total_amount) // Sort by total amount
          .slice(0, 3); // Get top 3
        
        setTopSalesOfficers(topSalesOfficersData);
        
      } catch (err) {
        console.error('Error fetching shop details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load shop details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchShopDetails();
  }, [shopId]);

  const formatGpsLocation = (location: string | null) => {
    if (!location) return '';
    
    try {
      // Expected format is "POINT(longitude latitude)" or just "longitude,latitude"
      if (location.startsWith('POINT')) {
        // Extract coordinates from POINT(long lat) format
        const coordsStr = location.substring(6, location.length - 1);
        const [longitude, latitude] = coordsStr.split(' ').map(Number);
        return `${latitude},${longitude}`;
      } else if (location.includes(',')) {
        // If it's already in a comma-separated format, swap longitude and latitude
        const [longitude, latitude] = location.split(',').map(s => s.trim());
        return `${latitude},${longitude}`;
      }
      return location; // Fallback
    } catch (error) {
      console.error('Error parsing GPS location:', error);
      return location;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-700">Loading shop details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !shopDetails) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/shops" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft size={16} className="mr-2" />
            Back to Shops
          </Link>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start text-red-800">
          <AlertCircle className="h-6 w-6 flex-shrink-0 mr-3" />
          <div>
            <h3 className="text-lg font-medium">Error loading shop</h3>
            <p className="mt-2">{error || 'Shop not found'}</p>
            <Link 
              to="/shops"
              className="mt-4 inline-flex items-center text-red-700 hover:text-red-800 font-medium"
            >
              Return to shops list
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
      {/* Back button */}
      <div className="mb-6">
        <Link to="/shops" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeft size={16} className="mr-2" />
          Back to Shops
        </Link>
      </div>
      
      {/* Shop Header */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6">
        {shopDetails.photo && (
          <div className="h-48 bg-slate-100">
            <img 
              src={shopDetails.photo} 
              alt={shopDetails.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{shopDetails.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {shopDetails.address && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Address</p>
                  <p className="text-slate-600">{shopDetails.address}</p>
                  <div className="flex mt-1 space-x-2">
                    {shopDetails.city && <span className="text-xs text-slate-500">{shopDetails.city}</span>}
                    {shopDetails.state && <span className="text-xs text-slate-500">{shopDetails.state}</span>}
                    {shopDetails.territory && <span className="text-xs text-slate-500">{shopDetails.territory}</span>}
                  </div>
                </div>
              </div>
            )}
            
            {shopDetails.owner_name && (
              <div className="flex items-start">
                <User className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Owner</p>
                  <p className="text-slate-600">{shopDetails.owner_name}</p>
                </div>
              </div>
            )}
            
            {shopDetails.phone_number && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Contact</p>
                  <p className="text-slate-600">{shopDetails.phone_number}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">Created</p>
                <p className="text-slate-600">{new Date(shopDetails.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          {shopDetails.gps_location && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <a 
                href={`https://maps.google.com/?q=${formatGpsLocation(shopDetails.gps_location)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700"
              >
                <MapPin className="h-5 w-5 mr-2" />
                View on Google Maps
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Shop Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Sales Card */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Total Sales</h3>
            <div className="p-2 bg-primary-100 text-primary-700 rounded-md">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {salesCurrency} {totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-slate-500 mt-1">Lifetime value</p>
        </div>
        
        {/* Order Count Card */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Orders</h3>
            <div className="p-2 bg-secondary-100 text-secondary-700 rounded-md">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{recentOrders.length}</p>
          <p className="text-sm text-slate-500 mt-1">Total orders</p>
        </div>
        
        {/* Top Products Preview */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Top Products</h3>
            <div className="p-2 bg-accent-100 text-accent-700 rounded-md">
              <Package size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{topProducts.length}</p>
          <p className="text-sm text-slate-500 mt-1">Best selling products</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Recent Orders</h2>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {recentOrders.map(order => (
                <div key={order.order_id} className="p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-slate-800">Order #{order.order_id.slice(0, 8)}...</h4>
                      <p className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString()} • {order.product_count} product(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-800">
                        {order.currency} {order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 mt-1">
                    <Users size={16} className="mr-1 text-slate-400" />
                    <span>Sales Officer: {order.sales_officer_name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-slate-500">No orders found for this shop</p>
            </div>
          )}
        </div>
        
        {/* Top Products and Sales Officers */}
        <div className="space-y-6">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Top Products</h2>
            </div>
            
            {topProducts.length > 0 ? (
              <div className="p-4">
                {topProducts.map((product, index) => (
                  <div key={product.product_id} className={cn(
                    "flex items-center justify-between py-3",
                    index !== topProducts.length - 1 && "border-b border-slate-100"
                  )}>
                    <div className="flex items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                        index === 1 ? "bg-slate-100 text-slate-700" :
                        "bg-amber-50 text-amber-700"
                      )}>
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-slate-800">{product.product_name}</p>
                        <p className="text-xs text-slate-500">Quantity: {product.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-800">
                        {salesCurrency} {product.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-slate-500">No product data available</p>
              </div>
            )}
          </div>
          
          {/* Top Sales Officers */}
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Top Sales Officers</h2>
            </div>
            
            {topSalesOfficers.length > 0 ? (
              <div className="p-4">
                {topSalesOfficers.map((officer, index) => (
                  <div key={officer.sales_officers_id} className={cn(
                    "flex items-center justify-between py-3",
                    index !== topSalesOfficers.length - 1 && "border-b border-slate-100"
                  )}>
                    <div className="flex items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        index === 0 ? "bg-blue-100 text-blue-700" :
                        index === 1 ? "bg-slate-100 text-slate-700" :
                        "bg-indigo-50 text-indigo-700"
                      )}>
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-slate-800">{officer.name}</p>
                        <p className="text-xs text-slate-500">
                          Visits: {officer.visit_count} • Orders: {officer.order_count}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-800">
                        {salesCurrency} {officer.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-slate-500">No sales officer data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetails;