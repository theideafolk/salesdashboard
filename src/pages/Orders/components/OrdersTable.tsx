// OrdersTable.tsx
// Component for displaying the orders in a table format

import React, { useState } from 'react';
import { ArrowUpDown, Eye, Trash2 } from 'lucide-react';
import { Order } from '../types';
import { cn } from '../../../utils/cn';

interface OrdersTableProps {
  isLoading: boolean;
  orders: Order[];
  handleSort: (column: string) => void;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  openViewModal: (order: Order) => void;
  deleteOrder: (orderId: string) => Promise<void>;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  isLoading,
  orders,
  handleSort,
  sortColumn,
  sortDirection,
  openViewModal,
  deleteOrder
}) => {
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  
  const handleDelete = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      setDeletingOrderId(orderId);
      try {
        await deleteOrder(orderId);
      } finally {
        setDeletingOrderId(null);
      }
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('order_id')}
            >
              <div className="flex items-center">
                <span>Order ID</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('total_amount')}
            >
              <div className="flex items-center">
                <span>Total Amount</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('sales_officer_name')}
            >
              <div className="flex items-center">
                <span>Sales Officer</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('shop_name')}
            >
              <div className="flex items-center">
                <span>Shop</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('area_sales_manager_name')}
            >
              <div className="flex items-center">
                <span>Area Manager</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center">
                <span>Date</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-slate-500">Loading orders...</p>
                </div>
              </td>
            </tr>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.order_id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium">{order.order_id.slice(0, 8)}...</td>
                <td className="px-4 py-3 text-sm">
                  {order.currency} {order.total_amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
                <td className="px-4 py-3 text-sm">{order.sales_officer_name}</td>
                <td className="px-4 py-3 text-sm">{order.shop_name}</td>
                <td className="px-4 py-3 text-sm">{order.area_sales_manager_name || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openViewModal(order)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                      title="View Order Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(order.order_id)}
                      disabled={deletingOrderId === order.order_id}
                      className={cn(
                        "text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50",
                        deletingOrderId === order.order_id && "opacity-50 cursor-not-allowed"
                      )}
                      title="Delete Order"
                    >
                      {deletingOrderId === order.order_id ? (
                        <div className="w-4 h-4 border-t-2 border-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center">
                <p className="text-slate-500">No orders found</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;