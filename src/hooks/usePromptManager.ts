
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { AIPrompt } from "@/types/ai-prompt";
import { fetchPrompts, createPrompt, updatePrompt, deletePrompt, setActivePrompt } from "@/integrations/supabase/promptsService";

export const usePromptManager = () => {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<AIPrompt | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchPrompts();
      setPrompts(data);
    } catch (err) {
      console.error("Erro ao carregar prompts:", err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? String(err.message) 
        : "Erro ao carregar prompts. Tente novamente.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os prompts. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (prompt?: AIPrompt) => {
    if (prompt) {
      setCurrentPrompt(prompt);
    } else {
      setCurrentPrompt(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentPrompt(null);
  };

  const handleSavePrompt = async (title: string, content: string) => {
    if (!title.trim() || !content.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Título e conteúdo são obrigatórios.",
      });
      return;
    }

    try {
      if (currentPrompt) {
        // Atualizar prompt existente
        const updated = await updatePrompt(currentPrompt.id, { title, content });
        setPrompts(prompts.map(p => p.id === updated.id ? updated : p));
        toast({
          title: "Prompt atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        // Criar novo prompt
        const adminId = localStorage.getItem('adminId') || 'admin';
        const newPrompt = await createPrompt({
          title,
          content,
          is_active: false,
          created_by: adminId
        });
        setPrompts([newPrompt, ...prompts]);
        toast({
          title: "Prompt criado",
          description: "O novo prompt foi criado com sucesso.",
        });
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Erro ao salvar prompt:", err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o prompt. Tente novamente.",
      });
    }
  };

  const handleOpenDeleteDialog = (id: string) => {
    setPromptToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setPromptToDelete(null);
  };

  const handleDeletePrompt = async () => {
    if (!promptToDelete) return;

    const promptToBeDeleted = prompts.find(p => p.id === promptToDelete);
    
    // Verificar se estamos tentando excluir o único prompt ativo
    if (promptToBeDeleted?.is_active && prompts.filter(p => p.is_active).length <= 1) {
      toast({
        variant: "destructive",
        title: "Operação não permitida",
        description: "Não é possível excluir o único prompt ativo. Ative outro prompt primeiro.",
      });
      handleCloseDeleteDialog();
      return;
    }

    try {
      await deletePrompt(promptToDelete);
      setPrompts(prompts.filter(p => p.id !== promptToDelete));
      toast({
        title: "Prompt excluído",
        description: "O prompt foi excluído com sucesso.",
      });
    } catch (err) {
      console.error("Erro ao excluir prompt:", err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o prompt. Tente novamente.",
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      setIsActivating(true);
      // Encontrar o prompt atual
      const targetPrompt = prompts.find(p => p.id === id);
      
      // Se o prompt já está ativo, não faça nada
      if (targetPrompt?.is_active) {
        toast({
          title: "Prompt já ativo",
          description: "Este prompt já está definido como ativo.",
        });
        return;
      }
      
      const updated = await setActivePrompt(id);
      
      // Atualizar o estado local para refletir que apenas este prompt está ativo
      setPrompts(prompts.map(p => ({
        ...p,
        is_active: p.id === updated.id
      })));
      
      toast({
        title: "Prompt ativado",
        description: "O prompt foi definido como ativo com sucesso.",
      });
    } catch (err) {
      console.error("Erro ao ativar prompt:", err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível ativar o prompt. Tente novamente.",
      });
    } finally {
      setIsActivating(false);
    }
  };

  return {
    prompts,
    isLoading,
    error,
    isDialogOpen,
    isDeleteDialogOpen,
    currentPrompt,
    isActivating,
    handleOpenDialog,
    handleCloseDialog,
    handleSavePrompt,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDeletePrompt,
    handleSetActive
  };
};
