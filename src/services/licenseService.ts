
import { supabase } from '@/integrations/supabase/client';

export interface LicensePlan {
  id: number;
  name: string;
  description: string | null;
  max_users: number;
  price_monthly: number;
  price_yearly: number;
  active: boolean;
}

export interface CompanyLicense {
  id: number;
  company_id: number;
  plan_id: number;
  total_licenses: number;
  used_licenses: number;
  start_date: string;
  expiry_date: string;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  plan?: LicensePlan;
}

// Buscar planos de licenças disponíveis
export const fetchLicensePlans = async (): Promise<LicensePlan[]> => {
  const { data, error } = await supabase
    .from('license_plans')
    .select('*')
    .eq('active', true)
    .order('price_monthly', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Buscar licenças da empresa
export const fetchCompanyLicenses = async (companyId: number): Promise<CompanyLicense[]> => {
  const { data, error } = await supabase
    .from('company_licenses')
    .select('*, plan:plan_id(*)')
    .eq('company_id', companyId);

  if (error) throw error;
  return data || [];
};

// Adquirir um novo plano de licenças
export const acquireLicense = async (
  companyId: number, 
  planId: number, 
  totalLicenses: number,
  startDate: Date,
  expiryDate: Date
): Promise<void> => {
  const { error } = await supabase
    .from('company_licenses')
    .insert({
      company_id: companyId,
      plan_id: planId,
      total_licenses: totalLicenses,
      start_date: startDate.toISOString(),
      expiry_date: expiryDate.toISOString(),
    });

  if (error) throw error;
};

// Atualizar status da licença de um funcionário
export const updateEmployeeLicenseStatus = async (
  employeeId: number,
  status: 'active' | 'inactive'
): Promise<void> => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ license_status: status })
    .eq('id', employeeId);

  if (error) throw error;
};

// Verificar disponibilidade de licenças
export const checkLicenseAvailability = async (companyId: number): Promise<{
  available: number;
  total: number;
  used: number;
}> => {
  const { data, error } = await supabase
    .from('company_licenses')
    .select('total_licenses, used_licenses')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Nenhuma licença encontrada
      return { available: 0, total: 0, used: 0 };
    }
    throw error;
  }

  const total = data.total_licenses;
  const used = data.used_licenses || 0;
  return { 
    total, 
    used, 
    available: Math.max(0, total - used) 
  };
};
