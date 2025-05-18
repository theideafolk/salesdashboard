// Pagination.tsx
// Component for paginating through orders

import React from 'react';
import { cn } from '../../../utils/cn';

interface PaginationProps {
  currentPage: number;
  totalOrders: number;
  ordersPerPage: number;
  onPageChange: (page: number) => void;
  ordersLength: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage,
  totalOrders,
  ordersPerPage,
  onPageChange,
  ordersLength
}) => {
  const maxPage = Math.ceil(totalOrders / ordersPerPage);
  
  // Calculate actual values for display
  const startNumber = totalOrders === 0 ? 0 : (currentPage - 1) * ordersPerPage + 1;
  const endNumber = Math.min((currentPage - 1) * ordersPerPage + ordersLength, totalOrders);
  
  return (
    <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
      <div className="text-sm text-slate-600">
        {totalOrders === 0 ? (
          "No orders found"
        ) : (
          `Showing ${startNumber} to ${endNumber} of ${totalOrders} order${totalOrders !== 1 ? 's' : ''}`
        )}
      </div>
      
      {maxPage > 1 && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "p-2 rounded-md",
              currentPage === 1 
                ? "text-slate-400 cursor-not-allowed" 
                : "text-slate-700 hover:bg-slate-100"
            )}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, maxPage) }, (_, i) => {
            // Logic to show pages around current page
            let pageNum = i + 1;
            
            if (maxPage > 5) {
              if (currentPage > 3 && currentPage < maxPage - 1) {
                pageNum = currentPage - 2 + i;
              } else if (currentPage >= maxPage - 1) {
                pageNum = maxPage - 4 + i;
              }
            }
            
            if (pageNum <= maxPage) {
              return (
                <button
                  key={i}
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "w-8 h-8 rounded-md",
                    currentPage === pageNum
                      ? "bg-primary-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {pageNum}
                </button>
              );
            }
            return null;
          })}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === maxPage}
            className={cn(
              "p-2 rounded-md",
              currentPage === maxPage
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-700 hover:bg-slate-100"
            )}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;