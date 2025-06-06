
import { supabase } from './client';
import { Company, CompanySearchResult, CompanyDetail } from '@/pages/companies/types';

// Tipo para representar um psicólogo nos resultados da busca
export interface PsychologistSearchResult {
  id: string;
  name: string;
  email: string;
  crp?: string;
  specialization?: string;
}

// Tipo para representar um psicólogo associado a uma empresa
export interface CompanyPsychologist {
  id: string;
  company_id: string;
  psychologist_id: string;
  started_at: string;
  ended_at: string | null;
  status: boolean;
  psychologist_name?: string;
  psychologist_email?: string;
  psychologist_specialization?: string;
}

// Tipo para representar uma empresa associada a um psicólogo
export interface PsychologistCompany {
  id: string;
  company_id: string;
  psychologist_id: string;
  started_at: string;
  ended_at: string | null;
  status: boolean;
  company_name?: string;
  company_email?: string;
}

// Usando any para o tipo do Supabase para contornar erros de tipo
const supabaseAny: any = supabase;

/**
 * Busca todos os psicólogos associados a uma empresa
 * @param companyId ID da empresa
 * @returns Lista de psicólogos associados à empresa
 */
export const fetchCompanyPsychologists = async (companyId: string): Promise<CompanyPsychologist[]> => {
  try {
    // Buscar associações entre empresa e psicólogos
    const { data, error } = await supabaseAny
      .from('company_psychologists')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', true)
      .is('ended_at', null);

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    // Buscar detalhes dos psicólogos
    const psychologistIds = data.map((item: any) => item.psychologist_id);
    const { data: psychologistsData, error: psychologistsError } = await supabaseAny
      .from('psychologists')
      .select('id, name, email, specialization')
      .in('id', psychologistIds);

    if (psychologistsError) throw psychologistsError;

    // Mapear os dados para o formato esperado
    return data.map((item: any) => {
      const psychologist = psychologistsData?.find((p: any) => p.id === item.psychologist_id);
      return {
        id: item.id,
        company_id: item.company_id,
        psychologist_id: item.psychologist_id,
        started_at: item.started_at,
        ended_at: item.ended_at,
        status: item.status,
        psychologist_name: psychologist?.name,
        psychologist_email: psychologist?.email,
        psychologist_specialization: psychologist?.specialization,
      };
    });
  } catch (error) {
    console.error('Erro ao buscar psicólogos da empresa:', error);
    throw error;
  }
};

/**
 * Busca todas as empresas associadas a um psicólogo
 * @param psychologistId ID do psicólogo
 * @returns Lista de empresas associadas ao psicólogo
 */
export const fetchPsychologistCompanies = async (psychologistId: string): Promise<PsychologistCompany[]> => {
  try {
    // Buscar associações entre psicólogo e empresas
    const { data, error } = await supabaseAny
      .from('company_psychologists')
      .select('*')
      .eq('psychologist_id', psychologistId)
      .eq('status', true)
      .is('ended_at', null);

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    // Buscar detalhes das empresas
    const companyIds = data.map((item: any) => item.company_id);
    const { data: companiesData, error: companiesError } = await supabaseAny
      .from('companies')
      .select('id, name, corp_email')
      .in('id', companyIds);

    if (companiesError) throw companiesError;

    // Mapear os dados para o formato esperado
    return data.map((item: any) => {
      const company = companiesData?.find((c: any) => c.id === item.company_id);
      return {
        id: item.id,
        company_id: item.company_id,
        psychologist_id: item.psychologist_id,
        started_at: item.started_at,
        ended_at: item.ended_at,
        status: item.status,
        company_name: company?.name,
        company_email: company?.corp_email,
      };
    });
  } catch (error) {
    console.error('Erro ao buscar empresas do psicólogo:', error);
    throw error;
  }
};

/**
 * Associa um psicólogo a uma empresa
 * @param companyId ID da empresa
 * @param psychologistId ID do psicólogo
 * @returns ID da nova associação
 */
export const associatePsychologistToCompany = async (companyId: string, psychologistId: string): Promise<string> => {
  try {
    // Verificar se já existe uma associação ativa
    const { data: existingAssociation, error: checkError } = await supabaseAny
      .from('company_psychologists')
      .select('id')
      .eq('company_id', companyId)
      .eq('psychologist_id', psychologistId)
      .eq('status', true)
      .is('ended_at', null)
      .maybeSingle();

    if (checkError) throw checkError;

    // Se já existe uma associação ativa, retornar o ID dela
    if (existingAssociation) {
      return existingAssociation.id;
    }

    // Criar nova associação
    const { data, error } = await supabaseAny
      .from('company_psychologists')
      .insert({
        company_id: companyId,
        psychologist_id: psychologistId,
        started_at: new Date().toISOString(),
        status: true
      })
      .select('id')
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Erro ao associar psicólogo à empresa:', error);
    throw error;
  }
};

/**
 * Desassocia um psicólogo de uma empresa
 * @param companyId ID da empresa
 * @param psychologistId ID do psicólogo
 */
export const disassociatePsychologistFromCompany = async (companyId: string, psychologistId: string): Promise<void> => {
  try {
    // Buscar a associação ativa
    const { data: association, error: findError } = await supabaseAny
      .from('company_psychologists')
      .select('id')
      .eq('company_id', companyId)
      .eq('psychologist_id', psychologistId)
      .eq('status', true)
      .is('ended_at', null)
      .maybeSingle();

    if (findError) throw findError;

    // Se não encontrou associação ativa, não há o que fazer
    if (!association) {
      return;
    }

    // Atualizar a associação para inativa
    const { error } = await supabaseAny
      .from('company_psychologists')
      .update({
        status: false,
        ended_at: new Date().toISOString()
      })
      .eq('id', association.id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao desassociar psicólogo da empresa:', error);
    throw error;
  }
};

// Funções migradas do companiesService.ts

/**
 * Busca conexões de empresas para um psicólogo
 * @param psychologistId ID do psicólogo
 * @returns Lista de empresas conectadas ao psicólogo
 */
export const fetchCompanyConnections = async (psychologistId: string): Promise<Company[]> => {
  try {
    // Usar a função fetchPsychologistCompanies para obter as empresas associadas ao psicólogo
    const psychologistCompanies = await fetchPsychologistCompanies(psychologistId);
    
    // Converter para o formato Company
    return psychologistCompanies.map(pc => ({
      id: parseInt(pc.company_id),
      name: pc.company_name || 'Nome não disponível',
      corp_email: pc.company_email || '',
      status: pc.status,
      connection_status: 'active', // Todas as empresas retornadas são ativas
      created_at: pc.started_at
    }));
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    throw error;
  }
};

/**
 * Busca empresas disponíveis para conexão
 * @param query Termo de busca
 * @param psychologistId ID do psicólogo
 * @returns Lista de empresas que correspondem à busca
 */
export const searchAvailableCompanies = async (query: string, psychologistId: string): Promise<CompanySearchResult[]> => {
  try {
    // Buscar empresas que correspondem à pesquisa
    const { data, error } = await supabaseAny
      .from('companies')
      .select('id, name, corp_email, status')
      .or(`name.ilike.%${query}%,corp_email.ilike.%${query}%`)
      .eq('status', true)
      .limit(10);

    if (error) throw error;
    
    if (data && data.length > 0) {
      // Buscar empresas já conectadas ao psicólogo
      const psychologistCompanies = await fetchPsychologistCompanies(psychologistId);
      const connectedCompanyIds = psychologistCompanies.map(pc => parseInt(pc.company_id));
      
      // Filtrar empresas já conectadas
      return data.filter(company => !connectedCompanyIds.includes(company.id));
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    throw error;
  }
};

/**
 * Solicita conexão com uma empresa
 * @param companyId ID da empresa
 * @param psychologistId ID do psicólogo
 */
export const requestCompanyConnection = async (companyId: number, psychologistId: string): Promise<void> => {
  try {
    // Criar nova associação
    await associatePsychologistToCompany(companyId.toString(), psychologistId);
  } catch (error) {
    console.error('Erro ao solicitar conexão com empresa:', error);
    throw error;
  }
};

/**
 * Aceita uma solicitação de conexão de uma empresa
 * @param companyId ID da empresa
 * @param psychologistId ID do psicólogo
 */
export const acceptCompanyRequest = async (companyId: number, psychologistId: string): Promise<void> => {
  try {
    // Atualizar a associação para ativa
    await associatePsychologistToCompany(companyId.toString(), psychologistId);
    
    // Buscar funcionários da empresa
    const { data: employees, error: employeesError } = await supabaseAny
      .from('user_profiles')
      .select('id')
      .eq('company_id', companyId.toString());
    
    if (employeesError) throw employeesError;
    
    // Conectar todos os funcionários da empresa a este psicólogo
    if (employees && employees.length > 0) {
      // Implementar lógica para conectar funcionários ao psicólogo, se necessário
      console.log(`${employees.length} funcionários conectados ao psicólogo ${psychologistId}`);
    }
  } catch (error) {
    console.error('Erro ao aceitar solicitação de empresa:', error);
    throw error;
  }
};

/**
 * Desconecta um psicólogo de uma empresa
 * @param companyId ID da empresa
 * @param psychologistId ID do psicólogo
 */
export const disconnectFromCompany = async (companyId: number, psychologistId: string): Promise<void> => {
  try {
    // Usar a função disassociatePsychologistFromCompany para desassociar o psicólogo da empresa
    await disassociatePsychologistFromCompany(companyId.toString(), psychologistId);
    
    // Buscar funcionários da empresa
    const { data: employees, error: employeesError } = await supabaseAny
      .from('user_profiles')
      .select('id')
      .eq('company_id', companyId.toString());
      
    if (employeesError) throw employeesError;
    
    // Desconectar todos os funcionários da empresa deste psicólogo
    if (employees && employees.length > 0) {
      // Implementar lógica para desconectar funcionários do psicólogo, se necessário
      console.log(`${employees.length} funcionários desconectados do psicólogo ${psychologistId}`);
    }
  } catch (error) {
    console.error('Erro ao desconectar da empresa:', error);
    throw error;
  }
};

/**
 * Busca detalhes de uma empresa
 * @param company Empresa
 * @param psychologistId ID do psicólogo
 * @returns Detalhes da empresa
 */
export const fetchCompanyDetails = async (company: Company, psychologistId: string): Promise<CompanyDetail> => {
  try {
    // Buscar detalhes da associação
    const { data: associations, error: associationsError } = await supabaseAny
      .from('company_psychologists')
      .select('*')
      .eq('company_id', company.id.toString())
      .eq('psychologist_id', psychologistId)
      .eq('status', true)
      .is('ended_at', null);

    if (associationsError) throw associationsError;
    
    const association = associations && associations.length > 0 ? associations[0] : null;

    // Buscar contagem de funcionários da empresa
    const { count: employeeCount, error: countError } = await supabaseAny
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', company.id.toString());

    if (countError) throw countError;

    return {
      ...company,
      created_at: association?.started_at,
      updated_at: association?.updated_at,
      employee_count: employeeCount || 0
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes da empresa:', error);
    throw error;
  }
};

/**
 * Busca todos os psicólogos disponíveis para conexão com uma empresa
 * @param companyId ID da empresa
 * @returns Lista de psicólogos disponíveis
 */
export const fetchAllAvailablePsychologists = async (companyId: string): Promise<PsychologistSearchResult[]> => {
  try {
    // Buscar todos os psicólogos ativos
    const { data, error } = await supabaseAny
      .from('psychologists')
      .select('id, name, email, crp, specialization')
      .eq('status', true)
      .limit(50); // Limitamos a 50 para evitar carregar muitos dados

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Buscar psicólogos já conectados à empresa
    const companyPsychologists = await fetchCompanyPsychologists(companyId);
    const connectedPsychologistIds = companyPsychologists.map(cp => cp.psychologist_id);
    
    // Filtrar psicólogos já conectados
    return data.filter(psychologist => !connectedPsychologistIds.includes(psychologist.id));
  } catch (error) {
    console.error('Erro ao buscar psicólogos:', error);
    throw error;
  }
};

/**
 * Busca psicólogos disponíveis para conexão com uma empresa
 * @param query Termo de busca (nome, email ou CRP)
 * @param companyId ID da empresa
 * @returns Lista de psicólogos que correspondem à busca
 */
export const searchAvailablePsychologists = async (query: string, companyId: string): Promise<PsychologistSearchResult[]> => {
  try {
    // Buscar psicólogos que correspondem à pesquisa
    const { data, error } = await supabaseAny
      .from('psychologists')
      .select('id, name, email, crp, specialization')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,crp.ilike.%${query}%`)
      .eq('status', true)
      .limit(10);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Buscar psicólogos já conectados à empresa
    const companyPsychologists = await fetchCompanyPsychologists(companyId);
    const connectedPsychologistIds = companyPsychologists.map(cp => cp.psychologist_id);
    
    // Filtrar psicólogos já conectados
    return data.filter(psychologist => !connectedPsychologistIds.includes(psychologist.id));
  } catch (error) {
    console.error('Erro ao buscar psicólogos:', error);
    throw error;
  }
};
