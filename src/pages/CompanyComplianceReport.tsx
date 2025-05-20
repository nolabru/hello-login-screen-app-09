
import React, { useState } from 'react';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import CompanyReportSection from '@/components/dashboard/company/CompanyReportSection';
import { useReportData } from '@/hooks/useReportData';
import jsPDF from 'jspdf';

const CompanyComplianceReport = () => {
  const { toast } = useToast();
  const { reportData, updateReportField } = useReportData();
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let yOffset = 10;
    
    // Add title
    doc.setFontSize(20);
    doc.text("Relatório de Saúde Mental e Conformidade", 20, yOffset);
    yOffset += 10;
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, yOffset);
    yOffset += 15;
    
    // Loop through each section
    Object.entries(reportData).forEach(([sectionKey, section]) => {
      // Add section title
      doc.setFontSize(16);
      doc.text(section.title, 20, yOffset);
      yOffset += 10;
      
      // Add fields
      Object.entries(section.fields).forEach(([fieldKey, field]) => {
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }
        
        doc.setFontSize(12);
        doc.text(field.label, 20, yOffset);
        yOffset += 7;
        
        doc.setFontSize(10);
        
        // Handle multi-line text
        const value = field.value || "Não informado";
        const lines = doc.splitTextToSize(value, 170);
        doc.text(lines, 25, yOffset);
        yOffset += lines.length * 5 + 5;
      });
      
      yOffset += 10;
    });
    
    doc.save("relatorio-saude-mental-conformidade.pdf");
    
    toast({
      title: "Relatório baixado com sucesso",
      description: "O PDF foi gerado e baixado para o seu computador."
    });
  };

  // Agrupar as seções em categorias para melhor organização
  const tabGroups = [
    { id: "info", label: "Informações da Empresa", tabs: ["companyInfo", "execSummary"] },
    { id: "policies", label: "Políticas e Programas", tabs: ["mentalHealthPolicies", "programs"] },
    { id: "support", label: "Suporte e Flexibilidade", tabs: ["supportProtocols", "workplaceFlex"] },
    { id: "results", label: "Resultados e Planos", tabs: ["communication", "indicators", "challenges", "attachments"] },
  ];
  
  // Estado para controlar a navegação entre grupos e abas
  const [activeGroup, setActiveGroup] = useState("info");
  const [activeTab, setActiveTab] = useState("companyInfo");
  
  // Função para mudar de aba
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Encontrar o grupo ao qual a aba pertence
    for (const group of tabGroups) {
      if (group.tabs.includes(tabId)) {
        setActiveGroup(group.id);
        break;
      }
    }
  };

  // Mapeamento de IDs para títulos amigáveis
  const tabTitles: Record<string, string> = {
    companyInfo: "Identificação da Empresa",
    execSummary: "Resumo Executivo",
    mentalHealthPolicies: "Políticas de Saúde Mental",
    programs: "Programas e Atividades",
    supportProtocols: "Protocolos de Suporte",
    workplaceFlex: "Flexibilidade no Trabalho",
    communication: "Canais de Comunicação",
    indicators: "Indicadores e Resultados",
    challenges: "Desafios e Planos",
    attachments: "Anexos"
  };
  
  return (
    <CompanyDashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatório de Saúde Mental e Conformidade</h1>
            <p className="text-muted-foreground">
              Preencha as informações abaixo para gerar seu relatório de conformidade
            </p>
          </div>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        </div>

        {/* Navegação entre grupos de abas */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabGroups.map((group) => (
              <Button
                key={group.id}
                variant={activeGroup === group.id ? "default" : "outline"}
                onClick={() => {
                  setActiveGroup(group.id);
                  setActiveTab(group.tabs[0]);
                }}
                className="px-4 py-2"
              >
                {group.label}
              </Button>
            ))}
          </div>

          {/* Navegação entre abas dentro do grupo selecionado */}
          {tabGroups.map((group) => (
            activeGroup === group.id && (
              <div key={`tabs-${group.id}`} className="mb-6">
                <div className="flex flex-wrap gap-2 border rounded-lg p-2 bg-muted/20">
                  {group.tabs.map((tabId) => (
                    <Button
                      key={tabId}
                      variant={activeTab === tabId ? "secondary" : "ghost"}
                      onClick={() => setActiveTab(tabId)}
                      className="px-4 py-2"
                      size="sm"
                    >
                      {tabTitles[tabId]}
                    </Button>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
        
        {/* Conteúdo das abas */}
        <div className="mt-6">
          {activeTab === "companyInfo" && (
            <CompanyReportSection 
              title="Identificação da Empresa"
              sectionKey="companyInfo"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          )}
          
          {activeTab === "execSummary" && (
            <CompanyReportSection 
              title="Resumo Executivo"
              sectionKey="execSummary"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          )}
          
          {activeTab === "mentalHealthPolicies" && (
            <CompanyReportSection 
              title="Políticas de Saúde Mental"
              sectionKey="mentalHealthPolicies"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          )}
          
          {activeTab === "programs" && (
            <CompanyReportSection 
              title="Programas e Atividades Realizadas"
              sectionKey="programs"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          )}
          
          {activeTab === "supportProtocols" && (
            <CompanyReportSection 
              title="Protocolos de Atendimento e Suporte"
              sectionKey="supportProtocols"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          )}
          
          {activeTab === "workplaceFlex" && (
            <CompanyReportSection 
              title="Flexibilidade e Adaptações no Ambiente de Trabalho"
              sectionKey="workplaceFlex"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          )}
          
          {activeTab === "communication" && (
            <CompanyReportSection 
              title="Canais de Comunicação e Denúncia"
              sectionKey="communication"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          )}
          
          {activeTab === "indicators" && (
            <CompanyReportSection 
              title="Indicadores e Resultados"
              sectionKey="indicators"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          )}
          
          {activeTab === "challenges" && (
            <CompanyReportSection 
              title="Desafios e Planos de Ação Futuros"
              sectionKey="challenges"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          )}
          
          {activeTab === "attachments" && (
            <CompanyReportSection 
              title="Anexos"
              sectionKey="attachments"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          )}
        </div>

        {/* Progresso do preenchimento */}
        <div className="mt-8 flex justify-between items-center">
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const currentGroupIndex = tabGroups.findIndex(g => g.id === activeGroup);
                const currentTabIndex = tabGroups[currentGroupIndex].tabs.indexOf(activeTab);
                
                if (currentTabIndex > 0) {
                  // Navegar para a aba anterior dentro do mesmo grupo
                  setActiveTab(tabGroups[currentGroupIndex].tabs[currentTabIndex - 1]);
                } else if (currentGroupIndex > 0) {
                  // Navegar para o último item do grupo anterior
                  const prevGroup = tabGroups[currentGroupIndex - 1];
                  setActiveGroup(prevGroup.id);
                  setActiveTab(prevGroup.tabs[prevGroup.tabs.length - 1]);
                }
              }}
              disabled={activeTab === "companyInfo"}
            >
              Anterior
            </Button>
            
            <Button 
              size="sm"
              onClick={() => {
                const currentGroupIndex = tabGroups.findIndex(g => g.id === activeGroup);
                const currentTabIndex = tabGroups[currentGroupIndex].tabs.indexOf(activeTab);
                
                if (currentTabIndex < tabGroups[currentGroupIndex].tabs.length - 1) {
                  // Navegar para a próxima aba dentro do mesmo grupo
                  setActiveTab(tabGroups[currentGroupIndex].tabs[currentTabIndex + 1]);
                } else if (currentGroupIndex < tabGroups.length - 1) {
                  // Navegar para o primeiro item do próximo grupo
                  const nextGroup = tabGroups[currentGroupIndex + 1];
                  setActiveGroup(nextGroup.id);
                  setActiveTab(nextGroup.tabs[0]);
                }
              }}
              disabled={activeTab === "attachments"}
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </CompanyDashboardLayout>
  );
};

export default CompanyComplianceReport;
