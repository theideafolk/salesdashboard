// types.ts
// Contains shared types for the Orders module

export interface OrderProduct {
  product_id: string;
  product_name: string;
  quantity: number;
  amount: number;
  free_qty?: number;
}

export interface Order {
  order_id: string;
  visit_id: string;
  created_at: string;
  currency: string;
  sales_officers_id: string;
  sales_officer_name: string;
  shop_name: string;
  area_sales_manager_id: string | null;
  area_sales_manager_name: string | null;
  total_amount: number;
  products: OrderProduct[];
}

export interface FilterOptions {
  salesOfficers: { id: string; name: string }[];
  areaManagers: { id: string; name: string }[];
}

export interface FilterState {
  salesOfficer: string;
  areaManager: string;
}