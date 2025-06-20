import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type AIPrompt = Tables<'ai_prompts'>;
export type AIPromptInsert = TablesInsert<'ai_prompts'>;
export type AIPromptUpdate = TablesUpdate<'ai_prompts'>;

export class PromptService {
  // Buscar todos os prompts
  static async getAllPrompts(): Promise<AIPrompt[]> {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar prompts: ${error.message}`);
    }

    return data || [];
  }

  // Buscar prompt ativo
  static async getActivePrompt(): Promise<AIPrompt | null> {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar prompt ativo: ${error.message}`);
    }

    return data || null;
  }

  // Buscar prompt por ID
  static async getPromptById(id: string): Promise<AIPrompt | null> {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar prompt: ${error.message}`);
    }

    return data || null;
  }

  // Criar novo prompt
  static async createPrompt(prompt: AIPromptInsert): Promise<AIPrompt> {
    const { data: user } = await supabase.auth.getUser();
    
    const promptData: AIPromptInsert = {
      ...prompt,
      version: 1,
      created_by: user.user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Se o novo prompt for ativo, desativar todos os outros
    if (prompt.is_active) {
      await this.deactivateAllPrompts();
    }

    const { data, error } = await supabase
      .from('ai_prompts')
      .insert(promptData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar prompt: ${error.message}`);
    }

    return data;
  }

  // Atualizar prompt existente
  static async updatePrompt(id: string, updates: AIPromptUpdate): Promise<AIPrompt> {
    const { data: user } = await supabase.auth.getUser();
    
    // Buscar o prompt atual para incrementar a versão
    const currentPrompt = await this.getPromptById(id);
    if (!currentPrompt) {
      throw new Error('Prompt não encontrado');
    }

    const updateData: AIPromptUpdate = {
      ...updates,
      version: (currentPrompt.version || 1) + 1,
      updated_at: new Date().toISOString(),
      created_by: user.user?.id
    };

    // Se o prompt for ativado, desativar todos os outros
    if (updates.is_active) {
      await this.deactivateAllPrompts();
    }

    const { data, error } = await supabase
      .from('ai_prompts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar prompt: ${error.message}`);
    }

    return data;
  }

  // Ativar prompt (desativa todos os outros)
  static async activatePrompt(id: string): Promise<AIPrompt> {
    // Primeiro desativar todos os prompts
    await this.deactivateAllPrompts();

    // Depois ativar o prompt específico
    const { data, error } = await supabase
      .from('ai_prompts')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao ativar prompt: ${error.message}`);
    }

    return data;
  }

  // Desativar prompt
  static async deactivatePrompt(id: string): Promise<AIPrompt> {
    const { data, error } = await supabase
      .from('ai_prompts')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao desativar prompt: ${error.message}`);
    }

    return data;
  }

  // Desativar todos os prompts
  static async deactivateAllPrompts(): Promise<void> {
    const { error } = await supabase
      .from('ai_prompts')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('is_active', true);

    if (error) {
      throw new Error(`Erro ao desativar prompts: ${error.message}`);
    }
  }

  // Deletar prompt
  static async deletePrompt(id: string): Promise<void> {
    const { error } = await supabase
      .from('ai_prompts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar prompt: ${error.message}`);
    }
  }

  // Buscar histórico de versões de um prompt (por nome)
  static async getPromptHistory(name: string): Promise<AIPrompt[]> {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('name', name)
      .order('version', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar histórico do prompt: ${error.message}`);
    }

    return data || [];
  }

  // Estatísticas dos prompts
  static async getPromptStats() {
    const { data: allPrompts, error: allError } = await supabase
      .from('ai_prompts')
      .select('*');

    if (allError) {
      throw new Error(`Erro ao buscar estatísticas: ${allError.message}`);
    }

    const total = allPrompts?.length || 0;
    const active = allPrompts?.filter(p => p.is_active).length || 0;
    const inactive = total - active;

    return {
      total,
      active,
      inactive
    };
  }
}
