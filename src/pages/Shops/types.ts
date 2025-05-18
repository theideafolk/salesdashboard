// types.ts
// Contains shared types for the Shops module

export interface Shop {
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
  is_deleted: boolean;
  created_by: string | null;
}

export interface FilterOptions {
  territories: string[];
  cities: string[];
  states: string[];
}

export interface FilterState {
  territory: string;
  city: string;
  state: string;
}