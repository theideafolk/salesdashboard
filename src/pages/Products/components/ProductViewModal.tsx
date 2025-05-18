// ProductViewModal.tsx
// Component for displaying detailed product information in a modal

import React from 'react';
import { Product } from '../types';

interface ProductViewModalProps {
  product: Product;
  onClose: () => void;
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({ product, onClose }) => {
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
                  Product Details
                </h3>
                
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Product Name</p>
                      <p className="mt-1 text-sm text-gray-900">{product.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <p className="mt-1 text-sm text-gray-900">{product.category || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">MRP</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.currency} {product.mrp.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">PTS</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.pts ? `${product.currency} ${product.pts.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">PTR</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.ptr ? `${product.currency} ${product.ptr.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}` : '-'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Scheme Information */}
                  {(product.scheme_type || product.scheme_percentage || product.product_scheme_buy_qty) && (
                    <div className="mb-4 p-4 bg-primary-50 rounded-lg">
                      <h4 className="text-sm font-medium text-primary-900 mb-2">Scheme Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {product.scheme_type && (
                          <div>
                            <p className="text-xs font-medium text-primary-700">Type</p>
                            <p className="text-sm text-primary-900">{product.scheme_type}</p>
                          </div>
                        )}
                        {product.scheme_percentage && (
                          <div>
                            <p className="text-xs font-medium text-primary-700">Percentage</p>
                            <p className="text-sm text-primary-900">{product.scheme_percentage}%</p>
                          </div>
                        )}
                        {product.product_scheme_buy_qty && product.product_scheme_get_qty && (
                          <div className="col-span-2">
                            <p className="text-xs font-medium text-primary-700">Buy/Get Offer</p>
                            <p className="text-sm text-primary-900">
                              Buy {product.product_scheme_buy_qty} Get {product.product_scheme_get_qty}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Additional Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Net PTR</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.net_ptr ? `${product.currency} ${product.net_ptr.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Retailer Profit</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.retailer_profit_value ? `${product.currency} ${product.retailer_profit_value.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">GST</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.gst_percent ? `${product.gst_percent}%` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Unit</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.unit_of_measure || '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1 text-sm">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            product.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(product.created_at).toLocaleDateString()}
                        </p>
                      </div>
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
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal