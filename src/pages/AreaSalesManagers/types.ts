// types.ts
// Contains shared types for the Area Sales Managers module

export interface AreaSalesManager {
  asm_user_id: string;
  employee_id: string;
  name: string;
  address: string;
  phone_number: string;
  dob: string | null;
  photo: string | null;
  id_type: string;
  id_no: string;
  is_active: boolean;
  created_at: string;
}

export interface FilterOptions {
  // Currently no specific filter options for ASMs
}

export interface FilterState {
  activeOnly: boolean;
}