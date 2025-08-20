import React, { useState, useEffect } from 'react';
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
import { Tables } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Edit2, 
  Calendar as CalendarIcon, 
  Users, 
  MapPin, 
  User, 
  Award,
  FileText,
  AlertCircle
} from 'lucide-react';
import DepartmentMultiSelect from './DepartmentMultiSelect';

interface EditActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Tables<'company_activities'> | null;
  onActivityUpdated: () => void;
}

const EditActivityDialog: React.FC<EditActivityDialogProps> = ({
  isOpen,
  onClose,
  activity,
  onActivityUpdated
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: 'workshop',
    facilitator_name: '',
    facilitator_type: 'interno',
    location: '',
    target_audience: '',
    max_participants: null as number | null,
    participants_registered: 0,
    mandatory: false,
    compliance_requirement: null as string | null
  });

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Estado para seleção de departamentos
  const [departmentSelection, setDepartmentSelection] = useState({
    isAllDepartments: true,
    selectedDepartments: []
  });

  // Carregar departamentos da atividade
  const loadActivityDepartments = async (activityId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('activity_target_departments')
        .select(`
          is_all_departments,
          department_id,
          company_departments!inner(id, name, status)
        `)
        .eq('activity_id', activityId);

      if (error) throw error;

      const hasAllDepartments = data?.some((rel: any) => rel.is_all_departments);
      
      if (hasAllDepartments) {
        setDepartmentSelection({
          isAllDepartments: true,
          selectedDepartments: []
        });
      } else {
        const selectedDepts = data
          ?.filter((rel: any) => rel.department_id && rel.company_departments)
          .map((rel: any) => ({
            id: rel.company_departments.id,
            name: rel.company_departments.name,
            status: rel.company_departments.status
          })) || [];

        setDepartmentSelection({
          isAllDepartments: false,
          selectedDepartments: selectedDepts
        });
      }
    } catch (error) {
      console.error('Erro ao carregar departamentos da atividade:', error);
    }
  };

  // Populate form when activity changes
  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        activity_type: activity.activity_type || 'workshop',
        facilitator_name: activity.facilitator_name || '',
        facilitator_type: activity.facilitator_type || 'interno',
        location: activity.location || '',
        target_audience: activity.target_audience || '',
        max_participants: activity.max_participants,
        participants_registered: activity.participants_registered || 0,
        mandatory: activity.mandatory || false,
        compliance_requirement: activity.compliance_requirement
      });
      
      setStartDate(activity.start_date ? new Date(activity.start_date) : undefined);
      setEndDate(activity.end_date ? new Date(activity.end_date) : undefined);
      
      // Carregar departamentos da atividade
      loadActivityDepartments(activity.id);
    }
  }, [activity]);

  const activityTypes = [
    { value: 'workshop', label: 'Workshop', icon: Users },
    { value: 'palestra', label: 'Palestra', icon: FileText },
    { value: 'conversa', label: 'Conversa Individual', icon: Users },
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

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      activity_type: 'workshop',
      facilitator_name: '',
      facilitator_type: 'interno',
      location: '',
      target_audience: '',
      max_participants: null,
      participants_registered: 0,
      mandatory: false,
      compliance_requirement: null
    });
    setStartDate(undefined);
    setEndDate(undefined);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activity) return;

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

    if (endDate && endDate < startDate) {
      toast({
        variant: 'destructive',
        title: 'Erro de validação',
        description: 'A data de término não pode ser anterior à data de início.'
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
      const updateData: any = {
        title: formData.title,
        description: formData.description || null,
        activity_type: formData.activity_type,
        facilitator_name: formData.facilitator_name || null,
        facilitator_type: formData.facilitator_type,
        start_date: startDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null,
        location: formData.location || null,
        target_audience: formData.target_audience || null,
        max_participants: formData.max_participants,
        participants_registered: formData.participants_registered,
        mandatory: formData.mandatory,
        compliance_requirement: formData.compliance_requirement === 'nenhuma' ? null : formData.compliance_requirement,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('company_activities')
        .update(updateData)
        .eq('id', activity.id);

      if (error) throw error;

      // Atualizar relacionamentos de departamentos
      // Primeiro, remover relacionamentos existentes
      const { error: deleteError } = await (supabase as any)
        .from('activity_target_departments')
        .delete()
        .eq('activity_id', activity.id);

      if (deleteError) throw deleteError;

      // Depois, inserir novos relacionamentos
      if (departmentSelection.isAllDepartments) {
        // Inserir registro para "todos os departamentos"
        const { error: deptError } = await (supabase as any)
          .from('activity_target_departments')
          .insert({
            activity_id: activity.id,
            is_all_departments: true,
            department_id: null
          });

        if (deptError) throw deptError;
      } else {
        // Inserir registros para departamentos específicos
        const departmentRelations = departmentSelection.selectedDepartments.map(dept => ({
          activity_id: activity.id,
          department_id: dept.id,
          is_all_departments: false
        }));

        const { error: deptError } = await (supabase as any)
          .from('activity_target_departments')
          .insert(departmentRelations);

        if (deptError) throw deptError;
      }

      toast({
        title: 'Atividade atualizada',
        description: `A atividade "${formData.title}" foi atualizada com sucesso.`
      });

      onActivityUpdated();
      handleClose();
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar atividade',
        description: 'Não foi possível atualizar a atividade. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!activity) return null;

  // Allow editing all activities
  const canEdit = true;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
              <Edit2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <span className="text-xl font-bold">Editar Atividade</span>
              <p className="text-sm text-gray-600 font-normal">
                Atualize as informações da atividade
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Modifique todos os detalhes da atividade de saúde mental
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Informações Básicas
            </h3>
            
            <div>
              <Label htmlFor="title">Título da Atividade *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Workshop de Gestão do Estresse"
                required
                disabled={!canEdit}
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva os objetivos e conteúdo da atividade..."
                rows={3}
                disabled={!canEdit}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activity_type">Tipo de Atividade *</Label>
                <Select 
                  value={formData.activity_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, activity_type: value as any }))}
                  disabled={!canEdit}
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
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="max_participants">Máximo de Participantes</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={formData.max_participants || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_participants: e.target.value ? Number(e.target.value) : null 
                  }))}
                  placeholder="Sem limite"
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>

          {/* Data e Local */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Data e Local
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data de Início *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={!canEdit}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={!canEdit}
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
                      disabled={!canEdit}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => !canEdit || (startDate ? date < startDate : false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Sala de Reuniões, Auditório, Online"
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Facilitador */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              Facilitador
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facilitator_type">Tipo de Facilitador *</Label>
                <Select 
                  value={formData.facilitator_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, facilitator_type: value as any }))}
                  disabled={!canEdit}
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
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div>
              <Label>Departamentos/Setores *</Label>
              <DepartmentMultiSelect
                companyId={activity.company_id}
                value={departmentSelection}
                onChange={setDepartmentSelection}
                placeholder="Selecione os departamentos alvo..."
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Participação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participação
            </h3>
            
            <div>
              <Label htmlFor="participants_registered">
                Participantes Inscritos
              </Label>
              <Input
                id="participants_registered"
                type="number"
                min="0"
                value={formData.participants_registered}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  participants_registered: Number(e.target.value) 
                }))}
                placeholder="0"
                disabled={!canEdit}
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de participantes já inscritos na atividade
              </p>
            </div>
          </div>

          {/* Compliance */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Compliance
            </h3>
            
            <div>
              <Label htmlFor="compliance_requirement">Requisito de Compliance</Label>
              <Select 
                value={formData.compliance_requirement || 'nenhuma'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, compliance_requirement: value }))}
                disabled={!canEdit}
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
                checked={formData.mandatory}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mandatory: !!checked }))}
                disabled={!canEdit}
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
          {canEdit && (
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                'Atualizando...'
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditActivityDialog;
