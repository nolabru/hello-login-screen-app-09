import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Award } from 'lucide-react';

interface SimpleActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
  companyId: string;
}

const SimpleActivityDialog: React.FC<SimpleActivityDialogProps> = ({
  isOpen,
  onClose,
  onActivityAdded,
  companyId
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');

  console.log('SimpleActivityDialog rendered', { isOpen, companyId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', { title, companyId });
    
    if (!title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O título é obrigatório.'
      });
      return;
    }

    setLoading(true);
    try {
      // Simular criação por enquanto
      console.log('Creating activity...', { title, companyId });
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Sucesso!',
        description: `Atividade "${title}" criada com sucesso.`
      });

      onActivityAdded();
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Erro:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao criar atividade.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    console.log('Dialog closing');
    setTitle('');
    onClose();
  };

  if (!isOpen) {
    console.log('Dialog not open, not rendering');
    return null;
  }

  console.log('Dialog rendering content');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            Nova Atividade (Teste)
          </DialogTitle>
          <DialogDescription>
            Versão simplificada para teste
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Atividade *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Workshop de Mindfulness"
              required
            />
          </div>
          
          <div className="text-sm text-gray-500">
            Company ID: {companyId}
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-portal-purple hover:bg-portal-purple-dark"
          >
            {loading ? 'Criando...' : 'Criar Atividade (Teste)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleActivityDialog;
