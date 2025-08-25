import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { MeditationService } from '@/services/meditationService';
import { DiaryService } from '@/services/diaryService';
import { getCompanyQuestionnaireMetrics } from '@/services/questionnaireService';
import { getRealCompanyDashboardData } from '@/services/mobileAppDataService';
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

  // Estados para filtros e paginação
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);

  // Funções de filtro e paginação
  const filteredReports = recentReports.filter((report) => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPeriod = periodFilter === 'all' ||
      (periodFilter === 'recent' && isRecentReport(report)) ||
      (periodFilter === 'month' && isThisMonth(report)) ||
      (periodFilter === 'quarter' && isThisQuarter(report));
    const matchesSearch = searchTerm === '' ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPeriod && matchesSearch;
  });

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  // Funções auxiliares para filtros
  const isRecentReport = (report: any) => {
    const reportDate = new Date(report.generated_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return reportDate >= thirtyDaysAgo;
  };

  const isThisMonth = (report: any) => {
    const reportDate = new Date(report.generated_at);
    const now = new Date();
    return reportDate.getMonth() === now.getMonth() &&
      reportDate.getFullYear() === now.getFullYear();
  };

  const isThisQuarter = (report: any) => {
    const reportDate = new Date(report.generated_at);
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const reportQuarter = Math.floor(reportDate.getMonth() / 3);
    return reportQuarter === currentQuarter &&
      reportDate.getFullYear() === now.getFullYear();
  };

  // Reset da página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, periodFilter, searchTerm]);

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

  // Buscar métricas automáticas com dados REAIS
  const fetchMetrics = async (companyId: string) => {
    try {
      console.log('🚀 Buscando métricas REAIS para empresa:', companyId);

      // Buscar dados reais consolidados
      const realData = await getRealCompanyDashboardData(companyId);

      if (realData) {
        console.log('✅ Dados reais carregados:', realData);

        // Extrair métricas dos questionários
        const questionnaireMetrics = realData.questionnaireMetrics;
        const userMetrics = realData.userMetrics;
        const mentalHealthMetrics = realData.mentalHealthMetrics;

        // Calcular métricas consolidadas
        const totalUsers = userMetrics?.totalUsers || 0;
        const activeUsers = userMetrics?.activeUsers || 0;
        const engagementRate = userMetrics?.engagementRate || 0;

        // Métricas de questionários
        const totalResponses = questionnaireMetrics?.totalResponses || 0;
        const averageScore = questionnaireMetrics?.averageScore || 0;
        const completionRate = questionnaireMetrics?.completionRate || 0;

        // Métricas de saúde mental
        const totalAlerts = mentalHealthMetrics?.totalAlerts || 0;
        const criticalAlerts = mentalHealthMetrics?.criticalAlerts || 0;

        // Atividades completadas (dados reais)
        const { data: activities } = await supabase
          .from('company_activities')
          .select('*')
          .eq('company_id', companyId)
          .eq('status', 'concluida');

        // Sessões de conversa (dados reais)
        const { data: callSessions } = await supabase
          .from('call_sessions')
          .select('id, user_id')
          .eq('company_id', companyId);

        // Métricas de meditação (simulação inteligente baseada em dados reais)
        const meditationMetrics = await MeditationService.getCompanyMeditationMetrics();

        // Métricas de diário (simulação inteligente baseada em dados reais)
        const diaryMetrics = await DiaryService.getCompanyDiaryMetrics();

        console.log('✅ Métricas REAIS calculadas:', {
          totalUsers,
          activeUsers,
          engagementRate,
          totalResponses,
          averageScore,
          completionRate,
          totalAlerts,
          criticalAlerts,
          meditationHours: meditationMetrics.totalHours,
          conversationSessions: callSessions?.length || 0,
          completedActivities: activities?.length || 0,
          diaryEntries: diaryMetrics.totalEntries
        });

        setMetrics({
          meditationHours: meditationMetrics.totalHours,
          conversationSessions: callSessions?.length || 0,
          completedActivities: activities?.length || 0,
          engagementRate: engagementRate,
          activeUsers: totalUsers,
          diaryEntries: diaryMetrics.totalEntries
        });
      } else {
        console.warn('⚠️ Dados reais não disponíveis, usando fallback');
        // Fallback para dados simulados se necessário
        await fetchMetricsFallback(companyId);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar métricas REAIS:', error);
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

  // Função de fallback para métricas simuladas
  const fetchMetricsFallback = async (companyId: string) => {
    try {
      console.log('🔄 Usando fallback para métricas simuladas');

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

      // Métricas de meditação via service (simulação inteligente)
      const meditationMetrics = await MeditationService.getCompanyMeditationMetrics();

      // Métricas de diário via service (simulação inteligente)  
      const diaryMetrics = await DiaryService.getCompanyDiaryMetrics();

      // Métricas de questionários via service (dados reais se existirem)
      let questionnaireResponses = 0;
      try {
        const questionnaireMetrics = await getCompanyQuestionnaireMetrics(companyId);
        questionnaireResponses = questionnaireMetrics?.totalResponses || 0;
      } catch (error) {
        console.warn('⚠️ Erro ao buscar métricas de questionários:', error);
      }

      // Calcular taxa de engajamento baseada em dados reais
      const totalUsers = employees?.length || 0;
      const activeUsersCount = Math.max(
        meditationMetrics.activeUsers,
        diaryMetrics.activeUsers,
        Math.round(questionnaireResponses * 0.7)
      );
      const realEngagementRate = totalUsers > 0 ? Math.round((activeUsersCount / totalUsers) * 100) : 0;

      setMetrics({
        meditationHours: meditationMetrics.totalHours,
        conversationSessions: callSessions?.length || 0,
        completedActivities: activities?.length || 0,
        engagementRate: realEngagementRate,
        activeUsers: totalUsers,
        diaryEntries: diaryMetrics.totalEntries
      });
    } catch (error) {
      console.error('❌ Erro no fallback de métricas:', error);
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
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl"></div>
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

  return (
    <CompanyDashboardLayout>
      <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
        {/* NOVA ESTRUTURA LIMPA E INTUITIVA */}
        <div className="w-full space-y-8">

          {/* SEÇÃO 1: MÉTRICAS UNIFICADAS + COMPLIANCE */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Central de Relatórios de Compliance</h2>
                <p className="text-gray-600">Métricas em tempo real e status de conformidade para Lei 14.831/2024 e NR-1</p>
              </div>
            </div>

            {/* Grid de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {/* Horas de Meditação */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {metrics.meditationHours.toLocaleString()}h
                  </div>
                  <div className="text-sm text-gray-600">Horas de Meditação</div>
                </CardContent>
              </Card>

              {/* Sessões de Conversa */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    {metrics.conversationSessions.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Sessões de Conversa</div>
                </CardContent>
              </Card>

              {/* Atividades Realizadas */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {metrics.completedActivities}
                  </div>
                  <div className="text-sm text-gray-600">Atividades Realizadas</div>
                </CardContent>
              </Card>

              {/* Taxa de Engajamento */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-1">
                    {metrics.engagementRate}%
                  </div>
                  <div className="text-sm text-gray-600">Taxa de Engajamento</div>
                </CardContent>
              </Card>

              {/* Usuários Ativos */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {metrics.activeUsers}
                  </div>
                  <div className="text-sm text-gray-600">Usuários Ativos</div>
                </CardContent>
              </Card>

              {/* Registros de Diário */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-pink-600 mb-1">
                    {metrics.diaryEntries.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Registros de Diário</div>
                </CardContent>
              </Card>
            </div>

            {/* Botão de Ação Principal */}
            <div className="flex justify-center">
              <Button
                onClick={() => handleGenerateReport('personalizado')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg px-8 py-3 rounded-xl font-medium text-lg"
              >
                <Plus className="h-6 w-6 mr-3" />
                Gerar Novo Relatório
              </Button>
            </div>
          </div>

          {/* SEÇÃO 2: STATUS DE CONFORMIDADE */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Status de Conformidade</h2>
                  <p className="text-sm text-gray-600">Monitore o cumprimento das regulamentações e gere relatórios automatizados</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lei 14.831/2024 */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
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
                        <div className="text-3xl font-bold text-green-600">
                          {getComplianceScore('lei14831')}%
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Conformidade</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
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
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{metrics.completedActivities} atividades realizadas</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{metrics.engagementRate}% de engajamento dos colaboradores</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700">Próxima auditoria em 15 dias</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-2 rounded-lg"
                      onClick={() => handleGenerateReport('compliance_lei14831')}
                    >
                      Gerar Relatório
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* NR-1 */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
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
                        <div className="text-3xl font-bold text-amber-600">
                          {getComplianceScore('nr1')}%
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Conformidade</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">Progresso</span>
                        <span className="text-amber-600 font-semibold">{getComplianceScore('nr1')}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${getComplianceScore('nr1')}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700">Avaliação de riscos atualizada</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700">3 ações preventivas pendentes</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700">Relatório trimestral em 30 dias</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-2 rounded-lg"
                      onClick={() => handleGenerateReport('nr1_psicossocial')}
                    >
                      Gerar Relatório
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: HISTÓRICO DE RELATÓRIOS + AÇÕES */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Histórico de Relatórios</h2>
                    <p className="text-sm text-gray-600">Acompanhe o status e histórico dos seus relatórios de compliance</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleGenerateReport('personalizado')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg px-6 py-2 rounded-xl font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Relatório
                </Button>
              </div>
            </div>

            <div className="p-6">
              {/* Relatórios Recentes */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">Relatórios Recentes</h3>
                    {filteredReports.length !== recentReports.length && (
                      <Badge variant="secondary" className="text-xs">
                        {filteredReports.length} de {recentReports.length} relatórios
                      </Badge>
                    )}
                  </div>

                  {/* Filtros e Busca */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Busca */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar relatórios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>

                    {/* Filtro de Status */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="gerando">Gerando</option>
                      <option value="pronto">Pronto</option>
                      <option value="enviado">Enviado</option>
                      <option value="arquivado">Arquivado</option>
                    </select>

                    {/* Filtro de Período */}
                    <select
                      value={periodFilter}
                      onChange={(e) => setPeriodFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                      <option value="all">Todos os Períodos</option>
                      <option value="recent">Últimos 30 dias</option>
                      <option value="month">Este mês</option>
                      <option value="quarter">Este trimestre</option>
                    </select>
                  </div>
                </div>

                {filteredReports.length > 0 ? (
                  <div className="space-y-4">
                    {/* Lista de Relatórios */}
                    <div className="grid gap-4">
                      {paginatedReports.map((report) => (
                        <Card
                          key={report.id}
                          className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50 cursor-pointer"
                          onClick={() => navigate(`/company/relatorios/${report.id}`)}
                        >
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
                                <Button size="sm" variant="outline">
                                  Ver Detalhes
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1"
                        >
                          Anterior
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="px-3 py-1 min-w-[40px]"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1"
                        >
                          Próxima
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="p-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Nenhum relatório encontrado
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {searchTerm || statusFilter !== 'all' || periodFilter !== 'all'
                        ? 'Tente ajustar os filtros ou termos de busca'
                        : 'Comece gerando seu primeiro relatório de compliance para Lei 14.831/2024 ou NR-1'
                      }
                    </p>
                    {!searchTerm && statusFilter === 'all' && periodFilter === 'all' && (
                      <Button
                        onClick={() => handleGenerateReport('personalizado')}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl px-8 py-4"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Criar Primeiro Relatório
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Relatórios Agendados */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Relatórios Agendados</h3>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </CompanyDashboardLayout>
  );
};

export default CompanyReports;
