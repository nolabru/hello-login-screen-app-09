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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  FileText, 
  User,
  Target,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Edit2,
  UserPlus
} from 'lucide-react';

interface ViewActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Tables<'company_activities'> | null;
  onEdit?: (activity: Tables<'company_activities'>) => void;
  onManageParticipants?: (activity: Tables<'company_activities'>) => void;
}

const ViewActivityDialog: React.FC<ViewActivityDialogProps> = ({
  isOpen,
  onClose,
  activity,
  onEdit,
  onManageParticipants
}) => {
  const [departmentNames, setDepartmentNames] = useState<string[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Carregar departamentos da atividade
  const loadActivityDepartments = async (activityId: string) => {
    setLoadingDepartments(true);
    try {
      const { data, error } = await (supabase as any)
        .from('activity_target_departments')
        .select(`
          is_all_departments,
          company_departments(name)
        `)
        .eq('activity_id', activityId);

      if (error) throw error;

      const hasAllDepartments = data?.some((rel: any) => rel.is_all_departments);
      
      if (hasAllDepartments) {
        setDepartmentNames(['Todos os Setores']);
      } else {
        const deptNames = data
          ?.filter((rel: any) => rel.company_departments)
          .map((rel: any) => rel.company_departments.name)
          .filter(Boolean) || [];
        setDepartmentNames(deptNames.length > 0 ? deptNames : ['Não definido']);
      }
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      setDepartmentNames(['Erro ao carregar']);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Carregar departamentos quando atividade mudar
  useEffect(() => {
    if (activity && isOpen) {
      loadActivityDepartments(activity.id);
    }
  }, [activity, isOpen]);

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

  const getStatusConfig = (status: string) => {
    const configs = {
      'planejada': { 
        label: 'Planejada', 
        color: 'bg-blue-100 text-blue-800', 
        icon: <Clock className="h-4 w-4" /> 
      },
      'em_andamento': { 
        label: 'Em Andamento', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <PlayCircle className="h-4 w-4" /> 
      },
      'concluida': { 
        label: 'Concluída', 
        color: 'bg-green-100 text-green-800', 
        icon: <CheckCircle2 className="h-4 w-4" /> 
      },
      'cancelada': { 
        label: 'Cancelada', 
        color: 'bg-red-100 text-red-800', 
        icon: <AlertCircle className="h-4 w-4" /> 
      }
    };
    return configs[status as keyof typeof configs] || configs['planejada'];
  };

  const getFacilitatorTypeLabel = (type: string) => {
    const labels = {
      'psicologo': 'Psicólogo',
      'interno': 'Facilitador Interno',
      'externo': 'Facilitador Externo'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getActivityTypeIcon = (type: string) => {
    const icons = {
      'workshop': <Users className="h-5 w-5" />,
      'palestra': <FileText className="h-5 w-5" />,
      'conversa': <Users className="h-5 w-5" />,
      'intervencao': <Award className="h-5 w-5" />,
      'treinamento': <FileText className="h-5 w-5" />,
      'grupo_apoio': <Users className="h-5 w-5" />,
      'sessao_individual': <Award className="h-5 w-5" />
    };
    return icons[type as keyof typeof icons] || <Users className="h-5 w-5" />;
  };

  const statusConfig = getStatusConfig(activity.status);
  const participationRate = activity.participants_registered > 0 
    ? Math.round((activity.participants_attended / activity.participants_registered) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-portal-purple to-blue-600 rounded-lg text-white">
              {getActivityTypeIcon(activity.activity_type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold">{activity.title}</span>
                <Badge className={statusConfig.color}>
                  <div className="flex items-center gap-1">
                    {statusConfig.icon}
                    {statusConfig.label}
                  </div>
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge variant="secondary" className="text-xs">
                  {getActivityTypeLabel(activity.activity_type)}
                </Badge>
                {activity.mandatory && (
                  <Badge variant="outline" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Obrigatória
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Detalhes completos da atividade de saúde mental
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Descrição */}
          {activity.description && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Descrição</h3>
              <p className="text-gray-600 leading-relaxed">{activity.description}</p>
            </div>
          )}

          <Separator />

          {/* Informações de Data e Local */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agendamento
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Data de Início</p>
                    <p className="text-gray-900">
                      {format(new Date(activity.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {activity.end_date && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Data de Término</p>
                      <p className="text-gray-900">
                        {format(new Date(activity.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}

                {activity.location && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Local</p>
                      <p className="text-gray-900">{activity.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Facilitador
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <User className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tipo</p>
                    <p className="text-gray-900">{getFacilitatorTypeLabel(activity.facilitator_type)}</p>
                  </div>
                </div>

                {activity.facilitator_name && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Nome</p>
                      <p className="text-gray-900">{activity.facilitator_name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 rounded-lg">
                    <Target className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Departamentos/Setores</p>
                    {loadingDepartments ? (
                      <p className="text-gray-600">Carregando...</p>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {departmentNames.map((name, index) => (
                          <Badge 
                            key={index}
                            variant={name === 'Todos os Setores' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estatísticas de Participação */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participação
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Inscritos</p>
                    <p className="text-2xl font-bold text-blue-900">{activity.participants_registered}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Presentes</p>
                    <p className="text-2xl font-bold text-green-900">{activity.participants_attended}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700">Taxa</p>
                    <p className="text-2xl font-bold text-purple-900">{participationRate}%</p>
                  </div>
                </div>
              </div>

              {activity.max_participants && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Users className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-700">Máximo</p>
                      <p className="text-2xl font-bold text-amber-900">{activity.max_participants}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Avaliações */}
          {(activity.satisfaction_score || activity.effectiveness_score) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Avaliações</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activity.satisfaction_score && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700">Satisfação</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {activity.satisfaction_score}/10
                          </p>
                        </div>
                        <div className="text-blue-600">
                          <Award className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activity.effectiveness_score && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700">Efetividade</p>
                          <p className="text-2xl font-bold text-green-900">
                            {activity.effectiveness_score}/10
                          </p>
                        </div>
                        <div className="text-green-600">
                          <Target className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Compliance */}
          {activity.compliance_requirement && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Compliance</h3>
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-900">{activity.compliance_requirement}</p>
                      <p className="text-sm text-amber-700">Requisito de compliance aplicável</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium">Criado em:</p>
                <p>{format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              </div>
              {activity.updated_at && (
                <div>
                  <p className="font-medium">Última atualização:</p>
                  <p>{format(new Date(activity.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {onManageParticipants && (
            <Button 
              variant="outline" 
              onClick={() => onManageParticipants(activity)}
            >
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Números
            </Button>
          )}
          {onEdit && (
            <Button 
              className="bg-portal-purple hover:bg-portal-purple-dark"
              onClick={() => onEdit(activity)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Editar Atividade
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewActivityDialog;
