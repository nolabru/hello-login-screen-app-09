
export type Company = {
  id: number;
  name: string;
  contact_email: string;
  status: boolean;
  connection_status: string;
  created_at?: string;
};

export type CompanySearchResult = {
  id: number;
  name: string;
  contact_email: string;
  status: boolean;
};

export type CompanyDetail = {
  id: number;
  name: string;
  contact_email: string;
  status: boolean;
  connection_status: string;
  created_at?: string;
  updated_at?: string;
};
