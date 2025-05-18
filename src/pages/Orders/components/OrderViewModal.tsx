// OrderViewModal.tsx
// Component for displaying detailed order information in a modal

import React from 'react';
import { Order } from '../types';

interface OrderViewModalProps {
  order: Order;
  onClose: () => void;
}

const OrderViewModal: React.FC<OrderViewModalProps> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Order Details
                </h3>
                
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Order ID</p>
                      <p className="mt-1 text-sm text-gray-900">{order.order_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sales Officer</p>
                      <p className="mt-1 text-sm text-gray-900">{order.sales_officer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Shop</p>
                      <p className="mt-1 text-sm text-gray-900">{order.shop_name}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Area Manager</p>
                      <p className="mt-1 text-sm text-gray-900">{order.area_sales_manager_name || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Products</h4>
                    <div className="mt-1 bg-gray-50 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qty
                            </th>
                            <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {order.products.map((product) => (
                            <tr key={product.product_id}>
                              <td className="px-3 py-2 text-xs text-gray-900 break-words">
                                {product.product_name}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-900 text-center">
                                {product.quantity}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-900 text-right">
                                {order.currency} {(product.amount / product.quantity).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-900 text-right">
                                {order.currency} {product.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                          
                          {/* Free items if any */}
                          {order.products.some(p => p.free_qty && p.free_qty > 0) && (
                            <>
                              <tr className="bg-gray-50">
                                <td colSpan={4} className="px-3 py-1 text-xs font-medium text-gray-700">
                                  Free Items
                                </td>
                              </tr>
                              {order.products
                                .filter(p => p.free_qty && p.free_qty > 0)
                                .map(product => (
                                  <tr key={`free-${product.product_id}`} className="bg-gray-50">
                                    <td className="px-3 py-2 text-xs text-gray-900 break-words">
                                      {product.product_name}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-900 text-center">
                                      {product.free_qty}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-500 text-right">
                                      Free
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-500 text-right">
                                      -
                                    </td>
                                  </tr>
                                ))
                              }
                            </>
                          )}
                          
                          {/* Total row */}
                          <tr className="bg-gray-100">
                            <td colSpan={3} className="px-3 py-2 text-xs font-medium text-gray-700 text-right">
                              Total Amount:
                            </td>
                            <td className="px-3 py-2 text-xs font-medium text-gray-900 text-right">
                              {order.currency} {order.total_amount.toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewModal;