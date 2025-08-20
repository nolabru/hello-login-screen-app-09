import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import AddActivityDialog from '@/components/dashboard/company/AddActivityDialog';
import ViewActivityDialog from '@/components/dashboard/company/ViewActivityDialog';
import CompleteActivityDialog from '@/components/dashboard/company/CompleteActivityDialog';
import QuickActivityDialog from '@/components/dashboard/company/QuickActivityDialog';
import EditActivityDialog from '@/components/dashboard/company/EditActivityDialog';
import { 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Target,
  Filter,
  Download,
  Eye,
  Edit2,
  UserCheck,
  Activity as ActivityIcon,
  Award,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Zap,
  MoreVertical,
  Trash2,
  AlertTriangle,
  Bell,
  Shield,
  TrendingDown,
  TrendingUp,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types
type CompanyActivity = Tables<'company_activities'>;

const CompanyActivities: React.FC = () => {
  const { toast } = useToast();
  
  // Estados
  const [activities, setActivities] = useState<CompanyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showQuickDialog, setShowQuickDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<CompanyActivity | null>(null);
  
  // Estados para estatísticas
  const [stats, setStats] = useState({
    total: 0,
    planejadas: 0,
    em_andamento: 0,
    concluidas: 0,
    participantes_total: 0,
    taxa_participacao: 0
  });

  // Estados para alertas
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchActivities(companyId);
      fetchAlerts(companyId);
      fetchDepartments(companyId);
    }
  }, [companyId]);

  const fetchActivities = async (companyId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_activities')
        .select('*')
        .eq('company_id', companyId)
        .order('start_date', { ascending: false });

      if (error) throw error;

      setActivities(data || []);
      calculateStats(data || []);
      
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar atividades',
        description: 'Não foi possível carregar a lista de atividades.'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (activities: CompanyActivity[]) => {
    const stats = {
      total: activities.length,
      planejadas: activities.filter(a => a.status === 'planejada').length,
      em_andamento: activities.filter(a => a.status === 'em_andamento').length,
      concluidas: activities.filter(a => a.status === 'concluida').length,
      participantes_total: activities.reduce((sum, a) => sum + a.participants_registered, 0),
      taxa_participacao: 0
    };

    const totalRegistered = activities.reduce((sum, a) => sum + a.participants_registered, 0);
    const totalAttended = activities.reduce((sum, a) => sum + a.participants_attended, 0);
    stats.taxa_participacao = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

    setStats(stats);
  };

  // Buscar alertas de saúde mental
  const fetchAlerts = async (companyId: string) => {
    setAlertsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'ativo')
        .order('triggered_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Se não há alertas reais, criar alertas de exemplo para demonstração
      const realAlerts = data || [];
      
      if (realAlerts.length === 0) {
        // Alertas de exemplo organizados por departamento
        const sampleAlerts = [
          {
            id: 'sample-1',
            company_id: companyId,
            alert_type: 'engagement_drop',
            severity: 6,
            affected_entity_type: 'department',
            affected_entity_id: 'dept-rh',
            title: 'Baixo Engajamento - RH',
            description: 'Taxa de participação em atividades de bem-estar abaixo de 60% no departamento de RH',
            trigger_metric: 'Taxa de Participação',
            current_value: 45,
            threshold_value: 60,
            trend: 'descending',
            status: 'ativo',
            triggered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-2', 
            company_id: companyId,
            alert_type: 'stress_increase',
            severity: 8,
            affected_entity_type: 'department',
            affected_entity_id: 'dept-ti',
            title: 'Aumento de Estresse - TI',
            description: 'Indicadores de estresse elevados detectados através do app Calma',
            trigger_metric: 'Nível de Estresse Médio',
            current_value: 8.2,
            threshold_value: 7.0,
            trend: 'ascending',
            status: 'ativo',
            triggered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-3',
            company_id: companyId,
            alert_type: 'burnout_risk',
            severity: 9,
            affected_entity_type: 'company',
            affected_entity_id: companyId,
            title: 'Risco de Burnout Geral',
            description: 'Aumento significativo de relatos de exaustão emocional em múltiplos departamentos',
            trigger_metric: 'Índice de Burnout',
            current_value: 7.8,
            threshold_value: 6.5,
            trend: 'ascending',
            status: 'ativo',
            triggered_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-4',
            company_id: companyId,
            alert_type: 'activity_shortage',
            severity: 5,
            affected_entity_type: 'department',
            affected_entity_id: 'dept-vendas',
            title: 'Falta de Atividades - Vendas',
            description: 'Departamento sem atividades de saúde mental há mais de 30 dias',
            trigger_metric: 'Dias sem Atividades',
            current_value: 35,
            threshold_value: 30,
            trend: 'ascending',
            status: 'ativo',
            triggered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-5',
            company_id: companyId,
            alert_type: 'low_app_usage',
            severity: 7,
            affected_entity_type: 'department',
            affected_entity_id: 'dept-marketing',
            title: 'Baixo Uso do App - Marketing',
            description: 'Apenas 30% dos colaboradores do marketing usaram o app Calma na última semana',
            trigger_metric: 'Taxa de Uso Semanal',
            current_value: 30,
            threshold_value: 50,
            trend: 'descending',
            status: 'ativo',
            triggered_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-6',
            company_id: companyId,
            alert_type: 'absenteeism_increase',
            severity: 8,
            affected_entity_type: 'department',
            affected_entity_id: 'dept-financeiro',
            title: 'Aumento de Absenteísmo - Financeiro',
            description: 'Taxa de absenteísmo subiu 15% no último mês no departamento financeiro',
            trigger_metric: 'Taxa de Absenteísmo',
            current_value: 12.5,
            threshold_value: 8.0,
            trend: 'ascending',
            status: 'ativo',
            triggered_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-7',
            company_id: companyId,
            alert_type: 'satisfaction_drop',
            severity: 4,
            affected_entity_type: 'company',
            affected_entity_id: companyId,
            title: 'Queda na Satisfação Geral',
            description: 'Pesquisa de clima mostra ligeira queda na satisfação dos colaboradores',
            trigger_metric: 'Índice de Satisfação',
            current_value: 7.2,
            threshold_value: 7.5,
            trend: 'descending',
            status: 'ativo',
            triggered_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          }
        ];
        setAlerts(sampleAlerts);
      } else {
        setAlerts(realAlerts);
      }
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
    } finally {
      setAlertsLoading(false);
    }
  };

  // Buscar departamentos
  const fetchDepartments = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_departments')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'ativo')
        .order('name');

      if (error) throw error;

      // Se não há departamentos reais, criar departamentos de exemplo
      const realDepartments = data || [];
      
      if (realDepartments.length === 0) {
        const sampleDepartments = [
          { id: 'dept-rh', name: 'Recursos Humanos', company_id: companyId, status: 'ativo' },
          { id: 'dept-ti', name: 'Tecnologia da Informação', company_id: companyId, status: 'ativo' },
          { id: 'dept-vendas', name: 'Vendas', company_id: companyId, status: 'ativo' },
          { id: 'dept-marketing', name: 'Marketing', company_id: companyId, status: 'ativo' },
          { id: 'dept-financeiro', name: 'Financeiro', company_id: companyId, status: 'ativo' }
        ];
        setDepartments(sampleDepartments);
      } else {
        setDepartments(realDepartments);
      }
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error);
    }
  };

  // Filtros
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    const matchesType = typeFilter === 'all' || activity.activity_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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

  const getStatusBadge = (status: string) => {
    const variants = {
      'planejada': { variant: 'secondary' as const, label: 'Planejada', color: 'bg-blue-100 text-blue-800' },
      'em_andamento': { variant: 'default' as const, label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
      'concluida': { variant: 'default' as const, label: 'Concluída', color: 'bg-green-100 text-green-800' },
      'cancelada': { variant: 'destructive' as const, label: 'Cancelada', color: 'bg-red-100 text-red-800' }
    };
    
    const config = variants[status as keyof typeof variants] || variants['planejada'];
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'planejada': <Clock className="h-4 w-4" />,
      'em_andamento': <PlayCircle className="h-4 w-4" />,
      'concluida': <CheckCircle2 className="h-4 w-4" />,
      'cancelada': <AlertCircle className="h-4 w-4" />
    };
    return icons[status as keyof typeof icons] || icons['planejada'];
  };

  const handleActivityAdded = () => {
    if (companyId) {
      fetchActivities(companyId);
    }
  };

  const handleViewActivity = (activity: CompanyActivity) => {
    setSelectedActivity(activity);
    setShowViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setShowViewDialog(false);
    setSelectedActivity(null);
  };

  const handleCompleteActivity = (activity: CompanyActivity) => {
    setSelectedActivity(activity);
    setShowCompleteDialog(true);
  };

  const handleCloseCompleteDialog = () => {
    setShowCompleteDialog(false);
    setSelectedActivity(null);
  };

  const handleActivityCompleted = () => {
    if (companyId) {
      fetchActivities(companyId);
    }
  };

  const handleEditActivity = (activity: CompanyActivity) => {
    setSelectedActivity(activity);
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedActivity(null);
  };

  const handleActivityUpdated = () => {
    if (companyId) {
      fetchActivities(companyId);
    }
  };

  // Função para renderizar botões com dropdown elegante
  const renderActionButtons = (activity: CompanyActivity) => {
    if (activity.status === 'planejada') {
      return (
        <div className="flex items-center gap-2">
          {/* Ação Primária - Finalizar */}
          <Button 
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleCompleteActivity(activity)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Finalizar
          </Button>
          
          {/* Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleViewActivity(activity)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Cancelar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    } else if (activity.status === 'concluida') {
      return (
        <div className="flex items-center gap-2">
          {/* Ação Primária - Visualizar */}
          <Button 
            variant="outline"
            size="sm"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => handleViewActivity(activity)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Visualizar
          </Button>
          
          {/* Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    } else if (activity.status === 'cancelada') {
      return (
        <div className="flex items-center gap-2">
          {/* Ação Primária - Reativar */}
          <Button 
            variant="outline"
            size="sm"
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <PlayCircle className="h-4 w-4 mr-1" />
            Reativar
          </Button>
          
          {/* Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleViewActivity(activity)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    } else {
      // Status em_andamento ou outros
      return (
        <div className="flex items-center gap-2">
          {/* Ação Primária - Visualizar */}
          <Button 
            variant="outline"
            size="sm"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => handleViewActivity(activity)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Visualizar
          </Button>
          
          {/* Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCompleteActivity(activity)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalizar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <CompanyDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando atividades...</p>
        </div>
      </CompanyDashboardLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gestão de Atividades | Portal Calma</title>
      </Helmet>
      <CompanyDashboardLayout>
        <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
          {/* Header Refinado */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-3">
                  <div className="p-2 bg-calma-blue-light rounded-lg">
                    <ActivityIcon className="h-6 w-6 text-calma" />
                  </div>
                  Gestão de Atividades
                </h1>
                <p className="text-sm text-gray-500">
                  Gerencie workshops, palestras e intervenções de saúde mental
                </p>
              </div>
              
              {/* Busca Rápida e Ações */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Buscar atividades..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowQuickDialog(true)}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Registro Rápido
                </Button>
                
                <Button 
                  className="bg-calma hover:bg-calma-dark"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Atividade
                </Button>
              </div>
            </div>

            {/* KPIs Essenciais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-white shadow-sm border border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <ActivityIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Total de Atividades</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <p className="text-xs text-gray-500 mt-1">atividades cadastradas</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-white shadow-sm border border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Concluídas</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.concluidas}</div>
                  <p className="text-xs text-gray-500 mt-1">atividades finalizadas</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-white shadow-sm border border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Participantes</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{stats.participantes_total}</div>
                  <p className="text-xs text-gray-500 mt-1">total registrados</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-white shadow-sm border border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Participação</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">{stats.taxa_participacao}%</div>
                  <p className="text-xs text-gray-500 mt-1">taxa de comparecimento</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Alertas de Saúde Mental */}
          {(
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        Alertas de Saúde Mental
                      </h2>
                      <p className="text-xs text-gray-500">
                        Monitoramento em tempo real da saúde mental organizacional
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
                      {alerts.filter(a => a.severity >= 8).length} Críticos
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                      {alerts.filter(a => a.severity >= 5 && a.severity < 8).length} Atenção
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      {alerts.filter(a => a.severity < 5).length} Informativos
                    </Badge>
                  </div>
                </div>

                {/* Dashboard de Resumo dos Alertas */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-red-600 font-medium">Alertas Críticos</p>
                        <p className="text-2xl font-bold text-red-700">
                          {alerts.filter(a => a.severity >= 8).length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-yellow-600 font-medium">Requerem Atenção</p>
                        <p className="text-2xl font-bold text-yellow-700">
                          {alerts.filter(a => a.severity >= 5 && a.severity < 8).length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Bell className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Informativos</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {alerts.filter(a => a.severity < 5).length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-medium">Departamentos Afetados</p>
                        <p className="text-2xl font-bold text-green-700">
                          {new Set(alerts.filter(a => a.affected_entity_type === 'department').map(a => a.affected_entity_id)).size}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="geral" className="w-full">
                  <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-gray-100 rounded-xl mb-6">
                    <TabsTrigger value="geral" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Alertas Gerais ({alerts.filter(a => a.affected_entity_type === 'company').length})
                    </TabsTrigger>
                    <TabsTrigger value="departamentos" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Por Departamento ({alerts.filter(a => a.affected_entity_type === 'department').length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="geral" className="space-y-4">
                    {alerts.filter(a => a.affected_entity_type === 'company').map((alert) => (
                      <Card key={alert.id} className={`border-l-4 ${
                        alert.severity >= 8 ? 'border-l-red-500 bg-red-50' :
                        alert.severity >= 5 ? 'border-l-yellow-500 bg-yellow-50' :
                        'border-l-blue-500 bg-blue-50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${
                                  alert.severity >= 8 ? 'bg-red-500' :
                                  alert.severity >= 5 ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                }`}>
                                  {alert.severity >= 8 ? (
                                    <AlertTriangle className="h-4 w-4 text-white" />
                                  ) : alert.severity >= 5 ? (
                                    <AlertCircle className="h-4 w-4 text-white" />
                                  ) : (
                                    <Bell className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                                  <Badge variant="outline" className={`text-xs ${
                                    alert.severity >= 8 ? 'border-red-200 text-red-700 bg-red-50' :
                                    alert.severity >= 5 ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                    'border-blue-200 text-blue-700 bg-blue-50'
                                  }`}>
                                    {alert.severity >= 8 ? 'Crítico' :
                                     alert.severity >= 5 ? 'Atenção' : 'Informativo'}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                {alert.description}
                              </p>
                              
                              {alert.trigger_metric && (
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Métrica:</span>
                                    <span>{alert.trigger_metric}</span>
                                  </div>
                                  {alert.current_value && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Valor Atual:</span>
                                      <span className="font-medium text-gray-900">{alert.current_value}</span>
                                    </div>
                                  )}
                                  {alert.threshold_value && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Limite:</span>
                                      <span>{alert.threshold_value}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    {alert.trend === 'descending' ? (
                                      <TrendingDown className="h-3 w-3 text-red-500" />
                                    ) : (
                                      <TrendingUp className="h-3 w-3 text-green-500" />
                                    )}
                                    <span className="capitalize">{alert.trend === 'descending' ? 'Piorando' : 'Melhorando'}</span>
                                  </div>
                                </div>
                              )}

                              <div className="text-xs text-gray-400">
                                Disparado em {new Date(alert.triggered_at).toLocaleString('pt-BR')}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-6">
                              {alert.status === 'ativo' && (
                                <>
                                  <Button size="sm" variant="outline" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Reconhecer
                                  </Button>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Ver Ação
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {alerts.filter(a => a.affected_entity_type === 'company').length === 0 && (
                      <div className="text-center py-12">
                        <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Shield className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Nenhum alerta geral ativo
                        </h3>
                        <p className="text-gray-600">
                          Todos os indicadores gerais da empresa estão dentro dos parâmetros normais
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="departamentos" className="space-y-4">
                    {departments.map((dept) => {
                      const deptAlerts = alerts.filter(a => a.affected_entity_type === 'department' && a.affected_entity_id === dept.id);
                      if (deptAlerts.length === 0) return null;

                      return (
                        <div key={dept.id} className="space-y-3">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-600" />
                            {dept.name} ({deptAlerts.length} alertas)
                          </h3>
                          
                          {deptAlerts.map((alert) => (
                            <Card key={alert.id} className={`border-l-4 ml-6 ${
                              alert.severity >= 8 ? 'border-l-red-500 bg-red-50' :
                              alert.severity >= 5 ? 'border-l-yellow-500 bg-yellow-50' :
                              'border-l-blue-500 bg-blue-50'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className={`p-1.5 rounded ${
                                        alert.severity >= 8 ? 'bg-red-500' :
                                        alert.severity >= 5 ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                      }`}>
                                        {alert.severity >= 8 ? (
                                          <AlertTriangle className="h-3 w-3 text-white" />
                                        ) : alert.severity >= 5 ? (
                                          <AlertCircle className="h-3 w-3 text-white" />
                                        ) : (
                                          <Bell className="h-3 w-3 text-white" />
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-900 text-sm">{alert.title}</h4>
                                        <p className="text-xs text-gray-500">{alert.description}</p>
                                      </div>
                                    </div>

                                    {alert.trigger_metric && (
                                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                        <span><strong>Métrica:</strong> {alert.trigger_metric}</span>
                                        {alert.current_value && (
                                          <span><strong>Atual:</strong> {alert.current_value}</span>
                                        )}
                                        <div className="flex items-center gap-1">
                                          {alert.trend === 'descending' ? (
                                            <TrendingDown className="h-3 w-3 text-red-500" />
                                          ) : (
                                            <TrendingUp className="h-3 w-3 text-green-500" />
                                          )}
                                          <span className="capitalize">{alert.trend === 'descending' ? 'Piorando' : 'Melhorando'}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1 ml-4">
                                    <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      );
                    })}

                    {alerts.filter(a => a.affected_entity_type === 'department').length === 0 && (
                      <div className="text-center py-12">
                        <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Shield className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Nenhum alerta por departamento
                        </h3>
                        <p className="text-gray-600">
                          Todos os departamentos estão com indicadores saudáveis
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Header de Atividades com Filtros */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            {/* Filtros Integrados */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filtros:</span>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="planejada">Planejadas</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluídas</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="palestra">Palestra</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                  <SelectItem value="grupo_apoio">Grupo de Apoio</SelectItem>
                </SelectContent>
              </Select>

              {(statusFilter !== 'all' || typeFilter !== 'all' || searchTerm) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Lista de Atividades */}
          {filteredActivities.length === 0 ? (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                  <ActivityIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activities.length === 0 ? 'Nenhuma atividade cadastrada' : 'Nenhuma atividade encontrada'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {activities.length === 0 
                    ? 'Comece criando sua primeira atividade de saúde mental para seus funcionários'
                    : 'Tente ajustar os filtros para encontrar o que procura'
                  }
                </p>
                {activities.length === 0 && (
                  <Button 
                    className="bg-calma hover:bg-calma-dark"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Atividade
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <Card key={activity.id} className="bg-white hover:shadow-lg transition-all duration-200 border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Ícone de Status com gradiente dinâmico */}
                          <div className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-sm ${
                            activity.status === 'concluida' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                            activity.status === 'em_andamento' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                            activity.status === 'cancelada' ? 'bg-gradient-to-br from-red-400 to-red-600' :
                            'bg-gradient-to-br from-blue-400 to-blue-600'
                          }`}>
                            <div className="text-white">
                              {getStatusIcon(activity.status)}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            {/* Header da Atividade */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-calma transition-colors">
                                  {activity.title}
                                </h3>
                                {getStatusBadge(activity.status)}
                                {activity.mandatory && (
                                  <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
                                    <Award className="h-3 w-3 mr-1" />
                                    Obrigatória
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                  {getActivityTypeLabel(activity.activity_type)}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Descrição */}
                            <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                              {activity.description}
                            </p>
                            
                            {/* Informações Compactas */}
                            <div className="flex flex-wrap gap-3 mb-3 max-w-4xl">
                              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 min-w-fit">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span className="font-medium whitespace-nowrap">
                                  {new Date(activity.start_date).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 min-w-fit">
                                <Users className="h-4 w-4 text-purple-500" />
                                <span className="font-medium whitespace-nowrap">
                                  {activity.participants_attended}/{activity.participants_registered} pessoas
                                </span>
                              </div>
                              
                              {activity.location && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 min-w-fit max-w-xs">
                                  <MapPin className="h-4 w-4 text-green-500" />
                                  <span className="font-medium truncate">{activity.location}</span>
                                </div>
                              )}
                              
                              {/* Facilitador inline */}
                              {activity.facilitator_name && (
                                <div className="flex items-center gap-2 text-sm bg-calma-blue-light rounded-lg px-3 py-2 min-w-fit max-w-sm">
                                  <UserCheck className="h-4 w-4 text-calma" />
                                  <span className="text-gray-700">
                                    <span className="font-medium text-calma">Facilitador:</span> {activity.facilitator_name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Botões de Ação Refinados */}
                      <div className="flex flex-col gap-2 ml-6">
                        {renderActionButtons(activity)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Dialog para adicionar atividade */}
        {companyId && (
          <AddActivityDialog
            isOpen={showAddDialog}
            onClose={() => setShowAddDialog(false)}
            onActivityAdded={handleActivityAdded}
            companyId={companyId}
          />
        )}

        {/* Dialog para visualizar atividade */}
        <ViewActivityDialog
          isOpen={showViewDialog}
          onClose={handleCloseViewDialog}
          activity={selectedActivity}
        />

        {/* Dialog para finalizar atividade */}
        <CompleteActivityDialog
          isOpen={showCompleteDialog}
          onClose={handleCloseCompleteDialog}
          activity={selectedActivity}
          onActivityCompleted={handleActivityCompleted}
        />

        {/* Dialog para registro rápido */}
        {companyId && (
          <QuickActivityDialog
            isOpen={showQuickDialog}
            onClose={() => setShowQuickDialog(false)}
            onActivityAdded={handleActivityAdded}
            companyId={companyId}
          />
        )}

        {/* Dialog para editar atividade */}
        <EditActivityDialog
          isOpen={showEditDialog}
          onClose={handleCloseEditDialog}
          activity={selectedActivity}
          onActivityUpdated={handleActivityUpdated}
        />
      </CompanyDashboardLayout>
    </>
  );
};

export default CompanyActivities;
