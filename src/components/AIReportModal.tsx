import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Flag, X } from 'lucide-react';

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIReportModal: React.FC<AIReportModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const categoryOptions = [
    { value: 'offensive_content', label: 'Conteúdo Ofensivo' },
    { value: 'incorrect_information', label: 'Informações Incorretas' },
    { value: 'inappropriate_content', label: 'Conteúdo Inadequado' },
    { value: 'dangerous_content', label: 'Conteúdo Perigoso' },
    { value: 'strange_behavior', label: 'Comportamento Estranho' },
    { value: 'other', label: 'Outros' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Por favor, selecione uma categoria e descreva o problema.'
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('ai_content_reports')
        .insert({
          user_id: user.id,
          category,
          description: description.trim(),
          timestamp_of_incident: new Date().toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Denúncia enviada',
        description: 'Sua denúncia foi enviada com sucesso. Nossa equipe irá analisá-la em breve.'
      });

      // Reset form
      setCategory('');
      setDescription('');
      onClose();

    } catch (error) {
      console.error('Error submitting AI report:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar denúncia',
        description: 'Não foi possível enviar sua denúncia. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCategory('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Denunciar Conteúdo da IA
          </DialogTitle>
          <DialogDescription>
            Relate problemas com o conteúdo gerado pela IA para nos ajudar a melhorar o serviço.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria da denúncia *</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descreva o problema *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o que aconteceu..."
              rows={4}
              disabled={loading}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">
              {description.length}/1000 caracteres
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Privacidade:</strong> Não coletamos o conteúdo das suas conversas. 
              Apenas sua descrição do problema será enviada para análise.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !category || !description.trim()}
              className="flex-1"
            >
              {loading ? 'Enviando...' : 'Enviar Denúncia'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AIReportModal;
