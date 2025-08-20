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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CheckCircle2, 
  Users, 
  UserPlus, 
  Target, 
  Award,
  Calendar,
  Star,
  AlertCircle,
  Clock
} from 'lucide-react';

interface CompleteActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Tables<'company_activities'> | null;
  onActivityCompleted: () => void;
}

const CompleteActivityDialog: React.FC<CompleteActivityDialogProps> = ({
  isOpen,
  onClose,
  activity,
  onActivityCompleted
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    participants_registered: activity?.participants_registered || 0,
    participants_attended: 0,
    satisfaction_score: '',
    effectiveness_score: '',
    completion_notes: ''
  });

  React.useEffect(() => {
    if (activity) {
      setFormData({
        participants_registered: activity.participants_registered || 0,
        participants_attended: activity.participants_attended || 0,
        satisfaction_score: activity.satisfaction_score?.toString() || '',
        effectiveness_score: activity.effectiveness_score?.toString() || '',
        completion_notes: ''
      });
    }
  }, [activity]);

  if (!activity) return null;

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      'workshop': 'Workshop',
      'palestra': 'Palestra',
      'conversa': 'Conversa',
      'intervencao': 'Intervenção',
      'treinamento': 'Treinamento',
      'grupo_apoio': 'Grupo de Apoio',
      'sessao_individual': 'Sessão Individual'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const participationRate = formData.participants_registered > 0 
    ? Math.round((formData.participants_attended / formData.participants_registered) * 100)
    : 0;

  const handleClose = () => {
    setFormData({
      participants_registered: activity?.participants_registered || 0,
      participants_attended: 0,
      satisfaction_score: '',
      effectiveness_score: '',
      completion_notes: ''
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.participants_attended < 0) {
      toast({
        variant: 'destructive',
        title: 'Erro de validação',
        description: 'O número de participantes presentes não pode ser negativo.'
      });
      return;
    }

    if (formData.participants_registered < formData.participants_attended) {
      toast({
        variant: 'destructive',
        title: 'Erro de validação', 
        description: 'O número de presentes não pode ser maior que o de inscritos.'
      });
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        participants_registered: formData.participants_registered,
        participants_attended: formData.participants_attended,
        status: 'concluida',
        updated_at: new Date().toISOString()
      };

      if (formData.satisfaction_score) {
        updateData.satisfaction_score = parseFloat(formData.satisfaction_score);
      }

      if (formData.effectiveness_score) {
        updateData.effectiveness_score = parseFloat(formData.effectiveness_score);
      }

      const { error } = await supabase
        .from('company_activities')
        .update(updateData)
        .eq('id', activity.id);

      if (error) throw error;

      toast({
        title: 'Atividade finalizada',
        description: `A atividade "${activity.title}" foi marcada como concluída.`
      });

      onActivityCompleted();
      handleClose();
    } catch (error) {
      console.error('Erro ao finalizar atividade:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao finalizar atividade',
        description: 'Não foi possível finalizar a atividade. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">Finalizar Atividade</span>
                <Badge className="bg-blue-100 text-blue-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Planejada
                </Badge>
              </div>
              <p className="text-sm text-gray-600 font-normal">
                {activity.title}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Registre os resultados da atividade para marcá-la como concluída
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da Atividade */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Tipo</p>
                <p className="text-gray-900">{getActivityTypeLabel(activity.activity_type)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Data</p>
                <p className="text-gray-900">
                  {format(new Date(activity.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Local</p>
                <p className="text-gray-900">{activity.location || 'Não especificado'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Participação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participação
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="participants_registered">
                  Participantes Inscritos
                </Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="participants_registered"
                    type="number"
                    min="0"
                    value={formData.participants_registered}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      participants_registered: Number(e.target.value) 
                    }))}
                    className="pl-10"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="participants_attended">
                  Participantes Presentes *
                </Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="participants_attended"
                    type="number"
                    min="0"
                    max={formData.participants_registered}
                    value={formData.participants_attended}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      participants_attended: Number(e.target.value) 
                    }))}
                    className="pl-10"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Taxa de Participação Preview */}
            {formData.participants_registered > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Taxa de Participação</p>
                    <p className="text-2xl font-bold text-blue-900">{participationRate}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Avaliação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Avaliação da Atividade
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="satisfaction_score">
                  Nota de Satisfação (1-10)
                </Label>
                <div className="relative">
                  <Award className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="satisfaction_score"
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={formData.satisfaction_score}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      satisfaction_score: e.target.value 
                    }))}
                    className="pl-10"
                    placeholder="Ex: 8.5"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Opcional - Como os participantes avaliaram a atividade?
                </p>
              </div>

              <div>
                <Label htmlFor="effectiveness_score">
                  Nota de Efetividade (1-10)
                </Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="effectiveness_score"
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={formData.effectiveness_score}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      effectiveness_score: e.target.value 
                    }))}
                    className="pl-10"
                    placeholder="Ex: 9.0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Opcional - Quão efetiva foi a atividade?
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="completion_notes">
                Observações Finais
              </Label>
              <Textarea
                id="completion_notes"
                value={formData.completion_notes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  completion_notes: e.target.value 
                }))}
                placeholder="Adicione observações sobre como foi a atividade, pontos de destaque, melhorias para próximas vezes..."
                rows={3}
              />
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Importante</p>
                <p className="text-amber-700">
                  Após finalizar, a atividade será marcada como <strong>concluída</strong> e não poderá ser editada. 
                  Apenas os números de participação poderão ser ajustados posteriormente.
                </p>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              'Finalizando...'
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalizar Atividade
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteActivityDialog;
