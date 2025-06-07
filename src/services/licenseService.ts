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
  company_id: string; // UUID no formato string
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
export const fetchCompanyLicenses = async (companyId: number | string): Promise<CompanyLicense[]> => {
  try {
    // Converter o ID da empresa para string para compatibilidade com UUID
    const companyIdString = typeof companyId === 'number' ? companyId.toString() : companyId;
    
    console.log('fetchCompanyLicenses - companyId:', companyId, 'tipo:', typeof companyId);
    console.log('fetchCompanyLicenses - companyIdString:', companyIdString);
    
    // Buscar licenças sem a junção automática
    const { data: licensesData, error: licensesError } = await supabase
      .from('company_licenses')
      .select('*')
      .eq('company_id', companyIdString);

    if (licensesError) {
      console.error('Erro na consulta de licenças:', licensesError);
      throw licensesError;
    }
    
    console.log('fetchCompanyLicenses - Licenças encontradas:', licensesData?.length || 0);
    
    if (!licensesData || licensesData.length === 0) {
      console.log('fetchCompanyLicenses - Nenhuma licença encontrada para a empresa');
      return [];
    }

    // Buscar todos os planos de licença
    const { data: plansData, error: plansError } = await supabase
      .from('license_plans')
      .select('*');

    if (plansError) {
      console.error('Erro na consulta de planos:', plansError);
      throw plansError;
    }

    console.log('fetchCompanyLicenses - Planos encontrados:', plansData?.length || 0);

    // Criar um mapa de planos para facilitar a busca
    const plansMap = new Map<number, LicensePlan>();
    if (plansData) {
      plansData.forEach(plan => {
        plansMap.set(plan.id, plan);
      });
    }

    // Combinar licenças com seus planos
    const licensesWithPlans = licensesData.map(license => {
      const plan = plansMap.get(license.plan_id);
      console.log('fetchCompanyLicenses - Processando licença:', license.id, 'plan_id:', license.plan_id, 'plano encontrado:', !!plan);
      return {
        ...license,
        plan: plan || undefined
      };
    });

    console.log('fetchCompanyLicenses - Licenças com planos:', licensesWithPlans.length);
    return licensesWithPlans;
  } catch (error) {
    console.error('Erro ao buscar licenças da empresa:', error);
    throw error;
  }
};

// Adquirir um novo plano de licenças
export const acquireLicense = async (
  companyId: number | string, 
  planId: number, 
  totalLicenses: number,
  startDate: Date,
  expiryDate: Date
): Promise<void> => {
  // Converter o ID da empresa para string para compatibilidade com UUID
  const companyIdString = typeof companyId === 'number' ? companyId.toString() : companyId;
  
  const { error } = await supabase
    .from('company_licenses')
    .insert({
      company_id: companyIdString,
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

// Ativar uma licença pendente
export const activateLicense = async (licenseId: number): Promise<void> => {
  console.log('Ativando licença:', licenseId);
  
  const { error } = await supabase
    .from('company_licenses')
    .update({
      payment_status: 'active'
    })
    .eq('id', licenseId)
    .eq('payment_status', 'pending'); // Apenas ativar licenças pendentes

  if (error) {
    console.error('Erro ao ativar licença:', error);
    throw error;
  }
  
  console.log('Licença ativada com sucesso');
};

// Verificar disponibilidade de licenças
export const checkLicenseAvailability = async (companyId: number | string): Promise<{
  available: number;
  total: number;
  used: number;
  pending: number;
}> => {
  try {
    // Converter o ID da empresa para string para compatibilidade com UUID
    const companyIdString = typeof companyId === 'number' ? companyId.toString() : companyId;
    
    console.log('checkLicenseAvailability - companyId:', companyId, 'tipo:', typeof companyId);
    console.log('checkLicenseAvailability - companyIdString:', companyIdString);
    
    // Buscar todas as licenças ativas da empresa (incluindo pendentes) com seus planos
    const { data, error } = await supabase
      .from('company_licenses')
      .select('id, plan_id, total_licenses, used_licenses, payment_status, status, plan:license_plans(max_users)')
      .eq('company_id', companyIdString)
      .eq('status', 'active');
      // Removido o filtro de payment_status para incluir licenças pendentes

    if (error) {
      console.error('Erro na consulta de licenças:', error);
      throw error;
    }

    console.log('checkLicenseAvailability - Licenças encontradas:', data?.length || 0);
    console.log('checkLicenseAvailability - Dados das licenças:', data);
    
    // Se não houver licenças, retornar zeros
    if (!data || data.length === 0) {
      console.log('checkLicenseAvailability - Nenhuma licença encontrada para a empresa');
      return { available: 0, total: 0, used: 0, pending: 0 };
    }

    // Somar todas as licenças ativas
    let total = 0;
    let used = 0;
    let pending = 0;

    data.forEach(license => {
      console.log('checkLicenseAvailability - Processando licença:', license.id, 'status:', license.status, 'payment_status:', license.payment_status);
      
      // Obter o número de usuários por plano
      const usersPerPlan = license.plan?.max_users || 10; // Valor padrão caso não encontre o plano
      const totalUsersForLicense = license.total_licenses * usersPerPlan;
      
      console.log('checkLicenseAvailability - Plano:', license.plan_id, 'usuários por plano:', usersPerPlan, 'quantidade de planos:', license.total_licenses, 'total de usuários:', totalUsersForLicense);
      
      // Contar todas as licenças ativas, independente do status de pagamento
      total += totalUsersForLicense;
      used += license.used_licenses || 0;
      
      // Marcar licenças pendentes para exibição separada
      if (license.payment_status === 'pending') {
        pending += totalUsersForLicense;
        console.log('checkLicenseAvailability - Licença pendente:', license.id, 'total de usuários:', totalUsersForLicense);
      } else {
        console.log('checkLicenseAvailability - Licença válida:', license.id, 'total de usuários:', totalUsersForLicense, 'used:', license.used_licenses);
      }
    });

    const result = {
      total,
      used,
      available: Math.max(0, total - used),
      pending
    };
    
    console.log('checkLicenseAvailability - Resultado final:', result);
    return result;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade de licenças:', error);
    return { available: 0, total: 0, used: 0, pending: 0 };
  }
};

// Atualizar status da licença de um funcionário
// Nota: Esta função está comentada porque a coluna license_status não existe na tabela user_profiles
// Quando for necessário implementar esta funcionalidade, será preciso criar uma tabela separada
// para rastrear a relação entre funcionários e licenças
/*
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
*/

// Função para atualizar o status da licença de um funcionário
export const updateEmployeeLicenseStatus = async (
  employeeId: number,
  status: 'active' | 'inactive',
  companyId?: string
): Promise<void> => {
  try {
    if (status === 'active' && !companyId) {
      throw new Error('companyId é obrigatório para ativar uma licença');
    }

    // Obter o company_id atual do funcionário
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', employeeId)
      .single();

    if (userError) throw userError;

    const currentCompanyId = userData?.company_id;

    // Atualizar o contador de licenças usadas
    if (status === 'active') {
      // Incrementar o contador de licenças usadas
      await incrementLicenseUsage(companyId!);
      
      // Atualizar o status do funcionário
      await supabase
        .from('user_profiles')
        .update({ 
          employee_status: 'active',
          company_id: companyId 
        })
        .eq('id', employeeId);
    } else {
      // Decrementar o contador de licenças usadas
      if (currentCompanyId) {
        await decrementLicenseUsage(currentCompanyId);
      }
      
      // Atualizar o status do funcionário
      await supabase
        .from('user_profiles')
        .update({ 
          employee_status: 'pending',
          company_id: null 
        })
        .eq('id', employeeId);
    }
  } catch (error) {
    console.error('Erro ao atualizar status da licença:', error);
    throw error;
  }
};

// Função auxiliar para incrementar o contador de licenças usadas
const incrementLicenseUsage = async (companyId: string): Promise<void> => {
  try {
    console.log('Incrementando uso de licença para a empresa:', companyId);
    
    // Buscar a licença ativa mais recente da empresa
    const { data, error } = await supabase
      .from('company_licenses')
      .select('id, used_licenses')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) {
      console.log('Nenhuma licença ativa encontrada para a empresa:', companyId);
      return;
    }

    // Incrementar o contador
    const licenseId = data[0].id;
    const currentUsage = data[0].used_licenses || 0;
    const newUsage = currentUsage + 1;
    
    console.log(`Atualizando licença ${licenseId}: used_licenses ${currentUsage} -> ${newUsage}`);

    const { error: updateError } = await supabase
      .from('company_licenses')
      .update({ used_licenses: newUsage })
      .eq('id', licenseId);
      
    if (updateError) throw updateError;
    
    console.log('Uso de licença incrementado com sucesso');
  } catch (error) {
    console.error('Erro ao incrementar uso de licença:', error);
    throw error;
  }
};

// Função auxiliar para decrementar o contador de licenças usadas
const decrementLicenseUsage = async (companyId: string): Promise<void> => {
  try {
    console.log('Decrementando uso de licença para a empresa:', companyId);
    
    // Buscar a licença ativa mais recente da empresa
    const { data, error } = await supabase
      .from('company_licenses')
      .select('id, used_licenses')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) {
      console.log('Nenhuma licença ativa encontrada para a empresa:', companyId);
      return;
    }

    // Decrementar o contador (garantindo que não fique negativo)
    const licenseId = data[0].id;
    const currentUsage = data[0].used_licenses || 0;
    const newUsage = Math.max(0, currentUsage - 1);
    
    console.log(`Atualizando licença ${licenseId}: used_licenses ${currentUsage} -> ${newUsage}`);

    const { error: updateError } = await supabase
      .from('company_licenses')
      .update({ used_licenses: newUsage })
      .eq('id', licenseId);
      
    if (updateError) throw updateError;
    
    console.log('Uso de licença decrementado com sucesso');
  } catch (error) {
    console.error('Erro ao decrementar uso de licença:', error);
    throw error;
  }
};

// Nova função: Buscar usuários com licenças ativas de um plano específico
export const fetchUsersWithLicense = async (
  companyId: number | string, 
  licenseId: number
): Promise<{id: number, nome: string, email: string, status: boolean, connection_status: string, phone?: string}[]> => {
  try {
    console.log('fetchUsersWithLicense - companyId:', companyId, 'tipo:', typeof companyId);
    console.log('fetchUsersWithLicense - licenseId:', licenseId);
    
    // Versão simplificada para depuração
    return [];
  } catch (error) {
    console.error('Erro ao buscar usuários com licença:', error);
    return [];
  }
};

// Função para atualizar o contador de licenças com base nos funcionários existentes
export const updateLicenseCountForExistingEmployees = async (companyId: string): Promise<void> => {
  try {
    console.log('Atualizando contador de licenças para funcionários existentes da empresa:', companyId);
    
    // Buscar todos os funcionários ativos da empresa
    const { data: employees, error: employeesError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('company_id', companyId)
      .eq('employee_status', 'active');
    
    if (employeesError) {
      console.error('Erro ao buscar funcionários:', employeesError);
      throw employeesError;
    }
    
    // Contar o número total de funcionários ativos
    const activeCount = employees?.length || 0;
    console.log(`Encontrados ${activeCount} funcionários ativos para a empresa ${companyId}`);
    
    // Buscar a licença ativa mais recente da empresa
    const { data: licenses, error: licensesError } = await supabase
      .from('company_licenses')
      .select('id, used_licenses')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (licensesError) {
      console.error('Erro ao buscar licenças:', licensesError);
      throw licensesError;
    }
    
    if (!licenses || licenses.length === 0) {
      console.log('Nenhuma licença ativa encontrada para a empresa:', companyId);
      return;
    }
    
    const licenseId = licenses[0].id;
    const currentUsage = licenses[0].used_licenses || 0;
    
    console.log(`Atualizando licença ${licenseId}: used_licenses ${currentUsage} -> ${activeCount}`);
    
    // Atualizar o contador de licenças usadas
    const { error: updateError } = await supabase
      .from('company_licenses')
      .update({ used_licenses: activeCount })
      .eq('id', licenseId);
    
    if (updateError) {
      console.error('Erro ao atualizar contador de licenças:', updateError);
      throw updateError;
    }
    
    console.log('Contador de licenças atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar contador de licenças:', error);
    throw error;
  }
};
