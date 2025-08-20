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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Zap, 
  Calendar as CalendarIcon, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Target,
  Award,
  Star,
  FileText,
  User
} from 'lucide-react';

interface QuickActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
  companyId: string;
}

type ActivityInsert = TablesInsert<'company_activities'>;

const QuickActivityDialog: React.FC<QuickActivityDialogProps> = ({
  isOpen,
  onClose,
  onActivityAdded,
  companyId
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<ActivityInsert>>({
    company_id: companyId,
    title: '',
    description: '',
    activity_type: 'intervencao',
    facilitator_name: '',
    facilitator_type: 'interno',
    start_date: '',
    location: '',
    target_audience: '',
    participants_registered: 0,
    participants_attended: 0,
    mandatory: false,
    compliance_requirement: 'nenhuma',
    status: 'concluida'
  });

  const [activityDate, setActivityDate] = useState<Date>(new Date());
  const [satisfaction_score, setSatisfactionScore] = useState<string>('');
  const [effectiveness_score, setEffectivenessScore] = useState<string>('');

  const activityTypes = [
    { value: 'intervencao', label: 'Intervenção', icon: Award, desc: 'Ação pontual de apoio' },
    { value: 'conversa', label: 'Conversa Individual', icon: Users, desc: 'Diálogo com colaborador' },
    { value: 'sessao_individual', label: 'Sessão Individual', icon: Award, desc: 'Atendimento psicológico' },
    { value: 'grupo_apoio', label: 'Grupo de Apoio', icon: Users, desc: 'Reunião de apoio mútuo' },
    { value: 'workshop', label: 'Workshop', icon: Users, desc: 'Atividade prática realizada' },
    { value: 'palestra', label: 'Palestra', icon: FileText, desc: 'Apresentação realizada' }
  ];

  const facilitatorTypes = [
    { value: 'psicologo', label: 'Psicólogo' },
    { value: 'interno', label: 'Facilitador Interno' },
    { value: 'externo', label: 'Facilitador Externo' }
  ];

  const complianceRequirements = [
    { value: 'nenhuma', label: 'Nenhuma' },
    { value: 'Lei 14.831/2024', label: 'Lei 14.831/2024 - Certificado Empresa Promotora' },
    { value: 'NR-1', label: 'NR-1 - Riscos Psicossociais' },
    { value: 'Ambas', label: 'Lei 14.831 + NR-1' }
  ];

  const resetForm = () => {
    setFormData({
      company_id: companyId,
      title: '',
      description: '',
      activity_type: 'intervencao',
      facilitator_name: '',
      facilitator_type: 'interno',
      start_date: '',
      location: '',
      target_audience: '',
      participants_registered: 0,
      participants_attended: 0,
      mandatory: false,
      compliance_requirement: 'nenhuma',
      status: 'concluida'
    });
    setActivityDate(new Date());
    setSatisfactionScore('');
    setEffectivenessScore('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const participationRate = formData.participants_registered > 0 
    ? Math.round((formData.participants_attended / formData.participants_registered) * 100)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro de validação',
        description: 'O título da atividade é obrigatório.'
      });
      return;
    }

    if (formData.participants_attended < 0) {
      toast({
        variant: 'destructive',
        title: 'Erro de validação',
        description: 'O número de participantes não pode ser negativo.'
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
      const activityData: ActivityInsert = {
        company_id: companyId,
        title: formData.title!,
        description: formData.description || null,
        activity_type: formData.activity_type!,
        facilitator_name: formData.facilitator_name || null,
        facilitator_type: formData.facilitator_type!,
        start_date: activityDate.toISOString(),
        end_date: null,
        location: formData.location || null,
        target_audience: formData.target_audience || null,
        max_participants: null,
        participants_registered: formData.participants_registered || 0,
        participants_attended: formData.participants_attended || 0,
        mandatory: formData.mandatory || false,
        compliance_requirement: formData.compliance_requirement === 'nenhuma' ? null : formData.compliance_requirement,
        status: 'concluida',
        satisfaction_score: satisfaction_score ? parseFloat(satisfaction_score) : null,
        effectiveness_score: effectiveness_score ? parseFloat(effectiveness_score) : null
      };

      const { error } = await supabase
        .from('company_activities')
        .insert(activityData);

      if (error) throw error;

      toast({
        title: 'Atividade registrada',
        description: `A atividade "${formData.title}" foi registrada como concluída.`
      });

      onActivityAdded();
      handleClose();
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao registrar atividade',
        description: 'Não foi possível registrar a atividade. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">Registro Rápido</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  Concluída
                </span>
              </div>
              <p className="text-sm text-gray-600 font-normal">
                Registre uma atividade já realizada
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Para atividades não planejadas: intervenções, conversas individuais, apoio pontual
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Informações da Atividade
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Título da Atividade *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Conversa de apoio com colaborador X"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva brevemente o que foi realizado..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="activity_type">Tipo de Atividade *</Label>
                <Select 
                  value={formData.activity_type || 'intervencao'} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, activity_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.desc}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data da Atividade *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(activityDate, 'dd/MM/yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={activityDate}
                      onSelect={(date) => date && setActivityDate(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facilitator_type">Tipo de Facilitador *</Label>
                <Select 
                  value={formData.facilitator_type || 'interno'} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, facilitator_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilitatorTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="facilitator_name">Nome do Facilitador</Label>
                <Input
                  id="facilitator_name"
                  value={formData.facilitator_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, facilitator_name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Sala de reuniões, Online"
                />
              </div>

              <div>
                <Label htmlFor="target_audience">Público-Alvo</Label>
                <Input
                  id="target_audience"
                  value={formData.target_audience || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="Ex: Colaborador específico, Setor TI"
                />
              </div>
            </div>
          </div>

          {/* Participação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participação
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="participants_registered">
                  Participantes Esperados/Inscritos
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
                  Participantes Presentes
                </Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="participants_attended"
                    type="number"
                    min="0"
                    value={formData.participants_attended}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      participants_attended: Number(e.target.value) 
                    }))}
                    className="pl-10"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

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

          {/* Avaliação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Avaliação (Opcional)
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
                    value={satisfaction_score}
                    onChange={(e) => setSatisfactionScore(e.target.value)}
                    className="pl-10"
                    placeholder="Ex: 8.5"
                  />
                </div>
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
                    value={effectiveness_score}
                    onChange={(e) => setEffectivenessScore(e.target.value)}
                    className="pl-10"
                    placeholder="Ex: 9.0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="compliance_requirement">Requisito de Compliance</Label>
              <Select 
                value={formData.compliance_requirement || 'nenhuma'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, compliance_requirement: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o requisito" />
                </SelectTrigger>
                <SelectContent>
                  {complianceRequirements.map((req) => (
                    <SelectItem key={req.value} value={req.value}>
                      {req.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mandatory"
                checked={formData.mandatory || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mandatory: !!checked }))}
              />
              <Label htmlFor="mandatory" className="text-sm">
                Atividade obrigatória para colaboradores
              </Label>
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
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? (
              'Registrando...'
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Registrar Atividade
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickActivityDialog;
