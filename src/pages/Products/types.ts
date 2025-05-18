// types.ts
// Contains shared types for the Products module

export interface Product {
  product_id: string;
  name: string;
  category: string | null;
  unit_of_measure: string | null;
  mrp: number;
  pts: number | null;
  ptr: number | null;
  scheme_type: string | null;
  scheme_percentage: number | null;
  net_ptr: number | null;
  retailer_profit_value: number | null;
  gst_percent: number | null;
  currency: string;
  is_active: boolean;
  created_at: string;
  product_scheme_buy_qty: number | null;
  product_scheme_get_qty: number | null;
}

export interface FilterOptions {
  categories: string[];
}

export interface FilterState {
  category: string;
  activeOnly: boolean;
}