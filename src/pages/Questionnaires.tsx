import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// Tabs removed - using unified page structure
import { AuthService } from '@/services/authService';
import {
  getCompanyQuestionnaireMetrics,
  getQuestionnaireResponses,
  getDefaultQuestionnaire,
  triggerQuestionnaire,
  getRealTimeStats,
  getQuestionnaireSchedule,
  getCustomQuestionnaireTemplates,
  createCustomQuestionnaire,
  getAllCompanyQuestionnaires,
  updateQuestionnaireStatus,
  updateQuestionnaire,
  deleteQuestionnaire,
  getCompanyDepartments,
  getQuestionnaireDetailedResponses,
  type QuestionnaireMetrics,
  type QuestionnaireResponse,
  type DepartmentResponseData,
  type Questionnaire,
  type RealTimeStats,
  type CustomQuestionnaireTemplate,
  type QuestionOption
} from '../services/questionnaireService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ClipboardList,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  Eye,
  Calendar,
  Activity,
  Target,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Copy,
  FileText,
  Heart,
  Brain,
  BarChart3,
  PieChart as PieChartIcon,
  Sparkles,
  Award,
  X,
  CalendarX
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import QuestionEditor from '@/components/QuestionEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Questionnaires: React.FC = () => {
  const [metrics, setMetrics] = useState<QuestionnaireMetrics | null>(null);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Enhanced functionality state
  const [defaultQuestionnaire, setDefaultQuestionnaire] = useState<Questionnaire | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null);
  const [schedule, setSchedule] = useState<{ upcoming: any[], active: any[] } | null>(null);
  const [showQuestionnairePreview, setShowQuestionnairePreview] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [selectedTargetDepartments, setSelectedTargetDepartments] = useState<string[]>([]);

  // Custom questionnaires state
  const [customTemplates, setCustomTemplates] = useState<CustomQuestionnaireTemplate[]>([]);
  const [companyQuestionnaires, setCompanyQuestionnaires] = useState<Questionnaire[]>([]);
  const [showCustomQuestionnaireModal, setShowCustomQuestionnaireModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CustomQuestionnaireTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customTargetDepartment, setCustomTargetDepartment] = useState<string>('all');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState<string | null>(null);

  // New states for debugging and improved UX
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<'template' | 'manual'>('template');
  const [manualQuestions, setManualQuestions] = useState<QuestionOption[]>([]);

  // Edit questionnaire states
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Responses modal states
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [selectedQuestionnaireForResponses, setSelectedQuestionnaireForResponses] = useState<Questionnaire | null>(null);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<Array<{
    question: string;
    responses: number[];
    averageScore: number;
    medianScore: number;
    modeScore: number;
    standardDeviation: number;
    scoreDistribution: { [key: number]: number };
  }>>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [detailedStats, setDetailedStats] = useState<{
    totalResponses: number;
    averageScore: number;
    departmentBreakdown: Array<{ department: string; totalResponses: number; averageScore: number }>;
    responseTimeline: Array<{ date: string; responses: number }>;
  } | null>(null);

  // Company departments state
  const [companyDepartments, setCompanyDepartments] = useState<{ id: string; name: string; }[]>([]);

  // Filtros e paginação
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrar questionários por status
  const filteredQuestionnaires = companyQuestionnaires.filter(questionnaire => {
    if (statusFilter === 'all') return true;
    return questionnaire.status === statusFilter;
  });

  // Paginação
  const totalPages = Math.ceil(filteredQuestionnaires.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestionnaires = filteredQuestionnaires.slice(startIndex, startIndex + itemsPerPage);

  // Reset página quando filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const initializeComponent = async () => {
      const validCompanyId = await AuthService.getValidatedCompanyId();
      if (validCompanyId) {
        setCompanyId(validCompanyId);
        fetchQuestionnaireData(validCompanyId);
        fetchEnhancedData(validCompanyId);
      }
    };

    initializeComponent();
  }, [selectedDepartment, selectedPeriod]);

  useEffect(() => {
    // Set up real-time polling for stats
    if (companyId) {
      const interval = setInterval(() => {
        fetchRealTimeStats(companyId);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [companyId]);

  const fetchQuestionnaireData = async (companyIdStr: string) => {
    try {
      setLoading(true);
      const [metricsData, responsesData] = await Promise.all([
        getCompanyQuestionnaireMetrics(),
        getQuestionnaireResponses(
          companyIdStr,
          undefined,
          selectedDepartment === 'all' ? undefined : selectedDepartment
        )
      ]);

      setMetrics(metricsData);
      setResponses(responsesData);
    } catch (error) {
      console.error('Error fetching questionnaire data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnhancedData = async (companyIdStr: string) => {
    try {
      console.log('🔄 fetchEnhancedData - Starting data fetch for company:', companyIdStr);

      // Set loading for templates specifically
      setTemplatesLoading(true);
      setTemplatesError(null);

      const [defaultQuest, scheduleData, templates, companyQuests, departments] = await Promise.all([
        getDefaultQuestionnaire(companyIdStr),
        getQuestionnaireSchedule(companyIdStr),
        getCustomQuestionnaireTemplates().then(result => {
          console.log('📝 Templates loaded:', result?.length || 0, 'templates');
          console.log('📝 Template names:', result?.map(t => t.name) || []);
          return result;
        }),
        getAllCompanyQuestionnaires(companyIdStr),
        getCompanyDepartments(companyIdStr).then(result => {
          console.log('🏢 Departments loaded:', result?.length || 0, 'departments');
          return result;
        })
      ]);

      console.log('✅ All enhanced data fetched successfully');

      setDefaultQuestionnaire(defaultQuest);
      setSchedule(scheduleData);
      setCustomTemplates(templates || []);
      setCompanyQuestionnaires(companyQuests);
      setCompanyDepartments(departments || []);
      setTemplatesLoading(false);

      await fetchRealTimeStats(companyIdStr);
    } catch (error) {
      console.error('❌ Error fetching enhanced data:', error);
      setTemplatesError('Erro ao carregar templates. Tente novamente.');
      setTemplatesLoading(false);
      setCustomTemplates([]); // Fallback to empty array
    }
  };

  const fetchRealTimeStats = async (companyIdStr: string) => {
    try {
      const stats = await getRealTimeStats(companyIdStr);
      setRealTimeStats(stats);
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
    }
  };

  const handleTriggerQuestionnaire = async () => {
    if (!defaultQuestionnaire || !companyId) return;

    setTriggering(true);
    try {
      const success = await triggerQuestionnaire(
        defaultQuestionnaire.id,
        selectedTargetDepartments.length > 0 ? selectedTargetDepartments : undefined
      );

      if (success) {
        alert('Questionário enviado com sucesso!');
        // Refresh data
        await fetchEnhancedData(companyId);
        await fetchQuestionnaireData(companyId);
      } else {
        alert('Erro ao enviar questionário. Tente novamente.');
      }
    } catch (error) {
      console.error('Error triggering questionnaire:', error);
      alert('Erro ao enviar questionário. Tente novamente.');
    } finally {
      setTriggering(false);
    }
  };

  const handleCreateCustomQuestionnaire = async () => {
    if (!companyId) return;
    if (createMode === 'template' && !selectedTemplate) return;
    if (createMode === 'manual' && (manualQuestions.length === 0 || !customTitle)) return;


    setCreatingCustom(true);
    try {
      const templateForCreation = createMode === 'template'
        ? selectedTemplate!
        : {
          name: customTitle,
          description: customDescription,
          category: 'Personalizado',
          questions: manualQuestions,
        };

      const success = await createCustomQuestionnaire(
        companyId,
        templateForCreation,
        customTitle || undefined,
        customDescription || undefined,
        customTargetDepartment === 'all' ? undefined : customTargetDepartment || undefined,
        isAnonymous,
        startDate || undefined,
        endDate || undefined
      );

      if (success) {
        alert('Questionário personalizado criado com sucesso!');
        setShowCustomQuestionnaireModal(false);
        setSelectedTemplate(null);
        setCustomTitle('');
        setCustomDescription('');
        setCustomTargetDepartment('all');
        await fetchEnhancedData(companyId);
        await fetchQuestionnaireData(companyId);
      } else {
        alert('Erro ao criar questionário. Tente novamente.');
      }
    } catch (error) {
      console.error('Error creating custom questionnaire:', error);
      alert('Erro ao criar questionário. Tente novamente.');
    } finally {
      setCreatingCustom(false);
    }
  };

  const handleEditQuestionnaire = (questionnaire: Questionnaire) => {
    setEditingQuestionnaire(questionnaire);
    setCustomTitle(questionnaire.title);
    setCustomDescription(questionnaire.description || '');
    setCustomTargetDepartment(questionnaire.target_department || 'all');
    setIsAnonymous(questionnaire.is_anonymous);
    setManualQuestions(questionnaire.questions);
    setShowEditModal(true);
  };

  const handleUpdateQuestionnaire = async () => {
    if (!editingQuestionnaire) return;

    setCreatingCustom(true);
    try {
      const success = await updateQuestionnaire(editingQuestionnaire.id, {
        title: customTitle,
        description: customDescription,
        target_department: customTargetDepartment === 'all' ? null : customTargetDepartment || null,
        is_anonymous: isAnonymous,
        questions: manualQuestions,
      });

      if (success) {
        alert('Questionário atualizado com sucesso!');
        setShowEditModal(false);
        setEditingQuestionnaire(null);
        setCustomTitle('');
        setCustomDescription('');
        setCustomTargetDepartment('all');
        setIsAnonymous(false);
        setStartDate('');
        setEndDate('');
        setManualQuestions([]);
        if (companyId) {
          await fetchEnhancedData(companyId);
          await fetchQuestionnaireData(companyId);
        }
      } else {
        alert('Erro ao atualizar questionário. Tente novamente.');
      }
    } catch (error) {
      console.error('Error updating questionnaire:', error);
      alert('Erro ao atualizar questionário. Tente novamente.');
    } finally {
      setCreatingCustom(false);
    }
  };

  const handleDeleteQuestionnaire = async (questionnaireId: string) => {
    if (!confirm('Tem certeza que deseja excluir este questionário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const success = await deleteQuestionnaire(questionnaireId);
      if (success) {
        alert('Questionário excluído com sucesso!');
        if (companyId) {
          await fetchEnhancedData(companyId);
          await fetchQuestionnaireData(companyId);
        }
      } else {
        alert('Erro ao excluir questionário.');
      }
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      alert('Erro ao excluir questionário.');
    }
  };

  const handleUpdateQuestionnaireStatus = async (questionnaireId: string, newStatus: 'active' | 'inactive' | 'completed') => {
    try {
      const success = await updateQuestionnaireStatus(questionnaireId, newStatus);
      if (success) {
        alert(`Status do questionário atualizado para ${newStatus === 'active' ? 'ativo' : newStatus === 'inactive' ? 'inativo' : 'completo'}!`);
        if (companyId) {
          await fetchEnhancedData(companyId);
          await fetchQuestionnaireData(companyId);
        }
      } else {
        alert('Erro ao atualizar status do questionário.');
      }
    } catch (error) {
      console.error('Error updating questionnaire status:', error);
      alert('Erro ao atualizar status do questionário.');
    }
  };

  const handleViewResponses = async (questionnaire: Questionnaire) => {
    try {
      setSelectedQuestionnaireForResponses(questionnaire);
      setShowResponsesModal(true);
      setResponsesLoading(true);

      // Buscar dados reais do banco de dados
      const detailedResponses = await getQuestionnaireDetailedResponses(questionnaire.id);

      if (detailedResponses.totalResponses > 0) {
        // Converter dados para o formato esperado pela UI
        const formattedResponses = detailedResponses.responsesByQuestion.map(q => ({
          question: q.questionText,
          responses: q.responses,
          averageScore: q.averageScore,
          medianScore: q.medianScore,
          modeScore: q.modeScore,
          standardDeviation: q.standardDeviation,
          scoreDistribution: q.scoreDistribution
        }));

        setQuestionnaireResponses(formattedResponses);
        setDetailedStats({
          totalResponses: detailedResponses.totalResponses,
          averageScore: detailedResponses.averageScore,
          departmentBreakdown: detailedResponses.departmentBreakdown,
          responseTimeline: detailedResponses.responseTimeline
        });
      } else {
        // Se não há respostas, mostrar mensagem informativa
        setQuestionnaireResponses([]);
        setDetailedStats(null);
      }

      setResponsesLoading(false);
    } catch (error) {
      console.error('Error loading responses:', error);
      setResponsesLoading(false);
      // Em caso de erro, mostrar mensagem amigável
      setQuestionnaireResponses([]);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'satisfação':
        return <Heart className="h-4 w-4" />;
      case 'clima':
        return <Users className="h-4 w-4" />;
      case 'saúde mental':
        return <Brain className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'satisfação':
        return 'bg-pink-100 text-pink-700';
      case 'clima':
        return 'bg-blue-100 text-blue-700';
      case 'saúde mental':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };



  if (loading) {
    return (
      <CompanyDashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </CompanyDashboardLayout>
    );
  }

  if (!metrics) {
    return (
      <CompanyDashboardLayout>
        <div className="p-6">
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h2>
            <p className="text-gray-600">Não foi possível carregar os dados dos questionários.</p>
            <Button
              onClick={() => companyId && fetchQuestionnaireData(companyId)}
              className="mt-4 bg-amber-600 hover:bg-amber-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </CompanyDashboardLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Questionários de Bem-Estar - Calma Portal</title>
      </Helmet>
      <CompanyDashboardLayout>
        <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
          {/* NOVA ESTRUTURA LIMPA E INTUITIVA */}
          <div className="w-full space-y-8">

            {/* SEÇÃO 1: MÉTRICAS UNIFICADAS + ANALYTICS */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard de Questionários</h2>
                  <p className="text-gray-600">Métricas em tempo real e analytics completos</p>
            </div>
          </div>

              {/* Grid de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Métricas principais */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {realTimeStats ? realTimeStats.totalActive : '0'}
                  </div>
                    <div className="text-sm text-gray-600">Questionários Ativos</div>
              </CardContent>
            </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {realTimeStats ? realTimeStats.totalResponses : '0'}
                  </div>
                    <div className="text-sm text-gray-600">Total de Respostas</div>
              </CardContent>
            </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600 mb-1">
                      {realTimeStats ? realTimeStats.responseRate.toFixed(1) : '0'}%
                  </div>
                    <div className="text-sm text-gray-600">Taxa de Resposta</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                  {metrics.averageCompletionRate.toFixed(1)}%
                </div>
                    <div className="text-sm text-gray-600">Taxa de Conclusão</div>
              </CardContent>
            </Card>
                  </div>

              {/* Analytics Rápidos */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Performance dos Questionários
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Última resposta</span>
                        <span className="text-sm font-medium">
                  {responses.length > 0
                    ? new Date(responses[0].created_at).toLocaleDateString('pt-BR')
                    : 'N/A'
                  }
                        </span>
                </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Respostas hoje</span>
                        <span className="text-sm font-medium">{responses.length}</span>
                      </div>
                </div>
              </CardContent>
            </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-purple-600" />
                      Status dos Questionários
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ativos</span>
                        <Badge variant="default" className="bg-green-100 text-green-700">
                          {companyQuestionnaires.filter(q => q.status === 'active').length}
                        </Badge>
                        </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Inativos</span>
                        <Badge variant="secondary">
                          {companyQuestionnaires.filter(q => q.status === 'inactive').length}
                        </Badge>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
                        </div>

            {/* SEÇÃO 2: TABELA DE QUESTIONÁRIOS + CRIAR NOVO */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Header com título e botão de criar */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                    <ClipboardList className="h-5 w-5 text-amber-600" />
                        </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Questionários da Empresa</h2>
                    <p className="text-sm text-gray-600">Gerencie e monitore todos os questionários</p>
                      </div>
                      </div>

                {/* Botão de criar em destaque */}
                <Button
                  onClick={() => setShowCustomQuestionnaireModal(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg px-6 py-3 rounded-xl font-medium"
                  size="default"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Questionário
                </Button>
                        </div>

              {/* Filtros e paginação */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Status:</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                        className="text-sm border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                      </select>
                          </div>

                    <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border">
                      {filteredQuestionnaires.length} de {companyQuestionnaires.length} questionários
                    </div>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg"
                            >
                        Anterior
                            </Button>
                      <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border">
                        Página {currentPage} de {totalPages}
                      </span>
                            <Button
                        variant="outline"
                              size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-lg"
                      >
                        Próximo
                            </Button>
                          </div>
                                      )}
                                    </div>
                                  </div>

              {/* Conteúdo da tabela */}
              <div className="p-6">
                {filteredQuestionnaires.length > 0 ? (
                    <div className="space-y-4">
                    {paginatedQuestionnaires.map((questionnaire) => (
                        <div key={questionnaire.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-800">{questionnaire.title}</h4>
                              <p className="text-sm text-gray-600">{questionnaire.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={questionnaire.status === 'active' ? 'default' : 'secondary'}
                                className={questionnaire.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                              >
                                {questionnaire.status === 'active' ? 'Ativo' : 'Inativo'}
                              </Badge>
                            {questionnaire.is_anonymous && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                Anônimo
                              </Badge>
                            )}
                              <div className="flex gap-1">
                              <Button
                                onClick={() => handleViewResponses(questionnaire)}
                                variant="outline"
                                size="sm"
                                className="text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                              >
                                <BarChart3 className="h-4 w-4" />
                                Respostas
                              </Button>
                              <Button
                                onClick={() => handleEditQuestionnaire(questionnaire)}
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                                <Button
                                  onClick={() => handleUpdateQuestionnaireStatus(
                                    questionnaire.id,
                                    questionnaire.status === 'active' ? 'inactive' : 'active'
                                  )}
                                  variant="outline"
                                  size="sm"
                                >
                                  {questionnaire.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                                <Button
                                  onClick={() => handleDeleteQuestionnaire(questionnaire.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span>{questionnaire.questions.length} perguntas</span>
                            {questionnaire.start_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Início: {new Date(questionnaire.start_date).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            {questionnaire.end_date && (
                              <span className="flex items-center gap-1">
                                <CalendarX className="h-3 w-3" />
                                Fim: {new Date(questionnaire.end_date).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                            <span>Criado em {new Date(questionnaire.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhum questionário criado ainda</p>
                      <Button
                        onClick={() => setShowCustomQuestionnaireModal(true)}
                        className="mt-3 bg-amber-600 hover:bg-amber-700"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Questionário
                      </Button>
                    </div>
                  )}
                    </div>
                      </div>
                    </div>
        </div>

        {/* Modal para Criar Questionário Personalizado */}
        <Dialog open={showCustomQuestionnaireModal} onOpenChange={setShowCustomQuestionnaireModal}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-xl p-6 -m-6 mb-6 border-b border-amber-100">
              <DialogTitle className="flex items-center gap-3 text-2xl text-gray-800">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                Criar Novo Questionário
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base mt-2">
                Escolha entre usar um template pré-definido ou criar um questionário personalizado do zero.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* DEBUG: Estado de Loading e Erro */}
              {(templatesLoading || templatesError) && (
                <div className="mb-4 p-4 rounded-lg border">
                  {templatesLoading && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">Carregando templates...</span>
                    </div>
                  )}
                  {templatesError && (
                    <div className="flex items-center gap-3 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{templatesError}</span>
                      <Button
                        onClick={() => companyId && fetchEnhancedData(companyId)}
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Tentar Novamente
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Seleção de Modo de Criação */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Como deseja criar o questionário?
                </Label>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Button
                    onClick={() => setCreateMode('template')}
                    variant={createMode === 'template' ? 'default' : 'outline'}
                    className={`h-auto p-4 flex flex-col items-center gap-2 ${createMode === 'template' ? 'bg-amber-600 hover:bg-amber-700' : ''
                      }`}
                  >
                    <FileText className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Usar Template</div>
                      <div className="text-xs opacity-75">Modelos pré-definidos</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setCreateMode('manual')}
                    variant={createMode === 'manual' ? 'default' : 'outline'}
                    className={`h-auto p-4 flex flex-col items-center gap-2 ${createMode === 'manual' ? 'bg-amber-600 hover:bg-amber-700' : ''
                      }`}
                  >
                    <Edit3 className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Criar do Zero</div>
                      <div className="text-xs opacity-75">Perguntas personalizadas</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Conteúdo baseado no modo selecionado */}
              {createMode === 'template' && (
                <>
                  {/* Seleção de Template */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Escolha um template:
                    </Label>
                    {customTemplates.length === 0 && !templatesLoading && !templatesError ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Nenhum template disponível</p>
                        <p className="text-sm text-gray-400">Tente criar um questionário do zero</p>
                        <Button
                          onClick={() => setCreateMode('manual')}
                          variant="outline"
                          size="sm"
                          className="mt-3"
                        >
                          Criar do Zero
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {customTemplates.map((template, index) => (
                          <div
                            key={index}
                            onClick={() => setSelectedTemplate(template)}
                            className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${selectedTemplate?.name === template.name
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                                {getCategoryIcon(template.category)}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800">{template.name}</h4>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getCategoryColor(template.category)}`}
                                >
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{template.questions.length} perguntas</span>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowTemplatePreview(
                                    showTemplatePreview === template.name ? null : template.name
                                  );
                                }}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                {showTemplatePreview === template.name ? 'Ocultar' : 'Preview'}
                              </Button>
                            </div>

                            {/* Preview do Template */}
                            {showTemplatePreview === template.name && (
                              <div className="mt-4 pt-4 border-t border-gray-200 max-h-48 overflow-y-auto">
                                <h5 className="font-medium text-gray-700 mb-2 text-sm">Perguntas do Template:</h5>
                                <div className="space-y-2">
                                  {template.questions.map((question, qIndex) => (
                                    <div key={qIndex} className="bg-gray-50 p-2 rounded text-xs">
                                      <p className="font-medium text-gray-800">
                                        {qIndex + 1}. {question.question}
                                      </p>
                                      <div className="flex gap-1 mt-1">
                                        <span className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs">
                                          {question.type === 'scale' ? 'Escala' :
                                            question.type === 'text' ? 'Texto' : 'Múltipla Escolha'}
                                        </span>
                                        {question.required && (
                                          <span className="bg-red-100 text-red-700 px-1 py-0.5 rounded text-xs">
                                            Obrigatória
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Criação Manual */}
              {createMode === 'manual' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Criar Questionário Personalizado
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="manualTitle" className="text-sm font-medium text-gray-700">
                        Título do Questionário
                      </Label>
                      <Input
                        id="manualTitle"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Ex: Avaliação de Bem-estar Agosto 2024"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="manualTargetDepartment" className="text-sm font-medium text-gray-700">
                        Departamento Alvo (Opcional)
                      </Label>
                      <Select value={customTargetDepartment} onValueChange={setCustomTargetDepartment}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos os departamentos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Todos os departamentos</SelectItem>
                          {[
                            { value: "RH", label: "Recursos Humanos" },
                            { value: "TI", label: "Tecnologia da Informação" },
                            { value: "Financeiro", label: "Financeiro" },
                            { value: "Vendas", label: "Vendas" },
                            { value: "Marketing", label: "Marketing" },
                            { value: "Operações", label: "Operações" },
                          ].map((dep) => (
                            <SelectItem key={dep.value} value={dep.value}>{dep.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="manualDescription" className="text-sm font-medium text-gray-700">
                      Descrição do Questionário
                    </Label>
                    <Textarea
                      id="manualDescription"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Descreva o objetivo e contexto deste questionário..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  {/* Checkbox Anônimo para Modo Manual */}
                  <div className="pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAnonymousManual"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(Boolean(checked))}
                      />
                      <label htmlFor="isAnonymousManual" className="text-sm font-medium">
                        Tornar este questionário anônimo
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-6">
                      Respostas anônimas não registrarão a identidade do colaborador.
                    </p>
                  </div>

                  {/* Campos de Data */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDateManual" className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Início
                      </label>
                      <input
                        type="date"
                        id="startDateManual"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Data a partir da qual o questionário estará disponível
                      </p>
                    </div>

                    <div>
                      <label htmlFor="endDateManual" className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Fim
                      </label>
                      <input
                        type="date"
                        id="endDateManual"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        min={startDate || new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Data limite para respostas (opcional)
                      </p>
                    </div>
                  </div>

                  <QuestionEditor questions={manualQuestions} onChange={setManualQuestions} />
                </div>
              )}

              {/* Campos de Personalização para Template */}
              {createMode === 'template' && selectedTemplate && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Personalizar Questionário
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customTitle" className="text-sm font-medium text-gray-700">
                        Título Personalizado
                      </Label>
                      <Input
                        id="customTitle"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder={`${selectedTemplate.name} - ${new Date().toLocaleDateString('pt-BR')}`}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="customTargetDepartment" className="text-sm font-medium text-gray-700">
                        Departamento Alvo (Opcional)
                      </Label>
                      <Select value={customTargetDepartment} onValueChange={setCustomTargetDepartment}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos os departamentos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os departamentos</SelectItem>
                          {companyDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customDescription" className="text-sm font-medium text-gray-700">
                      Descrição Personalizada
                    </Label>
                    <Textarea
                      id="customDescription"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder={selectedTemplate.description}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  {/* Anonymous Checkbox */}
                  <div className="pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAnonymous"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(Boolean(checked))}
                      />
                      <label
                        htmlFor="isAnonymous"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Tornar este questionário anônimo
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-6">
                      Respostas anônimas não registrarão a identidade do colaborador.
                    </p>
                  </div>

                  {/* Campos de Data */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDateTemplate" className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Início
                      </label>
                      <input
                        type="date"
                        id="startDateTemplate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Data a partir da qual o questionário estará disponível
                      </p>
                    </div>

                    <div>
                      <label htmlFor="endDateTemplate" className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Fim
                      </label>
                      <input
                        type="date"
                        id="endDateTemplate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        min={startDate || new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Data limite para respostas (opcional)
                      </p>
                    </div>
                  </div>

                  {/* Resumo do Template Selecionado */}
                  <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Resumo do Questionário
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Template:</span> {selectedTemplate.name}</p>
                      <p><span className="font-medium">Categoria:</span> {selectedTemplate.category}</p>
                      <p><span className="font-medium">Perguntas:</span> {selectedTemplate.questions.length} questões</p>
                      <p><span className="font-medium">Título final:</span> {customTitle || `${selectedTemplate.name} - ${new Date().toLocaleDateString('pt-BR')}`}</p>
                      <p><span className="font-medium">Alvo:</span> {customTargetDepartment || 'Todos os departamentos'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                {createMode === 'template' && selectedTemplate ?
                  `${selectedTemplate.questions.length} perguntas serão criadas` :
                  createMode === 'manual' && customTitle ?
                    'Editor de perguntas em desenvolvimento' :
                    'Configure os campos para continuar'
                }
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowCustomQuestionnaireModal(false);
                    setSelectedTemplate(null);
                    setCustomTitle('');
                    setCustomDescription('');
                    setCustomTargetDepartment('all');
                    setShowTemplatePreview(null);
                    setCreateMode('template');
                  }}
                  variant="outline"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCustomQuestionnaire}
                  disabled={
                    creatingCustom ||
                    (createMode === 'template' && !selectedTemplate) ||
                    (createMode === 'manual' && (manualQuestions.length === 0 || !customTitle))
                  }
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {creatingCustom ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {createMode === 'manual' ? 'Criar Questionário Personalizado' : 'Criar Questionário'}
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Questionário */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl p-6 -m-6 mb-6 border-b border-blue-100">
              <DialogTitle className="flex items-center gap-3 text-2xl text-gray-800">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <Edit3 className="h-6 w-6 text-white" />
                </div>
                Editar Questionário
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base mt-2">
                Modifique o título, descrição, perguntas e configurações do questionário selecionado.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {editingQuestionnaire && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Editar Questionário
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editTitle" className="text-sm font-medium text-gray-700">
                        Título do Questionário
                      </Label>
                      <Input
                        id="editTitle"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Ex: Avaliação de Bem-estar Agosto 2024"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editTargetDepartment" className="text-sm font-medium text-gray-700">
                        Departamento Alvo (Opcional)
                      </Label>
                      <Select value={customTargetDepartment} onValueChange={setCustomTargetDepartment}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos os departamentos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os departamentos</SelectItem>
                          {companyDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editDescription" className="text-sm font-medium text-gray-700">
                      Descrição (Opcional)
                    </Label>
                    <Textarea
                      id="editDescription"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Descreva o objetivo e contexto deste questionário..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  {/* Checkbox Anônimo */}
                  <div className="pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAnonymousEdit"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(Boolean(checked))}
                      />
                      <label htmlFor="isAnonymousEdit" className="text-sm font-medium">
                        Tornar este questionário anônimo
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-6">
                      Respostas anônimas não registrarão a identidade do colaborador.
                    </p>
                  </div>

                  <QuestionEditor questions={manualQuestions} onChange={setManualQuestions} />
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                {manualQuestions.length} perguntas configuradas
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingQuestionnaire(null);
                    setCustomTitle('');
                    setCustomDescription('');
                    setCustomTargetDepartment('all');
                    setIsAnonymous(false);
                    setManualQuestions([]);
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateQuestionnaire}
                  disabled={creatingCustom || manualQuestions.length === 0 || !customTitle}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creatingCustom ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Acompanhamento de Respostas */}
        <Dialog open={showResponsesModal} onOpenChange={setShowResponsesModal}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-xl p-6 -m-6 mb-6 border-b border-emerald-100">
              <DialogTitle className="flex items-center gap-3 text-2xl text-gray-800">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div>Acompanhamento de Respostas</div>
                  {selectedQuestionnaireForResponses && (
                    <div className="text-sm font-normal text-gray-600 mt-1">
                      {selectedQuestionnaireForResponses.title}
                    </div>
                  )}
                </div>
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base mt-2">
                Visualize e analise as respostas dos colaboradores de forma intuitiva e detalhada.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {responsesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
                  <span className="text-lg text-gray-600">Carregando respostas...</span>
                </div>
              ) : (
                <>
                  {/* Resumo Geral */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {detailedStats?.totalResponses || 0}
                        </div>
                        <div className="text-sm text-blue-700">Total de Respostas</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {detailedStats?.averageScore.toFixed(1) || '0'}
                        </div>
                        <div className="text-sm text-green-700">Média Geral</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-0 shadow-lg">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600 mb-1">
                          {questionnaireResponses.length > 0 ?
                            Math.max(...questionnaireResponses.flatMap(q => q.responses)) : '0'
                          }
                        </div>
                        <div className="text-sm text-amber-700">Maior Avaliação</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {questionnaireResponses.length > 0 ?
                            Math.min(...questionnaireResponses.flatMap(q => q.responses)) : '0'
                          }
                        </div>
                        <div className="text-sm text-purple-700">Menor Avaliação</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráficos por Pergunta */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-emerald-600" />
                      Análise por Pergunta
                    </h3>

                    {questionnaireResponses.map((questionData, index) => (
                      <Card key={index} className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <CardTitle className="text-lg text-gray-800">
                            {index + 1}. {questionData.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gráfico de Barras */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-700">Distribuição das Respostas</h4>
                              <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={questionData.responses.map((value, i) => ({
                                    resposta: `Resposta ${i + 1}`,
                                    valor: value
                                  }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="resposta" />
                                    <YAxis domain={[1, 5]} />
                                    <Tooltip />
                                    <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-700">Estatísticas</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <span className="text-gray-600">Média:</span>
                                  <span className="font-semibold text-gray-800">
                                    {questionData.averageScore}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <span className="text-gray-600">Mediana:</span>
                                  <span className="font-semibold text-gray-800">
                                    {questionData.medianScore}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <span className="text-gray-600">Moda:</span>
                                  <span className="font-semibold text-gray-800">
                                    {questionData.modeScore}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <span className="text-gray-600">Desvio Padrão:</span>
                                  <span className="font-semibold text-gray-800">
                                    {questionData.standardDeviation}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Breakdown por Departamento */}
                  {detailedStats?.departmentBreakdown && detailedStats.departmentBreakdown.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Análise por Departamento
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {detailedStats.departmentBreakdown.map((dept, index) => (
                          <Card key={index} className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                              <CardTitle className="text-lg text-blue-800">
                                {dept.department}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Total de Respostas:</span>
                                  <span className="font-semibold text-gray-800">{dept.totalResponses}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Média de Satisfação:</span>
                                  <span className="font-semibold text-gray-800">{dept.averageScore}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(dept.averageScore / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline de Respostas */}
                  {detailedStats?.responseTimeline && detailedStats.responseTimeline.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Evolução das Respostas
                      </h3>

                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={detailedStats.responseTimeline}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                  type="monotone"
                                  dataKey="responses"
                                  stroke="#10b981"
                                  strokeWidth={3}
                                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                {detailedStats ? (
                  <>
                    <span className="font-medium">{detailedStats.totalResponses} respostas</span>
                    {detailedStats.departmentBreakdown.length > 0 && (
                      <span className="ml-2 text-gray-400">
                        • {detailedStats.departmentBreakdown.length} departamentos
                      </span>
                    )}
                    {detailedStats.responseTimeline.length > 0 && (
                      <span className="ml-2 text-gray-400">
                        • {detailedStats.responseTimeline.length} dias de atividade
                      </span>
                    )}
                  </>
                ) : (
                  'Nenhuma resposta disponível'
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowResponsesModal(false);
                    setSelectedQuestionnaireForResponses(null);
                    setQuestionnaireResponses([]);
                  }}
                  variant="outline"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    // Aqui você pode implementar exportação de dados
                    console.log('Exportar dados');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CompanyDashboardLayout >
    </>
  );
};

export default Questionnaires;
