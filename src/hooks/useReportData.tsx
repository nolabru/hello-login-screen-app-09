
import { useState, useEffect } from 'react';

export interface ReportField {
  label: string;
  value: string;
  multiline: boolean;
}

export interface ReportSection {
  title: string;
  fields: {
    [key: string]: ReportField;
  };
}

export interface ReportData {
  [key: string]: ReportSection;
}

export function useReportData() {
  // Try to load saved data from localStorage
  const loadSavedData = (): ReportData => {
    try {
      const savedData = localStorage.getItem('compliance-report-data');
      return savedData ? JSON.parse(savedData) : getInitialReportData();
    } catch (error) {
      console.error("Error loading saved report data:", error);
      return getInitialReportData();
    }
  };

  const [reportData, setReportData] = useState<ReportData>(loadSavedData);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('compliance-report-data', JSON.stringify(reportData));
  }, [reportData]);
  
  // Function to update a field in the report
  const updateReportField = (sectionKey: string, fieldKey: string, value: string) => {
    setReportData(prevData => ({
      ...prevData,
      [sectionKey]: {
        ...prevData[sectionKey],
        fields: {
          ...prevData[sectionKey].fields,
          [fieldKey]: {
            ...prevData[sectionKey].fields[fieldKey],
            value
          }
        }
      }
    }));
  };
  
  return { reportData, updateReportField };
}

// Define the initial structure of the report
function getInitialReportData(): ReportData {
  return {
    companyInfo: {
      title: "Identificação da Empresa",
      fields: {
        companyName: { label: "Razão Social", value: "", multiline: false },
        cnpj: { label: "CNPJ", value: "", multiline: false },
        sector: { label: "Setor de Atuação", value: "", multiline: false },
        employeeCount: { label: "Número de Funcionários", value: "", multiline: false },
        reportPeriod: { label: "Período de Referência do Relatório", value: "", multiline: false },
      }
    },
    execSummary: {
      title: "Resumo Executivo",
      fields: {
        reportObjective: { label: "Objetivo do Relatório", value: "", multiline: true },
        mainActions: { label: "Principais Ações Implementadas", value: "", multiline: true },
        relevantResults: { label: "Resultados e Indicadores Relevantes", value: "", multiline: true },
      }
    },
    mentalHealthPolicies: {
      title: "Políticas de Saúde Mental",
      fields: {
        policyDescription: { label: "Descrição das Políticas Internas", value: "", multiline: true },
        implementationDate: { label: "Data de Implementação e Última Atualização", value: "", multiline: false },
        awarenessActions: { label: "Ações de Divulgação e Conscientização Interna", value: "", multiline: true },
      }
    },
    programs: {
      title: "Programas e Atividades Realizadas",
      fields: {
        psychSessions: { label: "Sessões Psicológicas Gratuitas Oferecidas", value: "", multiline: true },
        sessionCount: { label: "Número de Sessões Realizadas", value: "", multiline: false },
        employeeAdherence: { label: "Frequência e Aderência dos Funcionários", value: "", multiline: true },
        campaigns: { label: "Campanhas de Conscientização", value: "", multiline: true },
        topics: { label: "Temas Abordados", value: "", multiline: true },
        divulgationMethods: { label: "Métodos de Divulgação", value: "", multiline: true },
        managerTraining: { label: "Treinamentos para Gestores e Lideranças", value: "", multiline: true },
        trainingContent: { label: "Conteúdo Programático", value: "", multiline: true },
        participantCount: { label: "Número de Participantes", value: "", multiline: false },
        effectivenessEval: { label: "Avaliação de Efetividade", value: "", multiline: true },
      }
    },
    supportProtocols: {
      title: "Protocolos de Atendimento e Suporte",
      fields: {
        crisisProtocols: { label: "Procedimentos para Identificação e Acolhimento em Situação de Crise", value: "", multiline: true },
        referralProtocols: { label: "Protocolos de Encaminhamento para Atendimento Especializado", value: "", multiline: true },
        reintegrationMechanisms: { label: "Mecanismos de Acompanhamento e Reintegração ao Ambiente de Trabalho", value: "", multiline: true },
      }
    },
    workplaceFlex: {
      title: "Flexibilidade e Adaptações no Ambiente de Trabalho",
      fields: {
        flexMeasures: { label: "Medidas de Flexibilização de Horários e Jornadas", value: "", multiline: true },
        workAdjustments: { label: "Ajustes Realizados para Funcionários Diagnosticados com Transtornos", value: "", multiline: true },
        effectivenessAssessment: { label: "Avaliação da Eficácia dessas Medidas", value: "", multiline: true },
      }
    },
    communication: {
      title: "Canais de Comunicação e Denúncia",
      fields: {
        channelsDescription: { label: "Descrição dos Canais Confidenciais Disponibilizados", value: "", multiline: true },
        reportCount: { label: "Número de Relatos Recebidos", value: "", multiline: false },
        responseProcedures: { label: "Procedimentos de Resposta e Acompanhamento", value: "", multiline: true },
      }
    },
    indicators: {
      title: "Indicadores e Resultados",
      fields: {
        absenteeismRate: { label: "Taxa de Absenteísmo Relacionado à Saúde Mental", value: "", multiline: true },
        climateResults: { label: "Resultados de Pesquisas de Clima Organizacional", value: "", multiline: true },
        employeeFeedback: { label: "Feedback dos Funcionários sobre as Iniciativas Implementadas", value: "", multiline: true },
      }
    },
    challenges: {
      title: "Desafios e Planos de Ação Futuros",
      fields: {
        mainChallenges: { label: "Principais Desafios Enfrentados na Implementação das Ações", value: "", multiline: true },
        lessonsLearned: { label: "Lições Aprendidas", value: "", multiline: true },
        futurePlans: { label: "Planejamento de Ações Futuras para Melhoria Contínua", value: "", multiline: true },
      }
    },
    attachments: {
      title: "Anexos",
      fields: {
        internalPolicies: { label: "Documentos de Políticas Internas", value: "", multiline: true },
        campaignMaterials: { label: "Materiais de Campanhas e Treinamentos", value: "", multiline: true },
        evaluationReports: { label: "Relatórios de Avaliações e Pesquisas Internas", value: "", multiline: true },
      }
    }
  };
}
