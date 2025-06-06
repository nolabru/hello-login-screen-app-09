
export type Company = {
  id: number;
  name: string;
  corp_email: string;
  status: boolean;
  connection_status: string;
  created_at?: string;
};

export type CompanySearchResult = {
  id: number;
  name: string;
  corp_email: string;
  status: boolean;
};

export type CompanyDetail = {
  id: number;
  name: string;
  corp_email: string;
  status: boolean;
  connection_status: string;
  created_at?: string;
  updated_at?: string;
  employee_count?: number;
};

export type Employee = {
  id: number;
  nome: string;
  email: string;
  status: boolean;
  connection_status: string;
  phone?: string;
  cpf?: string;
  senha?: string;
};
