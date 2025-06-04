import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/pages/companies/types';

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
      used_licenses: 0, // Iniciar com zero licenças usadas
      start_date: startDate.toISOString(),
      expiry_date: expiryDate.toISOString(),
      status: 'active',
      payment_status: 'pending' // Definir como pending por padrão ao adquirir
    });

  if (error) throw error;
};

// Cancelar uma licença pendente
export const cancelLicense = async (licenseId: number): Promise<void> => {
  const { error } = await supabase
    .from('company_licenses')
    .update({
      status: 'canceled',
      payment_status: 'canceled'
    })
    .eq('id', licenseId)
    .eq('payment_status', 'pending'); // Apenas cancelar licenças pendentes

  if (error) throw error;
};

// Verificar disponibilidade de licenças
export const checkLicenseAvailability = async (companyId: number): Promise<{
  available: number;
  total: number;
  used: number;
}> => {
  try {
    // Buscar todas as licenças ativas da empresa
    const { data, error } = await supabase
      .from('company_licenses')
      .select('total_licenses, used_licenses, payment_status, status')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .or('payment_status.eq.active,payment_status.eq.completed');

    if (error) throw error;

    // Se não houver licenças, retornar zeros
    if (!data || data.length === 0) {
      return { available: 0, total: 0, used: 0 };
    }

    // Somar todas as licenças ativas e pagas
    let total = 0;
    let used = 0;

    data.forEach(license => {
      // Considerar apenas licenças com pagamento concluído ou ativo
      if (license.payment_status === 'active' || license.payment_status === 'completed') {
        total += license.total_licenses;
        used += license.used_licenses || 0;
      }
    });

    return {
      total,
      used,
      available: Math.max(0, total - used)
    };
  } catch (error) {
    console.error('Erro ao verificar disponibilidade de licenças:', error);
    return { available: 0, total: 0, used: 0 };
  }
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

// Nova função: Buscar usuários com licenças ativas de um plano específico
export const fetchUsersWithLicense = async (
  companyId: number, 
  licenseId: number
): Promise<Employee[]> => {
  try {
  // Buscar usuários da empresa com status de licença 'active'
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, name, email, phone, status, license_status')
      .eq('id_empresa', companyId)
      .eq('license_status', 'active');
      
    if (error) throw error;
    
    return data.map(user => ({
      id: user.id,
      nome: user.name, // Mantendo 'nome' na interface Employee, mas usando 'name' do banco
      email: user.email,
      status: user.status,
      connection_status: user.license_status || 'inactive',
      phone: user.phone || undefined,
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar usuários com licença:', error);
    return [];
  }
};
