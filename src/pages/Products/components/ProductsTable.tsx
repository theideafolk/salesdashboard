// ProductsTable.tsx
// Component for displaying the products in a table format

import React, { useState } from 'react';
import { ArrowUpDown, Eye, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { cn } from '../../../utils/cn';

interface ProductsTableProps {
  isLoading: boolean;
  products: Product[];
  handleSort: (column: string) => void;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  openViewModal: (product: Product) => void;
  deleteProduct: (productId: string) => Promise<void>;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  isLoading,
  products,
  handleSort,
  sortColumn,
  sortDirection,
  openViewModal,
  deleteProduct
}) => {
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  
  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      setDeletingProductId(productId);
      try {
        await deleteProduct(productId);
      } finally {
        setDeletingProductId(null);
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
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                <span>Product Name</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center">
                <span>Category</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('mrp')}
            >
              <div className="flex items-center">
                <span>MRP</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600"
            >
              Scheme
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center">
                <span>Created</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-slate-500">Loading products...</p>
                </div>
              </td>
            </tr>
          ) : products.length > 0 ? (
            products.map((product) => (
              <tr key={product.product_id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                <td className="px-4 py-3 text-sm">{product.category || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  {product.currency} {product.mrp.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
                <td className="px-4 py-3 text-sm">
                  {product.scheme_type ? (
                    <div>
                      <span className="font-medium">{product.scheme_type}</span>
                      {product.scheme_percentage && (
                        <span className="ml-1 text-slate-500">
                          ({product.scheme_percentage}%)
                        </span>
                      )}
                      {product.product_scheme_buy_qty && product.product_scheme_get_qty && (
                        <span className="text-slate-500">
                          {` (Buy ${product.product_scheme_buy_qty} Get ${product.product_scheme_get_qty})`}
                        </span>
                      )}
                    </div>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(product.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    product.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openViewModal(product)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                      title="View Product Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.product_id)}
                      disabled={deletingProductId === product.product_id}
                      className={cn(
                        "text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50",
                        deletingProductId === product.product_id && "opacity-50 cursor-not-allowed"
                      )}
                      title="Delete Product"
                    >
                      {deletingProductId === product.product_id ? (
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
                <p className="text-slate-500">No products found</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable