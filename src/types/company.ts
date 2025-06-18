
export interface Company {
  id: string;
  cnpj: string;
  legal_name: string;
  email: string | null;
  updated_at: string | null;
  name: string;
  created_at: string | null;
  corp_email: string;
  phone: string | null;
  status: boolean;
  user_id: string | null;
}

// Interface para compatibilidade com código existente (DEPRECATED)
export interface CompanyLegacy {
  id: string;
  name: string;
}
