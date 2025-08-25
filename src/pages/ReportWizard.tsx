import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ReportStorageService } from '@/services/reportStorageService';
import { ReportPDFService } from '@/services/ReportPDFService';
import { FileUploadService } from '@/services/FileUploadService';
import { AIService } from '@/services/AIService';
import { getRealCompanyDashboardData } from '@/services/mobileAppDataService';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  ChevronRight
} from 'lucide-react';

// Import dos steps
import Step1Configuration from '@/components/dashboard/company/reports/Step1Configuration';
import Step2DataCollection from '@/components/dashboard/company/reports/Step2DataCollection';
import Step3Evidence from '@/components/dashboard/company/reports/Step3Evidence';
import Step4AdditionalInfo from '@/components/dashboard/company/reports/Step4AdditionalInfo';
import Step5Review from '@/components/dashboard/company/reports/Step5Review';

interface ReportData {
  // Configuração inicial
  reportType: 'compliance_lei14831' | 'nr1_psicossocial' | 'customizado';
  periodStart: Date | null;
  periodEnd: Date | null;

  // Dados coletados
  collectedData: {
    activities: number;
    meditationHours: number;
    conversationSessions: number;
    activeUsers: number;
    engagementRate: number;
    diaryEntries: number;
    workshops: number;
    lectures: number;
    supportGroups: number;
    participationRate: number;
    satisfactionScore: number;
  };

  // Evidências
  evidenceFiles: File[];
  includeScreenshots: boolean;
  includeCharts: boolean;
  includeTestimonials: boolean;

  // Informações adicionais
  highlights: string;
  plannedActions: string;
  challenges: string;

  // Aprovação
  approverName: string;
  approverEmail: string;
  confirmed: boolean;
}

const ReportWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const reportType = searchParams.get('type') || 'custom';
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [reportData, setReportData] = useState<ReportData>({
    reportType: reportType === 'lei14831' ? 'compliance_lei14831' : reportType === 'nr1' ? 'nr1_psicossocial' : 'customizado',
    periodStart: null,
    periodEnd: null,
    collectedData: {
      activities: 0,
      meditationHours: 0,
      conversationSessions: 0,
      activeUsers: 0,
      engagementRate: 0,
      diaryEntries: 0,
      workshops: 0,
      lectures: 0,
      supportGroups: 0,
      participationRate: 0,
      satisfactionScore: 0
    },
    evidenceFiles: [],
    includeScreenshots: true,
    includeCharts: true,
    includeTestimonials: false,
    highlights: '',
    plannedActions: '',
    challenges: '',
    approverName: '',
    approverEmail: '',
    confirmed: false
  });

  const steps = [
    { number: 1, title: 'Configuração', description: 'Tipo e período do relatório' },
    { number: 2, title: 'Dados', description: 'Métricas coletadas automaticamente' },
    { number: 3, title: 'Evidências', description: 'Documentos e comprovações' },
    { number: 4, title: 'Informações', description: 'Destaques e observações' },
    { number: 5, title: 'Revisão', description: 'Aprovação final' }
  ];

  // Carregar profile do usuário no início
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('user_id', user.id)
            .single();

          if (userProfile) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);

    try {
      console.log('🚀 Iniciando geração de relatório...');

      // 1. Verificar se temos o profile carregado
      if (!profile?.company_id) {
        throw new Error('Perfil da empresa não carregado. Tente novamente.');
      }

      console.log('✅ Empresa identificada:', profile.company_id);

      // 2. Verificar dados obrigatórios
      if (!reportData.periodStart || !reportData.periodEnd) {
        throw new Error('Defina o período do relatório');
      }

      if (!reportData.approverName || !reportData.approverEmail) {
        throw new Error('Preencha as informações do aprovador');
      }

      // 3. Coletar métricas REAIS da empresa
      toast({ title: 'Coletando métricas reais...', description: 'Buscando dados atualizados da empresa.' });

      const realData = await getRealCompanyDashboardData(profile.company_id);
      console.log('✅ Métricas reais coletadas:', realData);

      // 4. Enriquecer dados coletados com métricas reais
      const enrichedData = {
        ...reportData.collectedData,
        // Dados reais de questionários
        totalQuestionnaires: realData?.questionnaireMetrics?.totalQuestionnaires || 0,
        totalResponses: realData?.questionnaireMetrics?.totalResponses || 0,
        averageScore: realData?.questionnaireMetrics?.averageScore || 0,
        completionRate: realData?.questionnaireMetrics?.completionRate || 0,
        // Dados reais de usuários
        totalUsers: realData?.userMetrics?.totalUsers || 0,
        activeUsers: realData?.userMetrics?.activeUsers || 0,
        engagementRate: realData?.userMetrics?.engagementRate || 0,
        // Dados reais de saúde mental
        totalAlerts: realData?.mentalHealthMetrics?.totalAlerts || 0,
        criticalAlerts: realData?.mentalHealthMetrics?.criticalAlerts || 0,
        moderateAlerts: realData?.mentalHealthMetrics?.moderateAlerts || 0
      };

      // 5. Gerar insights com IA (com fallback)
      let aiInsights;
      try {
        toast({ title: 'Gerando insights com IA...', description: 'Analisando dados e criando recomendações.' });
        aiInsights = await AIService.generateReportInsights(enrichedData);
        console.log('✅ Insights de IA gerados');
      } catch (aiError) {
        console.warn('⚠️ IA falhou, usando insights padrão:', aiError);
        aiInsights = {
          summary: 'Análise baseada em métricas reais coletadas automaticamente.',
          recommendations: [
            'Continue monitorando o engajamento dos colaboradores',
            'Mantenha a frequência dos questionários de bem-estar',
            'Analise tendências de saúde mental mensalmente'
          ],
          trends: 'Dados coletados mostram engajamento consistente da equipe.'
        };
      }

      // 6. Preparar dados para salvamento
      const saveData = {
        companyId: profile.company_id,
        reportType: reportData.reportType,
        periodStart: new Date(reportData.periodStart),
        periodEnd: new Date(reportData.periodEnd),
        metrics: enrichedData,
        insights: aiInsights,
        highlights: reportData.highlights,
        plannedActions: reportData.plannedActions,
        challenges: reportData.challenges,
        approverName: reportData.approverName,
        approverEmail: reportData.approverEmail,
        evidenceFiles: reportData.evidenceFiles || [],
        realData: realData // Incluir dados reais para referência
      };

      // 7. Salvar relatório no banco
      toast({ title: 'Salvando relatório...', description: 'Armazenando dados no sistema.' });
      const reportId = await ReportStorageService.saveReport(saveData);
      console.log('✅ Relatório salvo com ID:', reportId);

      // 8. Gerar PDF com dados reais
      toast({ title: 'Gerando PDF do relatório...', description: 'Criando documento profissional com métricas reais.' });

      const pdfBlob = await ReportPDFService.generatePDF({
        ...saveData,
        title: ReportStorageService.generateReportTitle(saveData.reportType, saveData.periodStart, saveData.periodEnd)
      });

      console.log('✅ PDF gerado, tamanho:', pdfBlob.size);

      // 9. Fazer upload do PDF
      toast({ title: 'Fazendo upload do PDF...', description: 'Salvando documento no sistema.' });

      const pdfFile = new File([pdfBlob], `relatorio_${reportId}.pdf`, { type: 'application/pdf' });
      const pdfUrl = await FileUploadService.uploadFile(pdfFile, 'report-pdfs', profile.company_id);

      console.log('✅ PDF enviado para:', pdfUrl);

      // 10. Atualizar relatório com URL do PDF
      console.log('🔧 ReportWizard: Chamando updateReportWithPDF com:', { reportId, pdfUrl, pdfSize: pdfFile.size });

      try {
        await ReportStorageService.updateReportWithPDF(reportId, pdfUrl, pdfFile.size);
        console.log('✅ Relatório atualizado com URL do PDF');
      } catch (updateError) {
        console.error('❌ Erro ao atualizar relatório com PDF:', updateError);
        throw updateError;
      }

      // 11. Sucesso!
      toast({
        title: '🎉 Relatório gerado com sucesso!',
        description: `PDF profissional criado com ${realData?.questionnaireMetrics?.totalResponses || 0} respostas reais e métricas atualizadas.`,
      });

      // 12. Navegar para visualização do relatório
      navigate(`/company/relatorios/${reportId}`);

    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar relatório',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportData = (data: Partial<ReportData>) => {
    setReportData(prev => ({ ...prev, ...data }));
  };

  const getReportTypeLabel = () => {
    switch (reportData.reportType) {
      case 'compliance_lei14831':
        return 'Lei 14.831/2024 - Certificado Empresa Promotora da Saúde Mental';
      case 'nr1_psicossocial':
        return 'NR-1 - Riscos Psicossociais no Ambiente de Trabalho';
      default:
        return 'Relatório Personalizado de Compliance';
    }
  };

  const progressPercentage = (currentStep / 5) * 100;

  return (
    <CompanyDashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerar Relatório de Compliance
            </h1>
            <p className="text-gray-600 mt-1">{getReportTypeLabel()}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/company/relatorios')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Passo {currentStep} de 5</span>
            <span className="text-gray-600">{progressPercentage}% completo</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-semibold
                    ${currentStep > step.number
                      ? 'bg-green-600 text-white'
                      : currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="text-center mt-2">
                  <p className={`text-sm font-medium ${currentStep === step.number ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando perfil...</span>
              </div>
            ) : (
              <>
                {currentStep === 1 && (
                  <Step1Configuration
                    reportData={reportData}
                    updateReportData={updateReportData}
                  />
                )}
                {currentStep === 2 && (
                  <Step2DataCollection
                    reportData={reportData}
                    updateReportData={updateReportData}
                  />
                )}
                {currentStep === 3 && (
                  <Step3Evidence
                    reportData={reportData}
                    updateReportData={updateReportData}
                  />
                )}
                {currentStep === 4 && (
                  <Step4AdditionalInfo
                    reportData={reportData}
                    updateReportData={updateReportData}
                  />
                )}
                {currentStep === 5 && (
                  <Step5Review
                    reportData={reportData}
                    onConfirm={(confirmed) => {
                      if (confirmed) {
                        handleGenerateReport();
                      }
                    }}
                    companyId={profile?.company_id}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerateReport}
              disabled={!reportData.confirmed || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </CompanyDashboardLayout>
  );
};

export default ReportWizard;
