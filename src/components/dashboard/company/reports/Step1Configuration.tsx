import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Calendar as CalendarIcon,
  FileText,
  Award,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Step1ConfigurationProps {
  reportData: any;
  updateReportData: (data: any) => void;
}

const Step1Configuration: React.FC<Step1ConfigurationProps> = ({
  reportData,
  updateReportData
}) => {
  const reportTypes = [
    {
      value: 'lei14831',
      title: 'Lei 14.831/2024',
      description: 'Certificado Empresa Promotora da Saúde Mental',
      icon: Award,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      value: 'nr1',
      title: 'NR-1',
      description: 'Riscos Psicossociais no Ambiente de Trabalho',
      icon: FileCheck,
      color: 'text-green-600 bg-green-50'
    },
    {
      value: 'customizado',
      title: 'Personalizado',
      description: 'Relatório customizado com métricas selecionadas',
      icon: FileText,
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tipo de Relatório */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Selecione o tipo de relatório
        </Label>
        <RadioGroup 
          value={reportData.reportType}
          onValueChange={(value) => updateReportData({ reportType: value })}
        >
          <div className="grid gap-4">
            {reportTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Card 
                  key={type.value}
                  className={`cursor-pointer transition-all ${
                    reportData.reportType === type.value 
                      ? 'ring-2 ring-blue-500 bg-blue-50/50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => updateReportData({ reportType: type.value })}
                >
                  <div className="p-4 flex items-start gap-4">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <div className={`p-3 rounded-lg ${type.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={type.value} className="text-base font-semibold cursor-pointer">
                        {type.title}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Período do Relatório */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Período do relatório
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Data de início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reportData.periodStart 
                    ? format(reportData.periodStart, 'dd/MM/yyyy', { locale: ptBR })
                    : "Selecione a data"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={reportData.periodStart}
                  onSelect={(date) => updateReportData({ periodStart: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">Data de término</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reportData.periodEnd 
                    ? format(reportData.periodEnd, 'dd/MM/yyyy', { locale: ptBR })
                    : "Selecione a data"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={reportData.periodEnd}
                  onSelect={(date) => updateReportData({ periodEnd: date })}
                  disabled={(date) => reportData.periodStart && date < reportData.periodStart}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Validação de período */}
        {reportData.periodStart && reportData.periodEnd && (
          <div className="flex items-center gap-2 text-sm">
            {reportData.periodEnd >= reportData.periodStart ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-600">
                  Período válido: {Math.ceil((reportData.periodEnd - reportData.periodStart) / (1000 * 60 * 60 * 24))} dias
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600">
                  A data de término deve ser posterior à data de início
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Informações sobre o tipo selecionado */}
      {reportData.reportType && (
        <Card className="bg-blue-50/50 border-blue-200">
          <div className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              Sobre este relatório
            </h4>
            {reportData.reportType === 'lei14831' && (
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  Este relatório demonstra o cumprimento dos requisitos da Lei 14.831/2024, 
                  que estabelece o Certificado Empresa Promotora da Saúde Mental.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Atividades de promoção da saúde mental</li>
                  <li>Taxa de participação dos colaboradores</li>
                  <li>Indicadores de bem-estar organizacional</li>
                  <li>Ações preventivas implementadas</li>
                </ul>
              </div>
            )}
            {reportData.reportType === 'nr1' && (
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  Relatório focado na gestão de riscos psicossociais conforme a NR-1, 
                  incluindo identificação, avaliação e controle de fatores de risco.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Avaliação de riscos psicossociais</li>
                  <li>Medidas de controle implementadas</li>
                  <li>Monitoramento de indicadores</li>
                  <li>Planos de ação corretiva</li>
                </ul>
              </div>
            )}
            {reportData.reportType === 'customizado' && (
              <div className="text-sm text-blue-800">
                <p>
                  Relatório personalizado que permite selecionar métricas específicas 
                  e adicionar informações customizadas conforme a necessidade da empresa.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Step1Configuration;
