// types.ts
// Contains shared types for the Schemes module

export interface Scheme {
  scheme_id: number;
  scheme_text: string;
  scheme_min_price: number | null;
  scheme_scope: 'product' | 'order';
  created_at: string;
  is_active: boolean;
}

export interface FilterOptions {
  scopes: string[];
}

export interface FilterState {
  scope: string;
  activeOnly: boolean;
}