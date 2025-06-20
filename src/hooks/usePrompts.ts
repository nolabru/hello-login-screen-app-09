import { useState, useEffect } from 'react';
import { PromptService, AIPrompt, AIPromptInsert, AIPromptUpdate } from '@/services/promptService';
import { useToast } from '@/components/ui/use-toast';

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [activePrompt, setActivePrompt] = useState<AIPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const { toast } = useToast();

  // Carregar todos os prompts
  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const data = await PromptService.getAllPrompts();
      setPrompts(data);
      
      // Encontrar o prompt ativo
      const active = data.find(p => p.is_active) || null;
      setActivePrompt(active);
      
      // Calcular estatísticas
      const total = data.length;
      const activeCount = data.filter(p => p.is_active).length;
      const inactive = total - activeCount;
      setStats({ total, active: activeCount, inactive });
      
    } catch (error) {
      console.error('Erro ao carregar prompts:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar prompts',
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar novo prompt
  const createPrompt = async (promptData: AIPromptInsert) => {
    try {
      const newPrompt = await PromptService.createPrompt(promptData);
      await fetchPrompts(); // Recarregar lista
      
      toast({
        title: 'Prompt criado',
        description: 'O prompt foi criado com sucesso.'
      });
      
      return newPrompt;
    } catch (error) {
      console.error('Erro ao criar prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar prompt',
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  };

  // Atualizar prompt
  const updatePrompt = async (id: string, updates: AIPromptUpdate) => {
    try {
      const updatedPrompt = await PromptService.updatePrompt(id, updates);
      await fetchPrompts(); // Recarregar lista
      
      toast({
        title: 'Prompt atualizado',
        description: 'O prompt foi atualizado com sucesso.'
      });
      
      return updatedPrompt;
    } catch (error) {
      console.error('Erro ao atualizar prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar prompt',
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  };

  // Ativar prompt
  const activatePrompt = async (id: string) => {
    try {
      await PromptService.activatePrompt(id);
      await fetchPrompts(); // Recarregar lista
      
      toast({
        title: 'Prompt ativado',
        description: 'O prompt foi ativado com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao ativar prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao ativar prompt',
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  };

  // Desativar prompt
  const deactivatePrompt = async (id: string) => {
    try {
      await PromptService.deactivatePrompt(id);
      await fetchPrompts(); // Recarregar lista
      
      toast({
        title: 'Prompt desativado',
        description: 'O prompt foi desativado com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao desativar prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao desativar prompt',
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  };

  // Deletar prompt
  const deletePrompt = async (id: string) => {
    try {
      await PromptService.deletePrompt(id);
      await fetchPrompts(); // Recarregar lista
      
      toast({
        title: 'Prompt deletado',
        description: 'O prompt foi deletado com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao deletar prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao deletar prompt',
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  };

  // Buscar histórico de um prompt
  const getPromptHistory = async (name: string) => {
    try {
      const history = await PromptService.getPromptHistory(name);
      return history;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar histórico',
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  };

  // Carregar prompts na inicialização
  useEffect(() => {
    fetchPrompts();
  }, []);

  return {
    prompts,
    activePrompt,
    loading,
    stats,
    fetchPrompts,
    createPrompt,
    updatePrompt,
    activatePrompt,
    deactivatePrompt,
    deletePrompt,
    getPromptHistory
  };
};

export default usePrompts;
