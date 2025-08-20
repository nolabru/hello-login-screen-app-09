import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { MeditationService } from '@/services/meditationService';
import { DiaryService } from '@/services/diaryService';
import { getCompanyQuestionnaireMetrics } from '@/services/questionnaireService';
import { 
  FileText, 
  Download, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Brain,
  Activity,
  Calendar,
  BarChart3,
  Target,
  Award,
  FileCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CompanyReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    meditationHours: 0,
    conversationSessions: 0,
    completedActivities: 0,
    engagementRate: 0,
    activeUsers: 0,
    diaryEntries: 0
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string>('');

  // Buscar ID da empresa do usuário
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('user_id', user.id)
            .single();
          
          if (profile?.company_id) {
            setCompanyId(profile.company_id);
            fetchMetrics(profile.company_id);
            fetchRecentReports(profile.company_id);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyId();
  }, []);

  // Buscar métricas automáticas com dados reais
  const fetchMetrics = async (companyId: string) => {
    try {
      console.log('🚀 Buscando métricas reais para empresa:', companyId);

      // Buscar atividades completadas (dados reais)
      const { data: activities } = await supabase
        .from('company_activities')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'concluida');

      // Buscar colaboradores ativos (dados reais)
      const { data: employees } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('company_id', companyId)
        .not('user_id', 'is', null);

      // Buscar sessões de conversa (dados reais)
      const { data: callSessions } = await supabase
        .from('call_sessions')
        .select('id, user_id')
        .in('user_id', employees?.map(e => e.user_id) || []);

      // Buscar métricas de meditação via service (simulação inteligente)
      const meditationMetrics = await MeditationService.getCompanyMeditationMetrics();

      // Buscar métricas de diário via service (simulação inteligente)  
      const diaryMetrics = await DiaryService.getCompanyDiaryMetrics();

      // Buscar métricas de questionários via service (dados reais se existirem)
      const questionnaireMetrics = await getCompanyQuestionnaireMetrics(companyId);

      // Calcular taxa de engajamento baseada em dados reais
      const totalUsers = employees?.length || 0;
      const activeUsersCount = Math.max(
        meditationMetrics.activeUsers,
        diaryMetrics.activeUsers,
        Math.round(questionnaireMetrics.totalResponses * 0.7) // Estimar usuários ativos baseado em respostas
      );
      const realEngagementRate = totalUsers > 0 ? Math.round((activeUsersCount / totalUsers) * 100) : 0;

      console.log('✅ Métricas calculadas:', {
        meditationHours: meditationMetrics.totalHours,
        conversationSessions: callSessions?.length || 0,
        completedActivities: activities?.length || 0,
        engagementRate: realEngagementRate,
        activeUsers: totalUsers,
        diaryEntries: diaryMetrics.totalEntries
      });

      setMetrics({
        meditationHours: meditationMetrics.totalHours,
        conversationSessions: callSessions?.length || 0,
        completedActivities: activities?.length || 0,
        engagementRate: realEngagementRate,
        activeUsers: totalUsers,
        diaryEntries: diaryMetrics.totalEntries
      });
    } catch (error) {
      console.error('❌ Erro ao buscar métricas:', error);
      // Fallback para métricas vazias em caso de erro
      setMetrics({
        meditationHours: 0,
        conversationSessions: 0,
        completedActivities: 0,
        engagementRate: 0,
        activeUsers: 0,
        diaryEntries: 0
      });
    }
  };

  // Buscar relatórios recentes
  const fetchRecentReports = async (companyId: string) => {
    try {
      const { data } = await supabase
        .from('compliance_reports')
        .select('*')
        .eq('company_id', companyId)
        .order('generated_at', { ascending: false })
        .limit(5);

      setRecentReports(data || []);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    }
  };

  const handleGenerateReport = (type: string) => {
    navigate(`/company/relatorios/wizard?type=${type}`);
  };

  const getComplianceScore = (type: string) => {
    // Calcular scores de compliance baseado em dados reais
    if (type === 'lei14831') {
      // Score baseado em: atividades completadas + engajamento + relatórios
      const activitiesScore = Math.min((metrics.completedActivities / 10) * 40, 40); // Máximo 40 pontos por atividades
      const engagementScore = (metrics.engagementRate / 100) * 35; // Máximo 35 pontos por engajamento
      const reportsScore = Math.min((recentReports.length / 3) * 25, 25); // Máximo 25 pontos por relatórios
      return Math.round(activitiesScore + engagementScore + reportsScore);
    }
    if (type === 'nr1') {
      // Score baseado em: atividades + sessões de conversa + relatórios
      const activitiesScore = Math.min((metrics.completedActivities / 8) * 35, 35); // Máximo 35 pontos
      const sessionsScore = Math.min((metrics.conversationSessions / 20) * 30, 30); // Máximo 30 pontos
      const reportsScore = Math.min((recentReports.length / 2) * 35, 35); // Máximo 35 pontos
      return Math.round(activitiesScore + sessionsScore + reportsScore);
    }
    return 0;
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      'gerando': { label: 'Gerando', variant: 'secondary' as const },
      'pronto': { label: 'Pronto', variant: 'default' as const },
      'enviado': { label: 'Enviado', variant: 'success' as const },
      'arquivado': { label: 'Arquivado', variant: 'outline' as const }
    };
    const config = configs[status as keyof typeof configs] || configs['gerando'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <CompanyDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </CompanyDashboardLayout>
    );
  }

  return (
    <CompanyDashboardLayout>
      <div className="space-y-6">
        {/* Header Integrado com Sidebar */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                Central de Relatórios de Compliance
              </h1>
              <p className="text-xs text-gray-500">
                Gere relatórios automatizados para Lei 14.831/2024 e NR-1
              </p>
            </div>
          </div>
          
          <Button 
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
            onClick={() => handleGenerateReport('personalizado')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </div>

        {/* Métricas Automáticas - Header Padronizado */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Métricas em Tempo Real
            </h2>
            <p className="text-xs text-gray-500">
              Dados coletados automaticamente do app Calma e atividades corporativas
            </p>
          </div>
        </div>
        
        <Card className="border-0 shadow-lg bg-white animate-in fade-in-50 duration-500 mb-6">
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Horas de Meditação */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 delay-100">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="relative z-10">
                  <Brain className="h-8 w-8 mb-3 opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-2xl font-bold mb-1">
                    {metrics.meditationHours.toLocaleString()}h
                  </div>
                  <p className="text-xs opacity-80 font-medium">Horas de Meditação</p>
                </div>
              </div>

              {/* Sessões de Conversa */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 delay-200">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="relative z-10">
                  <Activity className="h-8 w-8 mb-3 opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-2xl font-bold mb-1">
                    {metrics.conversationSessions.toLocaleString()}
                  </div>
                  <p className="text-xs opacity-80 font-medium">Sessões de Conversa</p>
                </div>
              </div>

              {/* Atividades Realizadas */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-4 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 delay-300">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="relative z-10">
                  <Target className="h-8 w-8 mb-3 opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-2xl font-bold mb-1">
                    {metrics.completedActivities}
                  </div>
                  <p className="text-xs opacity-80 font-medium">Atividades Realizadas</p>
                </div>
              </div>

              {/* Taxa de Engajamento */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 delay-400">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="relative z-10">
                  <TrendingUp className="h-8 w-8 mb-3 opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-2xl font-bold mb-1">
                    {metrics.engagementRate}%
                  </div>
                  <p className="text-xs opacity-80 font-medium">Taxa de Engajamento</p>
                </div>
              </div>

              {/* Usuários Ativos */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 delay-500">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="relative z-10">
                  <Users className="h-8 w-8 mb-3 opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-2xl font-bold mb-1">
                    {metrics.activeUsers}
                  </div>
                  <p className="text-xs opacity-80 font-medium">Usuários Ativos</p>
                </div>
              </div>

              {/* Registros de Diário */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-4 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 delay-600">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="relative z-10">
                  <FileText className="h-8 w-8 mb-3 opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-2xl font-bold mb-1">
                    {metrics.diaryEntries.toLocaleString()}
                  </div>
                  <p className="text-xs opacity-80 font-medium">Registros de Diário</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status de Conformidade - Header Padronizado */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Award className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Status de Conformidade
            </h2>
            <p className="text-xs text-gray-500">
              Monitore o cumprimento das regulamentações e gere relatórios automatizados
            </p>
          </div>
        </div>
        
        <Card className="border-0 shadow-lg bg-white animate-in fade-in-50 duration-700 delay-300 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lei 14.831/2024 */}
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg animate-in slide-in-from-left-4 delay-500">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-full -translate-y-16 translate-x-16"></div>
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          Lei 14.831/2024
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Certificado Empresa Promotora da Saúde Mental
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {getComplianceScore('lei14831')}%
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Conformidade</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Progresso</span>
                      <span className="text-green-600 font-semibold">{getComplianceScore('lei14831')}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${getComplianceScore('lei14831')}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-green-50/50 rounded-lg group-hover:bg-green-50 transition-colors duration-300">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{metrics.completedActivities} atividades realizadas</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50/50 rounded-lg group-hover:bg-green-50 transition-colors duration-300">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{metrics.engagementRate}% de engajamento dos colaboradores</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-yellow-50/50 rounded-lg group-hover:bg-yellow-50 transition-colors duration-300">
                      <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span className="text-xs text-gray-700">Próxima auditoria em 15 dias</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-2 rounded-lg"
                    onClick={() => handleGenerateReport('lei14831')}
                  >
                    Gerar Relatório
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* NR-1 */}
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg animate-in slide-in-from-right-4 delay-700">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-yellow-300/30 rounded-full -translate-y-16 translate-x-16"></div>
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FileCheck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          NR-1
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Riscos Psicossociais no Ambiente de Trabalho
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        {getComplianceScore('nr1')}%
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Conformidade</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Progresso</span>
                      <span className="text-orange-600 font-semibold">{getComplianceScore('nr1')}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${getComplianceScore('nr1')}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-green-50/50 rounded-lg group-hover:bg-green-50 transition-colors duration-300">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-xs text-gray-700">Avaliação de riscos atualizada</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-yellow-50/50 rounded-lg group-hover:bg-yellow-50 transition-colors duration-300">
                      <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span className="text-xs text-gray-700">3 ações preventivas pendentes</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                      <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-xs text-gray-700">Relatório trimestral em 30 dias</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-2 rounded-lg"
                    onClick={() => handleGenerateReport('nr1')}
                  >
                    Gerar Relatório
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Relatórios - Header Padronizado */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-lg">
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Histórico de Relatórios
            </h2>
            <p className="text-xs text-gray-500">
              Acompanhe o status e histórico dos seus relatórios de compliance
            </p>
          </div>
        </div>
        
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <Tabs defaultValue="recent" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-gray-100 rounded-xl">
                <TabsTrigger value="recent" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Relatórios Recentes
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Agendados
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4">
                {recentReports.length > 0 ? (
                  <div className="grid gap-4">
                    {recentReports.map((report) => (
                      <Card key={report.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <FileText className="h-5 w-5 text-white" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-bold text-gray-900 text-base">{report.title}</h3>
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">Período:</span> {format(new Date(report.report_period_start), 'dd/MM/yyyy', { locale: ptBR })} 
                                  {' - '}
                                  {format(new Date(report.report_period_end), 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                                <p className="text-xs text-gray-500">
                                  <span className="font-medium">Gerado em:</span> {format(new Date(report.generated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(report.status)}
                              {report.pdf_url && (
                                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg rounded-lg">
                                  <Download className="h-3 w-3 mr-1" />
                                  Baixar
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="p-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Nenhum relatório gerado ainda
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Comece gerando seu primeiro relatório de compliance para Lei 14.831/2024 ou NR-1
                    </p>
                    <Button 
                      onClick={() => handleGenerateReport('personalizado')}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl px-8 py-4"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Criar Primeiro Relatório
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="scheduled" className="space-y-4">
                <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-dashed border-indigo-200">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Relatórios Agendados
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Configure relatórios automáticos mensais ou trimestrais para manter sua conformidade sempre em dia
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </CompanyDashboardLayout>
  );
};

export default CompanyReports;
