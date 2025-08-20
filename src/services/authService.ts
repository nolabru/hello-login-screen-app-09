import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface CompanyProfile {
  id: number;
  company_id: string;
  user_id: string;
  email?: string;
}

export interface AuthValidationResult {
  isValid: boolean;
  user?: User;
  companyId?: string;
  profile?: CompanyProfile;
  error?: string;
}

/**
 * Serviço de Autenticação Padronizado para o Portal Calma
 * 
 * Este serviço resolve as inconsistências de autenticação identificadas
 * em toda a aplicação, fornecendo uma única fonte de verdade para
 * validação de usuário e obtenção do company_id.
 */
export class AuthService {
  
  /**
   * Obtém o company_id válido para o usuário autenticado
   * 
   * Estratégia híbrida:
   * 1. Prioriza o ID do usuário autenticado no Supabase
   * 2. Verifica se há perfil em user_profiles
   * 3. Fallback para localStorage apenas se necessário
   * 
   * @returns Promise<string | null> - ID da empresa válido ou null se não autenticado
   */
  static async getValidatedCompanyId(): Promise<string | null> {
    try {
      console.log('🔍 AuthService: Validando company_id...');
      
      // 1. Verificar sessão ativa no Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.warn('⚠️ AuthService: Nenhum usuário autenticado no Supabase');
        console.warn('Auth Error:', authError);
        
        // Fallback: usar localStorage apenas como último recurso
        const fallbackId = localStorage.getItem('companyId');
        console.log('📦 AuthService: Usando fallback localStorage:', fallbackId);
        return fallbackId;
      }
      
      console.log('✅ AuthService: Usuário autenticado encontrado:', user.id);
      
      // 2. Buscar perfil em user_profiles para empresas que usam essa abordagem
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id, user_id, email')
        .eq('user_id', user.id)
        .single();
      
      if (!profileError && profile && profile.company_id) {
        console.log('✅ AuthService: Company_id encontrado em user_profiles:', profile.company_id);
        
        // Sincronizar localStorage para manter consistência
        localStorage.setItem('companyId', profile.company_id);
        
        return profile.company_id;
      } else {
        console.log('🔍 AuthService: Perfil não encontrado em user_profiles, usando user.id diretamente');
        console.log('Profile Error:', profileError);
      }
      
      // 3. Para empresas que não usam user_profiles, usar user.id diretamente
      const directCompanyId = user.id;
      console.log('✅ AuthService: Usando user.id como company_id:', directCompanyId);
      
      // Sincronizar localStorage
      localStorage.setItem('companyId', directCompanyId);
      
      return directCompanyId;
      
    } catch (error) {
      console.error('❌ AuthService: Erro ao validar company_id:', error);
      
      // Em caso de erro, tentar localStorage como último recurso
      const fallbackId = localStorage.getItem('companyId');
      console.log('📦 AuthService: Erro - usando fallback localStorage:', fallbackId);
      return fallbackId;
    }
  }
  
  /**
   * Valida se o usuário tem uma sessão ativa
   * 
   * @returns Promise<User | null> - Usuário autenticado ou null
   */
  static async validateUserSession(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ AuthService: Erro ao validar sessão:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('❌ AuthService: Erro inesperado ao validar sessão:', error);
      return null;
    }
  }
  
  /**
   * Obtém o perfil da empresa para o usuário autenticado
   * 
   * @param userId - ID do usuário (opcional, usa usuário atual se não fornecido)
   * @returns Promise<CompanyProfile | null> - Perfil da empresa ou null
   */
  static async getCompanyProfile(userId?: string): Promise<CompanyProfile | null> {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const user = await this.validateUserSession();
        if (!user) {
          console.warn('⚠️ AuthService: Não foi possível obter usuário para buscar perfil');
          return null;
        }
        targetUserId = user.id;
      }
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id, company_id, user_id, email')
        .eq('user_id', targetUserId)
        .single();
      
      if (error || !profile) {
        console.error('❌ AuthService: Erro ao buscar perfil da empresa:', error);
        return null;
      }
      
      return profile;
    } catch (error) {
      console.error('❌ AuthService: Erro inesperado ao buscar perfil:', error);
      return null;
    }
  }
  
  /**
   * Validação completa de autenticação e autorização
   * 
   * Retorna todas as informações necessárias para componentes
   * que precisam validar acesso e obter company_id
   * 
   * @returns Promise<AuthValidationResult> - Resultado completo da validação
   */
  static async validateAuthAndGetCompany(): Promise<AuthValidationResult> {
    try {
      console.log('🔍 AuthService: Iniciando validação completa...');
      
      // 1. Validar sessão
      const user = await this.validateUserSession();
      if (!user) {
        return {
          isValid: false,
          error: 'Usuário não autenticado'
        };
      }
      
      // 2. Obter company_id válido
      const companyId = await this.getValidatedCompanyId();
      if (!companyId) {
        return {
          isValid: false,
          user,
          error: 'Company ID não encontrado'
        };
      }
      
      // 3. Obter perfil (opcional, pode não existir para todas as empresas)
      const profile = await this.getCompanyProfile(user.id);
      
      console.log('✅ AuthService: Validação completa bem-sucedida');
      console.log('User ID:', user.id);
      console.log('Company ID:', companyId);
      console.log('Has Profile:', !!profile);
      
      return {
        isValid: true,
        user,
        companyId,
        profile: profile || undefined
      };
      
    } catch (error) {
      console.error('❌ AuthService: Erro na validação completa:', error);
      return {
        isValid: false,
        error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }
  
  /**
   * Função utilitária para componentes que precisam apenas do company_id
   * com validação rápida
   * 
   * @returns Promise<string | null> - Company ID válido ou null
   */
  static async getCompanyIdWithValidation(): Promise<string | null> {
    const validation = await this.validateAuthAndGetCompany();
    return validation.isValid ? validation.companyId || null : null;
  }
  
  /**
   * Limpa dados de autenticação do localStorage
   * Útil para logout e limpeza de dados inconsistentes
   */
  static clearAuthData(): void {
    console.log('🧹 AuthService: Limpando dados de autenticação...');
    localStorage.removeItem('companyId');
    localStorage.removeItem('companyName');
    localStorage.removeItem('companyEmail');
    console.log('✅ AuthService: Dados de autenticação limpos');
  }
  
  /**
   * Sincroniza dados da empresa no localStorage
   * 
   * @param companyId - ID da empresa
   * @param companyName - Nome da empresa (opcional)
   * @param companyEmail - Email da empresa (opcional)
   */
  static syncCompanyData(companyId: string, companyName?: string, companyEmail?: string): void {
    console.log('🔄 AuthService: Sincronizando dados da empresa...');
    localStorage.setItem('companyId', companyId);
    if (companyName) localStorage.setItem('companyName', companyName);
    if (companyEmail) localStorage.setItem('companyEmail', companyEmail);
    console.log('✅ AuthService: Dados da empresa sincronizados');
  }
}

// Funções utilitárias para backward compatibility
export const getValidatedCompanyId = AuthService.getValidatedCompanyId;
export const validateUserSession = AuthService.validateUserSession;
export const getCompanyProfile = AuthService.getCompanyProfile;
