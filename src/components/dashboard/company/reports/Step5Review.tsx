import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Brain,
  Target,
  Award,
  Shield,
  Download,
  Eye,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Step5ReviewProps {
  reportData: any;
  updateReportData: (data: any) => void;
}

const Step5Review: React.FC<Step5ReviewProps> = ({
  reportData,
  updateReportData
}) => {
  const getReportTypeLabel = () => {
    switch (reportData.reportType) {
      case 'lei14831':
        return 'Lei 14.831/2024 - Certificado Empresa Promotora da Saúde Mental';
      case 'nr1':
        return 'NR-1 - Riscos Psicossociais';
      default:
        return 'Relatório Personalizado';
    }
  };

  const getComplianceScore = () => {
    const factors = [
      reportData.collectedData.activities >= 12 ? 20 : 10,
      reportData.collectedData.engagementRate >= 70 ? 25 : 15,
      reportData.collectedData.participationRate >= 75 ? 25 : 15,
      reportData.collectedData.satisfactionScore >= 7 ? 20 : 10,
      reportData.collectedData.activeUsers >= 100 ? 10 : 5
    ];
    return factors.reduce((sum, val) => sum + val, 0);
  };

  const reportSections = [
    {
      title: 'Configuração',
      icon: FileText,
      items: [
        { label: 'Tipo', value: getReportTypeLabel() },
        { label: 'Período', value: reportData.periodStart && reportData.periodEnd 
          ? `${format(reportData.periodStart, 'dd/MM/yyyy', { locale: ptBR })} - ${format(reportData.periodEnd, 'dd/MM/yyyy', { locale: ptBR })}`
          : 'Não definido' 
        }
      ]
    },
    {
      title: 'Métricas Principais',
      icon: Target,
      items: [
        { label: 'Atividades Realizadas', value: reportData.collectedData.activities },
        { label: 'Taxa de Engajamento', value: `${reportData.collectedData.engagementRate}%` },
        { label: 'Usuários Ativos', value: reportData.collectedData.activeUsers },
        { label: 'Score de Compliance', value: `${getComplianceScore()}%` }
      ]
    },
    {
      title: 'Evidências',
      icon: Shield,
      items: [
        { label: 'Documentos Anexados', value: reportData.evidenceFiles?.length || 0 },
        { label: 'Screenshots', value: reportData.includeScreenshots ? 'Sim' : 'Não' },
        { label: 'Gráficos', value: reportData.includeCharts ? 'Sim' : 'Não' },
        { label: 'Depoimentos', value: reportData.includeTestimonials ? 'Sim' : 'Não' }
      ]
    },
    {
      title: 'Informações Adicionais',
      icon: Award,
      items: [
        { label: 'Destaques', value: reportData.highlights ? 'Preenchido' : 'Não preenchido' },
        { label: 'Ações Planejadas', value: reportData.plannedActions ? 'Preenchido' : 'Não preenchido' },
        { label: 'Desafios', value: reportData.challenges ? 'Preenchido' : 'Não preenchido' }
      ]
    }
  ];

  const isReportComplete = () => {
    return reportData.periodStart && 
           reportData.periodEnd && 
           reportData.collectedData.activities > 0 &&
           reportData.approverName &&
           reportData.approverEmail;
  };

  return (
    <div className="space-y-6">
      {/* Header de Status */}
      <Card className={`border-2 ${
        isReportComplete() 
          ? 'bg-green-50 border-green-300' 
          : 'bg-yellow-50 border-yellow-300'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isReportComplete() ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isReportComplete() 
                    ? 'Relatório Pronto para Geração!' 
                    : 'Revise os Dados Antes de Gerar'
                  }
                </h3>
                <p className="text-sm text-gray-600">
                  {isReportComplete() 
                    ? 'Todos os dados foram coletados e validados com sucesso.' 
                    : 'Preencha as informações pendentes antes de continuar.'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {getComplianceScore()}%
              </div>
              <p className="text-xs text-gray-600">Score de Compliance</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Resumo do Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportSections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <Card key={index}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IconComponent className="h-5 w-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">{section.title}</h4>
                </div>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.label}:</span>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Preview do Relatório */}
      <Card>
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview do Relatório
          </h4>
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="text-center pb-4 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {getReportTypeLabel()}
              </h2>
              <p className="text-gray-600 mt-1">
                Período: {reportData.periodStart && reportData.periodEnd 
                  ? `${format(reportData.periodStart, 'dd/MM/yyyy', { locale: ptBR })} - ${format(reportData.periodEnd, 'dd/MM/yyyy', { locale: ptBR })}`
                  : 'Não definido'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {reportData.collectedData.activities}
                </p>
                <p className="text-sm text-gray-600">Atividades</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {reportData.collectedData.engagementRate}%
                </p>
                <p className="text-sm text-gray-600">Engajamento</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">
                  {reportData.collectedData.meditationHours.toLocaleString()}h
                </p>
                <p className="text-sm text-gray-600">Meditação</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-700">
                Este relatório demonstra o compromisso da empresa com a saúde mental dos colaboradores, 
                apresentando métricas detalhadas, evidências documentadas e análises qualitativas do período.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Visualizar Completo
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Baixar Rascunho
            </Button>
          </div>
        </div>
      </Card>

      {/* Informações do Aprovador */}
      <Card>
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Responsável pela Aprovação
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="approver-name">Nome Completo *</Label>
              <Input
                id="approver-name"
                value={reportData.approverName || ''}
                onChange={(e) => updateReportData({ approverName: e.target.value })}
                placeholder="Digite o nome do responsável"
              />
            </div>
            <div>
              <Label htmlFor="approver-email">Email *</Label>
              <Input
                id="approver-email"
                type="email"
                value={reportData.approverEmail || ''}
                onChange={(e) => updateReportData({ approverEmail: e.target.value })}
                placeholder="email@empresa.com"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmação Final */}
      <Card className="border-2 border-blue-200">
        <div className="p-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirm"
              checked={reportData.confirmed}
              onCheckedChange={(checked) => updateReportData({ confirmed: checked })}
            />
            <div className="flex-1">
              <Label htmlFor="confirm" className="text-sm font-medium cursor-pointer">
                Confirmo que revisei todas as informações e autorizo a geração do relatório
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Ao confirmar, você declara que as informações fornecidas são verdadeiras e 
                completas, e que o relatório pode ser usado para fins de compliance.
              </p>
            </div>
          </div>

          {reportData.confirmed && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  Relatório autorizado para geração
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Opções de Distribuição */}
      <Card>
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Opções de Distribuição
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox id="send-email" defaultChecked />
              <Label htmlFor="send-email" className="text-sm cursor-pointer">
                Enviar por email para o aprovador após geração
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="save-cloud" defaultChecked />
              <Label htmlFor="save-cloud" className="text-sm cursor-pointer">
                Salvar cópia na nuvem para acesso futuro
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="notify-team" />
              <Label htmlFor="notify-team" className="text-sm cursor-pointer">
                Notificar equipe de compliance
              </Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Mensagem de validação */}
      {!isReportComplete() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Informações pendentes:</p>
              <ul className="list-disc list-inside space-y-1">
                {!reportData.periodStart && <li>Defina a data de início do período</li>}
                {!reportData.periodEnd && <li>Defina a data de término do período</li>}
                {!reportData.approverName && <li>Informe o nome do responsável pela aprovação</li>}
                {!reportData.approverEmail && <li>Informe o email do responsável</li>}
                {!reportData.confirmed && <li>Confirme a autorização para gerar o relatório</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5Review;
