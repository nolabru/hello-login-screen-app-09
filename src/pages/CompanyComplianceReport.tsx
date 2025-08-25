import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  FileText,
  Download,
  Eye,
  ArrowLeft,
  TrendingUp,
  Users,
  BarChart3,
  Brain,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportData {
  id: string;
  company_id: string;
  report_type: string;
  title: string;
  report_period_start: string;
  report_period_end: string;
  report_data: any;
  status: string;
  generated_at: string;
  pdf_url?: string;
  pdf_size?: number;
}

const CompanyComplianceReport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadReport(id);
    }
  }, [id]);

  const loadReport = async (reportId: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      console.log('🔍 CompanyComplianceReport: Relatório carregado:', data);
      console.log('🔍 CompanyComplianceReport: PDF URL:', data.pdf_url);
      console.log('🔍 CompanyComplianceReport: PDF Size:', (data as any).pdf_size_bytes);
      console.log('🔍 CompanyComplianceReport: Estrutura completa:', JSON.stringify(data, null, 2));

      setReport(data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast({
        title: 'Erro ao carregar relatório',
        description: 'Não foi possível carregar os dados do relatório.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!report?.pdf_url) {
      toast({
        title: 'PDF não disponível',
        description: 'O PDF ainda não foi gerado ou não está disponível.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(report.pdf_url);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${report.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download iniciado',
        description: 'O PDF está sendo baixado para o seu computador.',
      });
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast({
        title: 'Erro ao baixar PDF',
        description: 'Não foi possível baixar o arquivo.',
        variant: 'destructive'
      });
    }
  };

  const getReportTypeLabel = (type: string) => {
    console.log('🔍 CompanyComplianceReport: Tipo do relatório:', type);

    switch (type) {
      case 'compliance_lei14831':
        return 'Lei 14.831/2024 - Certificado Empresa Promotora da Saúde Mental';
      case 'nr1_psicossocial':
        return 'NR-1 - Riscos Psicossociais no Ambiente de Trabalho';
      case 'customizado':
        return 'Relatório Personalizado de Compliance';
      default:
        console.log('⚠️ CompanyComplianceReport: Tipo não reconhecido:', type);
        return 'Relatório de Compliance';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pronto':
        return <Badge className="bg-green-100 text-green-800">Pronto</Badge>;
      case 'em_processo':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Processo</Badge>;
      case 'pendente':
        return <Badge className="bg-red-100 text-red-800">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getComplianceScore = (metrics: any) => {
    if (!metrics) return 0;

    let score = 30; // Base

    // Questionários respondidos
    if (metrics.totalResponses) {
      score += Math.min(metrics.totalResponses * 2, 20);
    }

    // Engajamento
    if (metrics.engagementRate) {
      score += Math.min(metrics.engagementRate * 0.3, 25);
    }

    // Atividades completadas
    if (metrics.activities) {
      score += Math.min(metrics.activities * 0.5, 15);
    }

    // Score de satisfação
    if (metrics.satisfactionScore) {
      score += Math.min(metrics.satisfactionScore, 10);
    }

    return Math.min(Math.round(score), 100);
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 80) return 'EXCELENTE';
    if (score >= 60) return 'BOM';
    return 'REQUER ATENÇÃO';
  };

  if (loading) {
    return (
      <CompanyDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </CompanyDashboardLayout>
    );
  }

  if (!report) {
    return (
      <CompanyDashboardLayout>
        <div className="p-6 text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Relatório não encontrado</h2>
          <p className="text-gray-600">O relatório solicitado não foi encontrado ou não existe.</p>
          <Button onClick={() => navigate('/company/relatorios')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Relatórios
          </Button>
        </div>
      </CompanyDashboardLayout>
    );
  }

  const reportData = report.report_data || {};
  const metrics = reportData.metrics || {};
  const insights = reportData.insights || {};
  const complianceScore = getComplianceScore(metrics);

  console.log('🔍 CompanyComplianceReport: Estrutura dos dados:', {
    hasReportData: !!report.report_data,
    reportDataKeys: Object.keys(reportData),
    hasMetrics: !!metrics,
    metricsKeys: Object.keys(metrics),
    hasInsights: !!insights,
    insightsKeys: Object.keys(insights),
    complianceScore
  });

  console.log('🔍 CompanyComplianceReport: Dados do relatório:', {
    report,
    reportData,
    metrics,
    insights,
    complianceScore,
    pdf_url: report.pdf_url,
    pdf_size_bytes: (report as any).pdf_size_bytes
  });

  return (
    <CompanyDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/company/relatorios')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
              <p className="text-gray-600">
                {getReportTypeLabel(report.report_type)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(report.status)}
            <div className="text-xs text-gray-500">
              PDF URL: {report.pdf_url ? '✅ Disponível' : '❌ Não disponível'}
            </div>
            {report.pdf_url && (
              <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            )}
          </div>
        </div>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Período</p>
                <p className="text-sm text-gray-900">
                  {format(new Date(report.report_period_start), 'dd/MM/yyyy', { locale: ptBR })} a {' '}
                  {format(new Date(report.report_period_end), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Gerado em</p>
                <p className="text-sm text-gray-900">
                  {format(new Date(report.generated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <p className="text-sm text-gray-900 capitalize">{report.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-yellow-700 overflow-auto">
              {JSON.stringify({
                report_id: report.id,
                report_type: report.report_type,
                pdf_url: report.pdf_url,
                pdf_size_bytes: (report as any).pdf_size_bytes,
                has_report_data: !!report.report_data,
                report_data_keys: report.report_data ? Object.keys(report.report_data) : [],
                metrics_keys: metrics ? Object.keys(metrics) : [],
                insights_keys: insights ? Object.keys(insights) : []
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Score de Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Score de Compliance
                </CardTitle>
                <CardDescription>
                  Baseado nas métricas coletadas automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-4xl font-bold ${getComplianceColor(complianceScore)}`}>
                    {complianceScore}%
                  </div>
                  <div className={`text-lg font-semibold ${getComplianceColor(complianceScore)}`}>
                    {getComplianceStatus(complianceScore)}
                  </div>
                  <Progress value={complianceScore} className="w-full" />
                  <p className="text-sm text-gray-600">
                    Este score é calculado automaticamente com base nos dados reais da empresa
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Resumo Executivo */}
            {insights.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Resumo Executivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Tendências */}
            {insights.trends && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Tendências Identificadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{insights.trends}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Métricas */}
          <TabsContent value="metrics" className="space-y-6">
            {/* Métricas de Questionários */}
            {metrics.totalResponses && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Métricas de Questionários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.totalResponses}
                      </div>
                      <div className="text-sm text-blue-700">Respostas Coletadas</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.averageScore || 0}/5
                      </div>
                      <div className="text-sm text-green-700">Score Médio</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {metrics.completionRate || 0}%
                      </div>
                      <div className="text-sm text-orange-700">Taxa de Conclusão</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Métricas de Usuários */}
            {metrics.totalUsers && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Métricas de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.totalUsers}
                      </div>
                      <div className="text-sm text-blue-700">Total de Colaboradores</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.activeUsers || 0}
                      </div>
                      <div className="text-sm text-green-700">Usuários Ativos</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {metrics.engagementRate || 0}%
                      </div>
                      <div className="text-sm text-orange-700">Taxa de Engajamento</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Métricas de Atividades */}
            {metrics.activities && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Métricas de Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.activities}
                      </div>
                      <div className="text-sm text-blue-700">Atividades Realizadas</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.workshops || 0}
                      </div>
                      <div className="text-sm text-green-700">Workshops</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="space-y-6">
            {/* Recomendações */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Recomendações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Fatores de Risco */}
            {insights.riskFactors && insights.riskFactors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Fatores de Risco
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.riskFactors.map((risk: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Oportunidades */}
            {insights.opportunities && insights.opportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Oportunidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.opportunities.map((opp: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Award className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{opp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Próximos Passos */}
            {insights.nextSteps && insights.nextSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Próximos Passos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.nextSteps.map((step: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Detalhes */}
          <TabsContent value="details" className="space-y-6">
            {/* Informações Adicionais */}
            {(reportData.highlights || reportData.plannedActions || reportData.challenges) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Informações Adicionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reportData.highlights && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Destaques</p>
                      <p className="text-sm text-gray-900 mt-1">{reportData.highlights}</p>
                    </div>
                  )}
                  {reportData.plannedActions && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Ações Planejadas</p>
                      <p className="text-sm text-gray-900 mt-1">{reportData.plannedActions}</p>
                    </div>
                  )}
                  {reportData.challenges && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Desafios Identificados</p>
                      <p className="text-sm text-gray-900 mt-1">{reportData.challenges}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Dados Técnicos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Dados Técnicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">ID do Relatório</p>
                    <p className="text-sm text-gray-900 font-mono">{report.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Empresa ID</p>
                    <p className="text-sm text-gray-900 font-mono">{report.company_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tipo</p>
                    <p className="text-sm text-gray-900">{report.report_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Versão do Template</p>
                    <p className="text-sm text-gray-900">{reportData.template_version || '1.0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CompanyDashboardLayout>
  );
};

export default CompanyComplianceReport;
