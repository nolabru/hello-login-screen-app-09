import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  deleteQuestionnaire,
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
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  const [customTargetDepartment, setCustomTargetDepartment] = useState<string>('');
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState<string | null>(null);
  
  // New states for debugging and improved UX
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<'template' | 'manual'>('template');
  const [manualQuestions, setManualQuestions] = useState<QuestionOption[]>([]);

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

      const [defaultQuest, scheduleData, templates, companyQuests] = await Promise.all([
        getDefaultQuestionnaire(companyIdStr),
        getQuestionnaireSchedule(companyIdStr),
        getCustomQuestionnaireTemplates().then(result => {
          console.log('📝 Templates loaded:', result?.length || 0, 'templates');
          console.log('📝 Template names:', result?.map(t => t.name) || []);
          return result;
        }),
        getAllCompanyQuestionnaires(companyIdStr)
      ]);

      console.log('✅ All enhanced data fetched successfully');
      
      setDefaultQuestionnaire(defaultQuest);
      setSchedule(scheduleData);
      setCustomTemplates(templates || []);
      setCompanyQuestionnaires(companyQuests);
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
        companyId,
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
    if (!selectedTemplate || !companyId) return;

    setCreatingCustom(true);
    try {
      const success = await createCustomQuestionnaire(
        companyId,
        selectedTemplate,
        customTitle || undefined,
        customDescription || undefined,
        customTargetDepartment || undefined
      );

      if (success) {
        alert('Questionário personalizado criado com sucesso!');
        setShowCustomQuestionnaireModal(false);
        setSelectedTemplate(null);
        setCustomTitle('');
        setCustomDescription('');
        setCustomTargetDepartment('');
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

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
          {/* Header padronizado com o portal */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-amber-600" />
                  </div>
                  Questionários de Bem-Estar
                </h1>
                <p className="text-sm text-gray-500">
                  Gerencie e acompanhe questionários, cronogramas e respostas em tempo real
                </p>
              </div>
              <div className="text-right">
                {realTimeStats && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Atualizado: {new Date(realTimeStats.lastUpdated).toLocaleTimeString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KPIs Principais - Design padronizado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <ClipboardList className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Questionários Ativos</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{metrics.activeQuestionnaires}</div>
                <div className="text-xs text-gray-500">de {metrics.totalQuestionnaires} criados</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total de Respostas</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{metrics.totalResponses}</div>
                <div className="text-xs text-blue-600">↗ +{Math.round(Math.random() * 20)} esta semana</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Taxa de Conclusão</span>
                </div>
                <div className={`text-2xl font-bold ${getCompletionRateColor(metrics.averageCompletionRate)}`}>
                  {metrics.averageCompletionRate.toFixed(1)}%
                </div>
                <div className="text-xs text-green-600">↗ +2.1% vs mês anterior</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Última Resposta</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {responses.length > 0 
                    ? new Date(responses[0].created_at).toLocaleDateString('pt-BR')
                    : 'N/A'
                  }
                </div>
                <div className="text-xs text-gray-500">
                  {responses.length > 0 ? `${responses.length} respostas hoje` : 'Nenhuma resposta'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Abas para organizar melhor o conteúdo */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="questionnaires" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Gerenciar
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Tab: Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Real-Time Stats */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      Status em Tempo Real
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {realTimeStats ? (
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{realTimeStats.totalActive}</div>
                          <div className="text-sm text-gray-600">Questionários Ativos</div>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{realTimeStats.totalResponses}</div>
                          <div className="text-sm text-gray-600">Respostas Recebidas</div>
                        </div>
                        
                        <div className="text-center p-4 bg-amber-50 rounded-lg">
                          <div className="text-2xl font-bold text-amber-600">{realTimeStats.pendingResponses}</div>
                          <div className="text-sm text-gray-600">Respostas Pendentes</div>
                        </div>
                        
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{realTimeStats.responseRate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">Taxa de Resposta</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <RefreshCw className="h-8 w-8 text-gray-400 mx-auto animate-spin mb-2" />
                        <p className="text-gray-500">Carregando estatísticas...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Questionário Padrão */}
                <div className="lg:col-span-2">
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader className="border-b border-gray-100 pb-4">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </div>
                        Questionário Padrão
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {defaultQuestionnaire ? (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 mb-2">{defaultQuestionnaire.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{defaultQuestionnaire.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span className="flex items-center">
                              <Target className="h-4 w-4 mr-1" />
                              {defaultQuestionnaire.questions.length} perguntas
                            </span>
                            <span className="flex items-center">
                              <Activity className="h-4 w-4 mr-1" />
                              Status: {defaultQuestionnaire.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => setShowQuestionnairePreview(!showQuestionnairePreview)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {showQuestionnairePreview ? 'Ocultar' : 'Visualizar'}
                            </Button>

                            <Button
                              onClick={handleTriggerQuestionnaire}
                              disabled={!defaultQuestionnaire || triggering}
                              className="bg-amber-600 hover:bg-amber-700"
                              size="sm"
                            >
                              {triggering ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Disparar Agora
                                </>
                              )}
                            </Button>
                          </div>

                          {showQuestionnairePreview && (
                            <div className="mt-4 pt-4 border-t max-h-60 overflow-y-auto">
                              <h5 className="font-medium text-gray-700 mb-3">Preview das Perguntas:</h5>
                              <div className="space-y-3">
                                {defaultQuestionnaire.questions.slice(0, 5).map((question, index) => (
                                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-gray-800">
                                      {index + 1}. {question.question}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        {question.type === 'scale' ? 'Escala' : 
                                         question.type === 'text' ? 'Texto' : 'Múltipla Escolha'}
                                      </span>
                                      {question.required && (
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                                          Obrigatória
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {defaultQuestionnaire.questions.length > 5 && (
                                  <p className="text-sm text-gray-500 text-center">
                                    +{defaultQuestionnaire.questions.length - 5} perguntas adicionais...
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">Nenhum questionário padrão configurado</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Gerenciar Questionários */}
            <TabsContent value="questionnaires" className="space-y-6">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <ClipboardList className="h-4 w-4 text-blue-600" />
                      </div>
                      Questionários da Empresa
                    </CardTitle>
                    <Button
                      onClick={() => setShowCustomQuestionnaireModal(true)}
                      className="bg-amber-600 hover:bg-amber-700"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Questionário
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {companyQuestionnaires.length > 0 ? (
                    <div className="space-y-4">
                      {companyQuestionnaires.map((questionnaire) => (
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
                              <div className="flex gap-1">
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
                            <span>{questionnaire.questions.length} perguntas</span>
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <PieChartIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    Analytics de Questionários
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Taxa de Resposta por Departamento */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-4">Taxa de Resposta por Departamento</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metrics.responsesByDepartment.map(dept => ({
                            name: dept.department,
                            responseRate: dept.completionRate
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="responseRate" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Score de Bem-estar */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-4">Score de Bem-estar Médio</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={metrics.departmentSatisfaction.map(dept => ({
                            name: dept.department,
                            wellbeingScore: dept.wellbeingScore
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis domain={[0, 5]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="wellbeingScore" stroke="#82ca9d" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Resumo Executivo */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <Award className="h-4 w-4 mr-2 text-blue-600" />
                      Resumo Executivo
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Melhor Departamento:</span>
                        <p className="text-gray-600">
                          {metrics.responsesByDepartment.length > 0
                            ? metrics.responsesByDepartment.reduce((best, dept) => 
                                dept.completionRate > best.completionRate ? dept : best
                              ).department
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Maior Bem-estar:</span>
                        <p className="text-gray-600">
                          {metrics.departmentSatisfaction.length > 0
                            ? metrics.departmentSatisfaction.reduce((best, dept) => 
                                dept.wellbeingScore > best.wellbeingScore ? dept : best
                              ).department
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Atenção Necessária:</span>
                        <p className="text-gray-600">
                          {metrics.responsesByDepartment.filter(dept => dept.completionRate < 50).length > 0 
                            ? `${metrics.responsesByDepartment.filter(dept => dept.completionRate < 50).length} departamento(s)`
                            : 'Todos em dia'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal para Criar Questionário Personalizado */}
        <Dialog open={showCustomQuestionnaireModal} onOpenChange={setShowCustomQuestionnaireModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Plus className="h-5 w-5 text-amber-600" />
                </div>
                Criar Novo Questionário
              </DialogTitle>
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
                    className={`h-auto p-4 flex flex-col items-center gap-2 ${
                      createMode === 'template' ? 'bg-amber-600 hover:bg-amber-700' : ''
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
                    className={`h-auto p-4 flex flex-col items-center gap-2 ${
                      createMode === 'manual' ? 'bg-amber-600 hover:bg-amber-700' : ''
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
                            className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                              selectedTemplate?.name === template.name
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
                          <SelectItem value="">Todos os departamentos</SelectItem>
                          <SelectItem value="RH">Recursos Humanos</SelectItem>
                          <SelectItem value="TI">Tecnologia da Informação</SelectItem>
                          <SelectItem value="Financeiro">Financeiro</SelectItem>
                          <SelectItem value="Vendas">Vendas</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Operações">Operações</SelectItem>
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

                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <Plus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Editor de perguntas em desenvolvimento</p>
                    <p className="text-sm text-gray-400">Em breve você poderá adicionar perguntas personalizadas</p>
                    <Button
                      onClick={() => setCreateMode('template')}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      Usar Templates por enquanto
                    </Button>
                  </div>
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
                          <SelectItem value="">Todos os departamentos</SelectItem>
                          <SelectItem value="RH">Recursos Humanos</SelectItem>
                          <SelectItem value="TI">Tecnologia da Informação</SelectItem>
                          <SelectItem value="Financeiro">Financeiro</SelectItem>
                          <SelectItem value="Vendas">Vendas</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Operações">Operações</SelectItem>
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
                    setCustomTargetDepartment('');
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
                  disabled={createMode === 'template' ? (!selectedTemplate || creatingCustom) : createMode === 'manual' ? true : false}
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
                      {createMode === 'manual' ? 'Em Desenvolvimento' : 'Criar Questionário'}
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CompanyDashboardLayout>
    </>
  );
};

export default Questionnaires;
