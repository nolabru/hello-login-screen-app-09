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
import { Calendar as CalendarIcon, Clock, MapPin, Users, Award, FileText } from 'lucide-react';
import DepartmentMultiSelect from './DepartmentMultiSelect';

interface AddActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
  companyId: string;
}

type ActivityInsert = TablesInsert<'company_activities'>;

const AddActivityDialog: React.FC<AddActivityDialogProps> = ({
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
    activity_type: 'workshop',
    facilitator_name: '',
    facilitator_type: 'interno',
    start_date: '',
    end_date: '',
    location: '',
    target_audience: 'todos',
    max_participants: undefined,
    mandatory: false,
    compliance_requirement: 'nenhuma',
    status: 'planejada'
  });

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  // Estado para seleção de departamentos
  const [departmentSelection, setDepartmentSelection] = useState({
    isAllDepartments: true,
    selectedDepartments: []
  });

  const activityTypes = [
    { value: 'workshop', label: 'Workshop', icon: Users },
    { value: 'palestra', label: 'Palestra', icon: FileText },
    { value: 'conversa', label: 'Conversa', icon: Users },
    { value: 'intervencao', label: 'Intervenção', icon: Award },
    { value: 'treinamento', label: 'Treinamento', icon: FileText },
    { value: 'grupo_apoio', label: 'Grupo de Apoio', icon: Users },
    { value: 'sessao_individual', label: 'Sessão Individual', icon: Award }
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
      activity_type: 'workshop',
      facilitator_name: '',
      facilitator_type: 'interno',
      start_date: '',
      end_date: '',
      location: '',
      target_audience: 'todos',
      max_participants: undefined,
      mandatory: false,
      compliance_requirement: 'nenhuma',
      status: 'planejada'
    });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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

    if (!startDate) {
      toast({
        variant: 'destructive',
        title: 'Erro de validação',
        description: 'A data de início é obrigatória.'
      });
      return;
    }

    // Validar seleção de departamentos
    if (!departmentSelection.isAllDepartments && departmentSelection.selectedDepartments.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro de validação',
        description: 'Selecione pelo menos um departamento ou "Todos os Setores".'
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
        start_date: startDate.toISOString(),
        end_date: endDate?.toISOString() || null,
        location: formData.location || null,
        target_audience: formData.target_audience || null,
        max_participants: formData.max_participants || null,
        mandatory: formData.mandatory || false,
        compliance_requirement: formData.compliance_requirement === 'nenhuma' ? null : formData.compliance_requirement,
        status: 'planejada'
      };

      // Inserir a atividade
      const { data: activityResult, error: activityError } = await supabase
        .from('company_activities')
        .insert(activityData)
        .select('id')
        .single();

      if (activityError) throw activityError;

      const activityId = activityResult.id;

      // Inserir relacionamentos de departamentos
      if (departmentSelection.isAllDepartments) {
        // Inserir registro para "todos os departamentos"
        const { error: deptError } = await (supabase as any)
          .from('activity_target_departments')
          .insert({
            activity_id: activityId,
            is_all_departments: true,
            department_id: null
          });

        if (deptError) throw deptError;
      } else {
        // Inserir registros para departamentos específicos
        const departmentRelations = departmentSelection.selectedDepartments.map(dept => ({
          activity_id: activityId,
          department_id: dept.id,
          is_all_departments: false
        }));

        const { error: deptError } = await (supabase as any)
          .from('activity_target_departments')
          .insert(departmentRelations);

        if (deptError) throw deptError;
      }

      toast({
        title: 'Atividade criada',
        description: `A atividade "${formData.title}" foi criada com sucesso.`
      });

      onActivityAdded();
      handleClose();
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar atividade',
        description: 'Não foi possível criar a atividade. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            Nova Atividade de Saúde Mental
          </DialogTitle>
          <DialogDescription>
            Registre uma nova atividade para promover o bem-estar dos colaboradores
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Título da Atividade *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Workshop de Mindfulness"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva os objetivos e conteúdo da atividade..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="activity_type">Tipo de Atividade *</Label>
                <Select 
                  value={formData.activity_type || 'workshop'} 
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
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Departamentos/Setores *</Label>
                <DepartmentMultiSelect
                  companyId={companyId}
                  value={departmentSelection}
                  onChange={setDepartmentSelection}
                  placeholder="Selecione os departamentos alvo..."
                />
              </div>
            </div>
          </div>

          {/* Facilitador */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Facilitador
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facilitator_name">Nome do Facilitador</Label>
                <Input
                  id="facilitator_name"
                  value={formData.facilitator_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, facilitator_name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>

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
            </div>
          </div>

          {/* Data e Local */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Agendamento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Data de Início *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Data de Término</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Opcional'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => !startDate || date < startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Sala de Treinamento"
                />
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Configurações
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_participants">Máximo de Participantes</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={formData.max_participants || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_participants: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  placeholder="Deixe vazio se ilimitado"
                />
              </div>

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

              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mandatory"
                    checked={formData.mandatory || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mandatory: !!checked }))}
                  />
                  <Label htmlFor="mandatory" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Atividade obrigatória para colaboradores
                  </Label>
                </div>
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
            className="bg-portal-purple hover:bg-portal-purple-dark"
          >
            {loading ? 'Criando...' : 'Criar Atividade'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddActivityDialog;
