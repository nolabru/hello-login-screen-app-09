import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Activity,
  Users,
  Target,
  TrendingUp,
  FileText,
  Award,
  Calendar,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ReportDataService } from '@/services/reportDataService';

interface Step2DataCollectionProps {
  reportData: any;
  updateReportData: (data: any) => void;
}

const Step2DataCollection: React.FC<Step2DataCollectionProps> = ({
  reportData,
  updateReportData
}) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  // Buscar dados reais usando o serviço
  useEffect(() => {
    const collectData = async () => {
      if (!reportData.periodStart || !reportData.periodEnd) return;
      
      setLoading(true);
      try {
        // Buscar ID da empresa do usuário
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
        
        if (!profile?.company_id) return;
        
        // Buscar métricas reais
        const metrics = await ReportDataService.fetchReportMetrics(
          profile.company_id,
          new Date(reportData.periodStart),
          new Date(reportData.periodEnd)
        );
        
        // Calcular score de compliance
        const complianceScore = ReportDataService.calculateComplianceScore(metrics);
        
        // Gerar insights automáticos
        const generatedInsights = ReportDataService.generateInsights(metrics);
        setInsights(generatedInsights);
        
        // Formatar dados para o formato esperado pelo componente
        const collectedData = {
          activities: metrics.totalActivities,
          completedActivities: metrics.completedActivities,
          meditationHours: metrics.meditationHours,
          conversationSessions: metrics.conversationSessions,
          activeUsers: metrics.activeUsers,
          engagementRate: metrics.engagementRate,
          diaryEntries: metrics.diaryEntries,
          workshops: metrics.workshops,
          lectures: metrics.lectures,
          supportGroups: metrics.supportGroups,
          participationRate: metrics.participationRate,
          satisfactionScore: metrics.satisfactionScore,
          totalEmployees: metrics.totalEmployees,
          departmentMetrics: metrics.departmentMetrics,
          complianceScore
        };
        
        updateReportData({ collectedData, insights: generatedInsights });
      } catch (error) {
        console.error('Erro ao coletar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    collectData();
  }, [reportData.periodStart, reportData.periodEnd, updateReportData]);

  const metrics = [
    {
      category: 'Atividades Realizadas',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      items: [
        { label: 'Total de Atividades', value: reportData.collectedData.activities, unit: '' },
        { label: 'Workshops', value: reportData.collectedData.workshops, unit: '' },
        { label: 'Palestras', value: reportData.collectedData.lectures, unit: '' },
        { label: 'Grupos de Apoio', value: reportData.collectedData.supportGroups, unit: '' }
      ]
    },
    {
      category: 'Uso do App Calma',
      icon: Brain,
      color: 'bg-purple-50 text-purple-600',
      items: [
        { label: 'Horas de Meditação', value: reportData.collectedData.meditationHours.toLocaleString(), unit: 'h' },
        { label: 'Sessões de Conversa', value: reportData.collectedData.conversationSessions.toLocaleString(), unit: '' },
        { label: 'Registros de Diário', value: reportData.collectedData.diaryEntries.toLocaleString(), unit: '' },
        { label: 'Usuários Ativos', value: reportData.collectedData.activeUsers, unit: '' }
      ]
    },
    {
      category: 'Indicadores de Engajamento',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
      items: [
        { label: 'Taxa de Engajamento', value: reportData.collectedData.engagementRate, unit: '%' },
        { label: 'Taxa de Participação', value: reportData.collectedData.participationRate, unit: '%' },
        { label: 'Satisfação Média', value: reportData.collectedData.satisfactionScore, unit: '/10' }
      ]
    }
  ];

  const getComplianceScore = () => {
    // Calcular score baseado nos dados coletados
    const factors = [
      reportData.collectedData.activities >= 12 ? 20 : 10,
      reportData.collectedData.engagementRate >= 70 ? 25 : 15,
      reportData.collectedData.participationRate >= 75 ? 25 : 15,
      reportData.collectedData.satisfactionScore >= 7 ? 20 : 10,
      reportData.collectedData.activeUsers >= 100 ? 10 : 5
    ];
    return factors.reduce((sum, val) => sum + val, 0);
  };

  const complianceScore = getComplianceScore();

  return (
    <div className="space-y-6">
      {/* Header com Score de Compliance */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Dados Coletados Automaticamente
                </h3>
                <p className="text-sm text-gray-600">
                  Período: {reportData.periodStart && reportData.periodEnd 
                    ? `${new Date(reportData.periodStart).toLocaleDateString('pt-BR')} - ${new Date(reportData.periodEnd).toLocaleDateString('pt-BR')}`
                    : 'Defina o período no passo anterior'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {complianceScore}%
              </div>
              <p className="text-xs text-gray-600">Score de Compliance</p>
            </div>
          </div>
          <Progress value={complianceScore} className="h-3" />
          <div className="flex items-center gap-2 mt-3">
            {complianceScore >= 80 ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Excelente! Empresa em conformidade com os requisitos
                </span>
              </>
            ) : complianceScore >= 60 ? (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-700 font-medium">
                  Bom progresso, mas há espaço para melhorias
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-700 font-medium">
                  Atenção: Ações necessárias para atingir conformidade
                </span>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Métricas Categorizadas */}
      <div className="grid gap-6">
        {metrics.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <Card key={index}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {category.category}
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="space-y-1">
                      <p className="text-sm text-gray-600">{item.label}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {item.value}{item.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Insights Automáticos */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Insights Identificados
          </h4>
          <div className="space-y-3">
            {reportData.collectedData.engagementRate >= 70 && (
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Positivo
                </Badge>
                <p className="text-sm text-gray-700">
                  Alta taxa de engajamento ({reportData.collectedData.engagementRate}%) demonstra 
                  boa adesão dos colaboradores às iniciativas de saúde mental.
                </p>
              </div>
            )}
            {reportData.collectedData.activities >= 12 && (
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Positivo
                </Badge>
                <p className="text-sm text-gray-700">
                  Número adequado de atividades realizadas no período, garantindo 
                  cobertura consistente de ações de bem-estar.
                </p>
              </div>
            )}
            {reportData.collectedData.satisfactionScore < 7 && (
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="bg-yellow-50">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Atenção
                </Badge>
                <p className="text-sm text-gray-700">
                  Score de satisfação abaixo do ideal. Considere revisar o formato 
                  e conteúdo das atividades oferecidas.
                </p>
              </div>
            )}
            {reportData.collectedData.meditationHours > 1000 && (
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="bg-blue-50">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Destaque
                </Badge>
                <p className="text-sm text-gray-700">
                  Excelente utilização do app Calma com mais de 1.000 horas de 
                  meditação acumuladas pelos colaboradores.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Nota sobre dados */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sobre os dados coletados</p>
            <p>
              Todos os dados foram coletados automaticamente das plataformas integradas. 
              As métricas refletem o período selecionado e são atualizadas em tempo real. 
              Você poderá adicionar evidências e informações complementares nos próximos passos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2DataCollection;
