import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AIPrompt, AIPromptInsert, AIPromptUpdate } from '@/services/promptService';
import { Save, X, FileText, Zap } from 'lucide-react';

interface PromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  prompt?: AIPrompt | null;
  onSave: (data: AIPromptInsert | AIPromptUpdate) => Promise<void>;
  mode: 'create' | 'edit';
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  isOpen,
  onClose,
  prompt,
  onSave,
  mode
}) => {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    is_active: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetar formulário quando o modal abrir/fechar ou prompt mudar
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && prompt) {
        setFormData({
          name: prompt.name,
          content: prompt.content,
          is_active: prompt.is_active || false
        });
      } else {
        setFormData({
          name: '',
          content: '',
          is_active: false
        });
      }
      setErrors({});
    }
  }, [isOpen, prompt, mode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Conteúdo deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getCharacterCount = () => {
    return formData.content.length;
  };

  const getWordCount = () => {
    return formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {mode === 'create' ? 'Criar Novo Prompt' : 'Editar Prompt'}
            {mode === 'edit' && prompt && (
              <Badge variant="outline" className="ml-2">
                Versão {prompt.version}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Crie um novo prompt para a IA. Defina as instruções e comportamentos desejados.'
              : 'Edite o prompt da IA. As alterações criarão uma nova versão automaticamente.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nome do Prompt */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome do Prompt *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Assistente de Saúde Mental"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Conteúdo do Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-sm font-medium">
                Conteúdo do Prompt *
              </Label>
              <div className="text-xs text-gray-500">
                {getCharacterCount()} caracteres • {getWordCount()} palavras
              </div>
            </div>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Você é um assistente de saúde mental especializado em apoio psicológico. Suas respostas devem ser empáticas, acolhedoras e baseadas em evidências científicas..."
              rows={12}
              className={`resize-none ${errors.content ? 'border-red-500' : ''}`}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
            <div className="text-xs text-gray-500">
              Descreva como a IA deve se comportar, que tipo de respostas dar e quais diretrizes seguir.
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Ativar este prompt
                </Label>
              </div>
              <p className="text-xs text-gray-600">
                Apenas um prompt pode estar ativo por vez. Ativar este prompt desativará todos os outros.
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
          </div>

          {/* Preview */}
          {formData.content && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview do Prompt</Label>
              <div className="p-4 border rounded-lg bg-blue-50 max-h-32 overflow-y-auto">
                <p className="text-sm text-blue-800 whitespace-pre-wrap">
                  {formData.content}
                </p>
              </div>
            </div>
          )}

          {/* Informações da Versão */}
          {mode === 'edit' && prompt && (
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Informações da Versão</span>
              </div>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>• Versão atual: {prompt.version}</p>
                <p>• Criado em: {new Date(prompt.created_at || '').toLocaleString('pt-BR')}</p>
                <p>• Última atualização: {new Date(prompt.updated_at || '').toLocaleString('pt-BR')}</p>
                <p>• Ao salvar, será criada a versão {(prompt.version || 1) + 1}</p>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : mode === 'create' ? 'Criar Prompt' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptEditor;
