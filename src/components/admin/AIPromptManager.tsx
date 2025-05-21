
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import { fetchPrompts, createPrompt, updatePrompt, deletePrompt, setActivePrompt } from "@/integrations/supabase/promptsService";
import { AIPrompt } from "@/types/ai-prompt";

const AIPromptManager: React.FC = () => {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<AIPrompt | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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
      setTitle(prompt.title);
      setContent(prompt.content);
    } else {
      setCurrentPrompt(null);
      setTitle("");
      setContent("");
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentPrompt(null);
    setTitle("");
    setContent("");
  };

  const handleSavePrompt = async () => {
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
      setIsDeleteDialogOpen(false);
      setPromptToDelete(null);
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
      setIsDeleteDialogOpen(false);
      setPromptToDelete(null);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gerenciamento de Prompts da IA</h2>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1">
          <Plus size={16} /> Novo Prompt
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Carregando prompts...</div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">Nenhum prompt encontrado.</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => handleOpenDialog()}
          >
            Criar Primeiro Prompt
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Conteúdo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map(prompt => (
              <TableRow key={prompt.id}>
                <TableCell className="font-medium">{prompt.title}</TableCell>
                <TableCell className="max-w-md truncate">{prompt.content}</TableCell>
                <TableCell>
                  {prompt.is_active ? (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Ativo
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Inativo
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(prompt.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {!prompt.is_active && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSetActive(prompt.id)}
                      disabled={isActivating}
                      title="Definir como ativo"
                    >
                      <Check size={16} />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDialog(prompt)}
                    title="Editar prompt"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDeleteDialog(prompt.id)}
                    title="Excluir prompt"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Dialog para criar/editar prompt */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPrompt ? "Editar Prompt" : "Novo Prompt"}
            </DialogTitle>
            <DialogDescription>
              {currentPrompt 
                ? "Edite as informações do prompt existente." 
                : "Preencha as informações para criar um novo prompt."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do prompt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo do prompt"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSavePrompt}>
              {currentPrompt ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este prompt? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeletePrompt}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIPromptManager;
