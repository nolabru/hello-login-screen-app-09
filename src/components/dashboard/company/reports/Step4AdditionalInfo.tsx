import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Lightbulb,
  Target,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Shield
} from 'lucide-react';

interface Step4AdditionalInfoProps {
  reportData: any;
  updateReportData: (data: any) => void;
}

const Step4AdditionalInfo: React.FC<Step4AdditionalInfoProps> = ({
  reportData,
  updateReportData
}) => {
  const sections = [
    {
      id: 'highlights',
      title: 'Destaques do Período',
      placeholder: 'Descreva as principais conquistas e iniciativas de sucesso realizadas no período. Por exemplo: lançamento de novos programas, parcerias estabelecidas, marcos alcançados, reconhecimentos recebidos, etc.',
      icon: Lightbulb,
      color: 'text-yellow-600 bg-yellow-50',
      value: reportData.highlights
    },
    {
      id: 'plannedActions',
      title: 'Ações Planejadas',
      placeholder: 'Liste as ações e iniciativas planejadas para o próximo período. Inclua datas previstas, objetivos específicos e recursos necessários.',
      icon: Target,
      color: 'text-blue-600 bg-blue-50',
      value: reportData.plannedActions
    },
    {
      id: 'challenges',
      title: 'Desafios Identificados',
      placeholder: 'Descreva os principais desafios encontrados e as estratégias para superá-los. Seja transparente sobre dificuldades de engajamento, recursos limitados ou outras barreiras.',
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-50',
      value: reportData.challenges
    }
  ];

  const suggestions = {
    highlights: [
      'Implementação bem-sucedida do programa de mindfulness',
      'Aumento de 30% no uso do app Calma',
      'Parceria com psicólogos especializados',
      'Reconhecimento como empresa promotora de saúde mental',
      'Redução de 25% no absenteísmo'
    ],
    plannedActions: [
      'Workshop de gestão do estresse em Fevereiro',
      'Implementação de grupos de apoio semanais',
      'Treinamento de líderes em saúde mental',
      'Campanha de conscientização sobre burnout',
      'Expansão do programa para filiais'
    ],
    challenges: [
      'Baixa adesão inicial em alguns departamentos',
      'Necessidade de maior engajamento da liderança',
      'Ajustes no horário das atividades',
      'Adaptação para formato híbrido/remoto',
      'Comunicação mais efetiva sobre benefícios'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Introdução */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Informações Complementares
              </h4>
              <p className="text-sm text-blue-800">
                Adicione contexto e informações qualitativas que enriqueçam o relatório.
                Estes campos ajudam a contar a história por trás dos números.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Campos de texto */}
      {sections.map((section) => {
        const IconComponent = section.icon;
        const sectionSuggestions = suggestions[section.id as keyof typeof suggestions];

        return (
          <div key={section.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${section.color}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label htmlFor={section.id} className="text-base font-semibold">
                  {section.title}
                </Label>
              </div>
            </div>

            <Textarea
              id={section.id}
              value={section.value || ''}
              onChange={(e) => updateReportData({ [section.id]: e.target.value })}
              placeholder={section.placeholder}
              rows={5}
              className="resize-none"
            />

            {/* Sugestões */}
            {sectionSuggestions && section.value === '' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">
                  Sugestões (clique para usar):
                </p>
                <div className="flex flex-wrap gap-2">
                  {sectionSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        const currentValue = reportData[section.id] || '';
                        const newValue = currentValue
                          ? `${currentValue}\n• ${suggestion}`
                          : `• ${suggestion}`;
                        updateReportData({ [section.id]: newValue });
                      }}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contador de caracteres */}
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {section.value?.length || 0} caracteres
              </p>
              {section.value && section.value.length > 0 && (
                <button
                  type="button"
                  onClick={() => updateReportData({ [section.id]: '' })}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Informações do Aprovador */}
      <Card className="bg-purple-50 border-purple-200">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-1">
                Responsável pela Aprovação
              </h4>
              <p className="text-sm text-purple-800">
                Informe os dados da pessoa responsável por aprovar este relatório de compliance.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="approver-name" className="text-sm font-medium">
            Nome Completo do Aprovador *
          </Label>
          <Input
            id="approver-name"
            placeholder="Digite o nome completo"
            value={reportData.approverName || ''}
            onChange={(e) => updateReportData({ approverName: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="approver-email" className="text-sm font-medium">
            Email do Aprovador *
          </Label>
          <Input
            id="approver-email"
            type="email"
            placeholder="email@empresa.com"
            value={reportData.approverEmail || ''}
            onChange={(e) => updateReportData({ approverEmail: e.target.value })}
            className="w-full"
          />
        </div>
      </div>

      {/* Dicas de preenchimento */}
      <Card>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Dicas para um relatório eficaz
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5" />
                  <span>
                    <strong>Seja específico:</strong> Use números, datas e exemplos concretos sempre que possível.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5" />
                  <span>
                    <strong>Demonstre progresso:</strong> Compare com períodos anteriores e mostre evolução.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5" />
                  <span>
                    <strong>Seja transparente:</strong> Reconheça desafios mostra maturidade e comprometimento.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5" />
                  <span>
                    <strong>Foque no impacto:</strong> Relacione as ações com benefícios para os colaboradores.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Status de preenchimento */}
      <Card className={`border-2 ${(reportData.highlights || reportData.plannedActions || reportData.challenges) &&
          reportData.approverName && reportData.approverEmail
          ? 'bg-green-50 border-green-300'
          : 'bg-yellow-50 border-yellow-300'
        }`}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Shield className={`h-5 w-5 ${(reportData.highlights || reportData.plannedActions || reportData.challenges) &&
                reportData.approverName && reportData.approverEmail
                ? 'text-green-600'
                : 'text-yellow-600'
              }`} />
            <div>
              <p className={`font-medium ${(reportData.highlights || reportData.plannedActions || reportData.challenges) &&
                  reportData.approverName && reportData.approverEmail
                  ? 'text-green-900'
                  : 'text-yellow-900'
                }`}>
                {(reportData.highlights || reportData.plannedActions || reportData.challenges) &&
                  reportData.approverName && reportData.approverEmail
                  ? 'Todas as informações foram preenchidas!'
                  : 'Complete as informações obrigatórias para continuar'
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Campos preenchidos: {
                  [reportData.highlights, reportData.plannedActions, reportData.challenges,
                  reportData.approverName, reportData.approverEmail]
                    .filter(Boolean).length
                } de 5
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Step4AdditionalInfo;
