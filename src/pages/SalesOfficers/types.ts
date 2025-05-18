// types.ts
// Contains shared types for the Sales Officers module

export interface SalesOfficer {
  sales_officers_id: string;
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
  reporting_manager_id: string | null;
  reporting_manager_name?: string;
}

export interface FilterOptions {
  reportingManagers: { id: string; name: string }[];
}

export interface FilterState {
  reportingManager: string;
  activeOnly: boolean;
}