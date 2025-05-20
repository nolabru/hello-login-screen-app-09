
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
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
        
        <Tabs defaultValue="company-info" className="w-full">
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="company-info">Identificação da Empresa</TabsTrigger>
            <TabsTrigger value="exec-summary">Resumo Executivo</TabsTrigger>
            <TabsTrigger value="mental-health-policies">Políticas de Saúde Mental</TabsTrigger>
            <TabsTrigger value="programs">Programas e Atividades</TabsTrigger>
            <TabsTrigger value="support-protocols">Protocolos de Suporte</TabsTrigger>
            <TabsTrigger value="workplace-flex">Flexibilidade no Trabalho</TabsTrigger>
            <TabsTrigger value="communication">Canais de Comunicação</TabsTrigger>
            <TabsTrigger value="indicators">Indicadores e Resultados</TabsTrigger>
            <TabsTrigger value="challenges">Desafios e Planos</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company-info">
            <CompanyReportSection 
              title="Identificação da Empresa"
              sectionKey="companyInfo"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          </TabsContent>
          
          <TabsContent value="exec-summary">
            <CompanyReportSection 
              title="Resumo Executivo"
              sectionKey="execSummary"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          </TabsContent>
          
          <TabsContent value="mental-health-policies">
            <CompanyReportSection 
              title="Políticas de Saúde Mental"
              sectionKey="mentalHealthPolicies"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          </TabsContent>
          
          <TabsContent value="programs">
            <CompanyReportSection 
              title="Programas e Atividades Realizadas"
              sectionKey="programs"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          </TabsContent>
          
          <TabsContent value="support-protocols">
            <CompanyReportSection 
              title="Protocolos de Atendimento e Suporte"
              sectionKey="supportProtocols"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          </TabsContent>
          
          <TabsContent value="workplace-flex">
            <CompanyReportSection 
              title="Flexibilidade e Adaptações no Ambiente de Trabalho"
              sectionKey="workplaceFlex"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          </TabsContent>
          
          <TabsContent value="communication">
            <CompanyReportSection 
              title="Canais de Comunicação e Denúncia"
              sectionKey="communication"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          </TabsContent>
          
          <TabsContent value="indicators">
            <CompanyReportSection 
              title="Indicadores e Resultados"
              sectionKey="indicators"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          </TabsContent>
          
          <TabsContent value="challenges">
            <CompanyReportSection 
              title="Desafios e Planos de Ação Futuros"
              sectionKey="challenges"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          </TabsContent>
          
          <TabsContent value="attachments">
            <CompanyReportSection 
              title="Anexos"
              sectionKey="attachments"
              reportData={reportData}
              updateReportField={updateReportField}
            />
          </TabsContent>
        </Tabs>
      </div>
    </CompanyDashboardLayout>
  );
};

export default CompanyComplianceReport;
