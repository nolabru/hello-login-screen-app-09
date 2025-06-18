
export interface CompanyLicense {
  available: number;
  total: number;
  used: number;
}

export interface CompanyLicenseRecord {
  id: number;
  company_id: string;
  plan_id: number;
  total_licenses: number;
  used_licenses: number;
  start_date: string;
  expiry_date: string;
  status: string;
  payment_status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface LicensePlan {
  id: number;
  name: string;
  description: string | null;
  max_users: number;
  price_monthly: number;
  price_yearly: number;
  active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AIPrompt {
  id: string;
  name: string;
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}
