import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import PromptEditor from '@/components/admin/PromptEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  FileText, 
  Plus, 
  Edit, 
  Power, 
  PowerOff, 
  Trash2, 
  History, 
  Search,
  Filter,
  Zap,
  Clock,
  User
} from 'lucide-react';
import { usePrompts } from '@/hooks/usePrompts';
import { AIPrompt, AIPromptInsert, AIPromptUpdate } from '@/services/promptService';

const AdminPrompts = () => {
  const {
    prompts,
    activePrompt,
    loading,
    stats,
    createPrompt,
    updatePrompt,
    activatePrompt,
    deactivatePrompt,
    deletePrompt
  } = usePrompts();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrar prompts
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && prompt.is_active) ||
                         (statusFilter === 'inactive' && !prompt.is_active);

    return matchesSearch && matchesStatus;
  });

  const handleCreatePrompt = () => {
    setSelectedPrompt(null);
    setEditorMode('create');
    setEditorOpen(true);
  };

  const handleEditPrompt = (prompt: AIPrompt) => {
    setSelectedPrompt(prompt);
    setEditorMode('edit');
    setEditorOpen(true);
  };

  const handleSavePrompt = async (data: AIPromptInsert | AIPromptUpdate) => {
    if (editorMode === 'create') {
      await createPrompt(data as AIPromptInsert);
    } else if (selectedPrompt) {
      await updatePrompt(selectedPrompt.id, data as AIPromptUpdate);
    }
  };

  const handleToggleActive = async (prompt: AIPrompt) => {
    if (prompt.is_active) {
      await deactivatePrompt(prompt.id);
    } else {
      await activatePrompt(prompt.id);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    await deletePrompt(promptId);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (isActive: boolean | null) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (isActive: boolean | null) => {
    return isActive ? <Zap className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />;
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gerenciar Prompts | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-neutral-700">Gerenciar Prompts</h1>
                  <p className="text-gray-500">Configure e gerencie os prompts da IA</p>
                </div>
              </div>
              <Button onClick={handleCreatePrompt} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Prompt
              </Button>
            </div>
          </header>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Total de Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-500">prompts criados</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Prompt Ativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <p className="text-xs text-gray-500">em uso pela IA</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-gray-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PowerOff className="h-4 w-4" />
                  Prompts Inativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                <p className="text-xs text-gray-500">arquivados</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Prompts ({filteredPrompts.length})</span>
                {activePrompt && (
                  <Badge className="bg-green-100 text-green-800">
                    Ativo: {activePrompt.name}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Gerencie todos os prompts da IA. Apenas um prompt pode estar ativo por vez.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPrompts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum prompt encontrado</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Tente ajustar os filtros para ver mais resultados.'
                      : 'Crie seu primeiro prompt para começar.'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Button onClick={handleCreatePrompt} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Prompt
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPrompts.map((prompt) => (
                    <div 
                      key={prompt.id}
                      className={`border rounded-xl p-6 transition-all duration-200 ${
                        prompt.is_active 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Header do Prompt */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${
                              prompt.is_active ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <FileText className={`h-4 w-4 ${
                                prompt.is_active ? 'text-green-600' : 'text-gray-600'
                              }`} />
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-medium text-gray-900">
                                {prompt.name}
                              </h3>
                              
                              <Badge className={getStatusColor(prompt.is_active)}>
                                {getStatusIcon(prompt.is_active)}
                                <span className="ml-1">
                                  {prompt.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                              </Badge>
                              
                              <Badge variant="outline">
                                Versão {prompt.version}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Conteúdo do Prompt */}
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {prompt.content}
                            </p>
                          </div>
                          
                          {/* Metadados */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Criado: {formatDate(prompt.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Atualizado: {formatDate(prompt.updated_at)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Ações */}
                        <div className="flex gap-2 ml-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPrompt(prompt)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(prompt)}
                            className={prompt.is_active 
                              ? "hover:bg-red-50 hover:border-red-300" 
                              : "hover:bg-green-50 hover:border-green-300"
                            }
                          >
                            {prompt.is_active ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-1" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-1" />
                                Ativar
                              </>
                            )}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-red-50 hover:border-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Deletar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deletar Prompt</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar o prompt "{prompt.name}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePrompt(prompt.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Editor Modal */}
        <PromptEditor
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          prompt={selectedPrompt}
          onSave={handleSavePrompt}
          mode={editorMode}
        />
      </AdminDashboardLayout>
    </>
  );
};

export default AdminPrompts;
