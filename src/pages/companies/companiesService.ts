
import { supabase } from '@/integrations/supabase/client';
import { Company, CompanySearchResult } from './types';

export const fetchCompanyConnections = async (psychologistId: string): Promise<Company[]> => {
  try {
    // Buscar associações do psicólogo com empresas
    const { data: associations, error: associationsError } = await supabase
      .from('company_psychologist_associations')
      .select('id_empresa, status, created_at, updated_at')
      .eq('id_psicologo', parseInt(psychologistId, 10));

    if (associationsError) throw associationsError;

    if (associations && associations.length > 0) {
      // Extrair IDs das empresas associadas
      const companyIds = associations.map(assoc => assoc.id_empresa);

      // Buscar detalhes das empresas
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, contact_email, status')
        .in('id', companyIds);

      if (companiesError) throw companiesError;

      // Mapear empresas com status de conexão
      return companiesData?.map(company => {
        const association = associations.find(a => a.id_empresa === company.id);
        return {
          ...company,
          connection_status: association?.status || 'pending',
          created_at: association?.created_at
        };
      }) || [];
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    throw error;
  }
};

export const searchAvailableCompanies = async (query: string, psychologistId: string): Promise<CompanySearchResult[]> => {
  try {
    // Buscar empresas que correspondem à pesquisa
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, contact_email, status')
      .or(`name.ilike.%${query}%,contact_email.ilike.%${query}%`)
      .eq('status', true)
      .limit(10);

    if (error) throw error;
    
    if (data && data.length > 0) {
      const psychologistIdNumber = parseInt(psychologistId, 10);
      
      // Obter empresas já conectadas para filtrá-las dos resultados
      const { data: existingAssociations } = await supabase
        .from('company_psychologist_associations')
        .select('id_empresa')
        .eq('id_psicologo', psychologistIdNumber);
      
      const connectedCompanyIds = existingAssociations?.map(assoc => assoc.id_empresa) || [];
      
      // Filtrar empresas já conectadas
      return data.filter(company => !connectedCompanyIds.includes(company.id));
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    throw error;
  }
};

export const requestCompanyConnection = async (companyId: number, psychologistId: string): Promise<void> => {
  const psychologistIdNumber = parseInt(psychologistId, 10);

  // Criar nova associação com status pendente
  const { error } = await supabase
    .from('company_psychologist_associations')
    .insert({
      id_empresa: companyId,
      id_psicologo: psychologistIdNumber,
      status: 'pending' // Solicitação pendente
    });

  if (error) throw error;
};

export const fetchCompanyDetails = async (company: Company, psychologistId: string) => {
  const psychologistIdNumber = parseInt(psychologistId, 10);

  // Buscar detalhes da associação
  const { data: associationData, error: associationError } = await supabase
    .from('company_psychologist_associations')
    .select('*')
    .eq('id_empresa', company.id)
    .eq('id_psicologo', psychologistIdNumber)
    .single();

  if (associationError) throw associationError;

  return {
    ...company,
    created_at: associationData?.created_at,
    updated_at: associationData?.updated_at
  };
};
