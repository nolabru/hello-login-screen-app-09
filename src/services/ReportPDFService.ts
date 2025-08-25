import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportStorageService } from './reportStorageService';
import { getRealCompanyDashboardData } from './mobileAppDataService';

export class ReportPDFService {
    /**
     * Gera um PDF completo e profissional a partir dos dados de um relatório.
     * @param reportData Os dados completos do relatório.
     * @returns Um Blob representando o arquivo PDF.
     */
    static async generatePDF(reportData: any): Promise<Blob> {
        try {
            // 1. Coletar dados reais da empresa
            const companyId = reportData.companyId || reportData.company_id;
            const realData = companyId ? await getRealCompanyDashboardData(companyId) : null;

            // 2. Gerar PDF estruturado
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // 3. Configurar estilos
            const titleFontSize = 18;
            const sectionFontSize = 14;
            const bodyFontSize = 11;
            const margin = 20;
            let yPosition = margin;

            // 4. Cabeçalho
            this.addHeader(pdf, reportData, yPosition);
            yPosition += 30;

            // 5. Resumo Executivo
            yPosition = this.addExecutiveSummary(pdf, reportData, realData, yPosition);
            yPosition += 15;

            // 6. Métricas e Indicadores
            yPosition = this.addMetricsSection(pdf, reportData, realData, yPosition);
            yPosition += 15;

            // 7. Análise de Compliance
            yPosition = this.addComplianceSection(pdf, reportData, yPosition);
            yPosition += 15;

            // 8. Recomendações e Ações
            yPosition = this.addRecommendationsSection(pdf, reportData, yPosition);
            yPosition += 15;

            // 9. Rodapé
            this.addFooter(pdf, reportData);

            // 10. Retornar PDF como Blob
            return pdf.output('blob');

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            // Fallback: PDF simples com dados básicos
            return this.generateSimplePDF(reportData);
        }
    }

    /**
     * Adiciona cabeçalho profissional ao PDF
     */
    private static addHeader(pdf: jsPDF, reportData: any, yPosition: number): void {
        // Logo/Header da empresa
        pdf.setFillColor(59, 130, 246); // Blue-600
        pdf.rect(0, 0, 210, 40, 'F');

        // Título do relatório
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RELATÓRIO DE COMPLIANCE', 105, 25, { align: 'center' });

        // Subtítulo
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text(this.getReportTypeLabel(reportData.reportType), 105, 35, { align: 'center' });

        // Reset para conteúdo
        pdf.setTextColor(0, 0, 0);
        pdf.setFillColor(255, 255, 255);
    }

    /**
     * Adiciona resumo executivo
     */
    private static addExecutiveSummary(pdf: jsPDF, reportData: any, realData: any, yPosition: number): number {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RESUMO EXECUTIVO', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        const periodText = reportData.periodStart && reportData.periodEnd
            ? `Período: ${new Date(reportData.periodStart).toLocaleDateString('pt-BR')} a ${new Date(reportData.periodEnd).toLocaleDateString('pt-BR')}`
            : 'Período: Não especificado';

        pdf.text(periodText, 20, yPosition);
        yPosition += 6;

        // Score de compliance
        const complianceScore = this.calculateComplianceScore(reportData, realData);
        pdf.text(`Score de Compliance: ${complianceScore}%`, 20, yPosition);
        yPosition += 6;

        // Status geral
        const status = complianceScore >= 80 ? 'EXCELENTE' : complianceScore >= 60 ? 'BOM' : 'REQUER ATENÇÃO';
        pdf.text(`Status Geral: ${status}`, 20, yPosition);
        yPosition += 6;

        // Resumo das principais métricas
        if (realData?.questionnaireMetrics) {
            const metrics = realData.questionnaireMetrics;
            pdf.text(`Total de Questionários: ${metrics.totalQuestionnaires}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Respostas Coletadas: ${metrics.totalResponses}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Score Médio: ${metrics.averageScore}/5`, 20, yPosition);
            yPosition += 6;
        }

        return yPosition;
    }

    /**
     * Adiciona seção de métricas e indicadores
     */
    private static addMetricsSection(pdf: jsPDF, reportData: any, realData: any, yPosition: number): number {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MÉTRICAS E INDICADORES', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        // Métricas de usuários
        if (realData?.userMetrics) {
            const userMetrics = realData.userMetrics;
            pdf.text(`Total de Colaboradores: ${userMetrics.totalUsers}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Usuários Ativos: ${userMetrics.activeUsers}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Taxa de Engajamento: ${userMetrics.engagementRate}%`, 20, yPosition);
            yPosition += 6;
        }

        // Métricas de questionários
        if (realData?.questionnaireMetrics) {
            const qMetrics = realData.questionnaireMetrics;
            yPosition += 3;
            pdf.setFont('helvetica', 'bold');
            pdf.text('Questionários:', 20, yPosition);
            yPosition += 6;
            pdf.setFont('helvetica', 'normal');

            pdf.text(`  • Questionários Ativos: ${qMetrics.activeQuestionnaires}`, 25, yPosition);
            yPosition += 6;
            pdf.text(`  • Total de Respostas: ${qMetrics.totalResponses}`, 25, yPosition);
            yPosition += 6;
            pdf.text(`  • Taxa de Conclusão: ${qMetrics.completionRate}%`, 25, yPosition);
            yPosition += 6;
            pdf.text(`  • Score Médio: ${qMetrics.averageScore}/5`, 25, yPosition);
            yPosition += 6;
        }

        // Métricas de saúde mental
        if (realData?.mentalHealthMetrics) {
            const mhMetrics = realData.mentalHealthMetrics;
            yPosition += 3;
            pdf.setFont('helvetica', 'bold');
            pdf.text('Saúde Mental:', 20, yPosition);
            yPosition += 6;
            pdf.setFont('helvetica', 'normal');

            pdf.text(`  • Total de Alertas: ${mhMetrics.totalAlerts}`, 25, yPosition);
            yPosition += 6;
            pdf.text(`  • Alertas Críticos: ${mhMetrics.criticalAlerts}`, 25, yPosition);
            yPosition += 6;
            pdf.text(`  • Alertas Moderados: ${mhMetrics.moderateAlerts}`, 25, yPosition);
            yPosition += 6;
        }

        return yPosition;
    }

    /**
     * Adiciona seção de compliance
     */
    private static addComplianceSection(pdf: jsPDF, reportData: any, yPosition: number): number {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ANÁLISE DE COMPLIANCE', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        // Lei 14.831/2024
        if (reportData.reportType === 'compliance_lei14831') {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Lei 14.831/2024 - Certificado Empresa Promotora da Saúde Mental:', 20, yPosition);
            yPosition += 6;
            pdf.setFont('helvetica', 'normal');

            pdf.text(`  • Atividades Realizadas: ${reportData.collectedData?.activities || 0}`, 25, yPosition);
            yPosition += 6;
            pdf.text(`  • Taxa de Participação: ${reportData.collectedData?.participationRate || 0}%`, 25, yPosition);
            yPosition += 6;
            pdf.text(`  • Score de Satisfação: ${reportData.collectedData?.satisfactionScore || 0}/10`, 25, yPosition);
            yPosition += 6;
        }

        // NR-1
        if (reportData.reportType === 'nr1_psicossocial') {
            pdf.setFont('helvetica', 'bold');
            pdf.text('NR-1 - Riscos Psicossociais no Ambiente de Trabalho:', 20, yPosition);
            yPosition += 6;
            pdf.setFont('helvetica', 'normal');

            pdf.text(`  • Sessões de Conversa: ${reportData.collectedData?.conversationSessions || 0}`, 25, yPosition);
            yPosition += 6;
            pdf.text(`  • Horas de Meditação: ${reportData.collectedData?.meditationHours || 0}h`, 25, yPosition);
            yPosition += 6;
            pdf.text(`  • Entradas no Diário: ${reportData.collectedData?.diaryEntries || 0}`, 25, yPosition);
            yPosition += 6;
        }

        return yPosition;
    }

    /**
     * Adiciona seção de recomendações
     */
    private static addRecommendationsSection(pdf: jsPDF, reportData: any, yPosition: number): number {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RECOMENDAÇÕES E AÇÕES', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        // Destaques
        if (reportData.highlights) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Destaques:', 20, yPosition);
            yPosition += 6;
            pdf.setFont('helvetica', 'normal');

            const highlights = this.wrapText(reportData.highlights, 60);
            highlights.forEach(line => {
                pdf.text(`  ${line}`, 25, yPosition);
                yPosition += 6;
            });
            yPosition += 3;
        }

        // Ações planejadas
        if (reportData.plannedActions) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Ações Planejadas:', 20, yPosition);
            yPosition += 6;
            pdf.setFont('helvetica', 'normal');

            const actions = this.wrapText(reportData.plannedActions, 60);
            actions.forEach(line => {
                pdf.text(`  ${line}`, 25, yPosition);
                yPosition += 6;
            });
            yPosition += 3;
        }

        // Desafios
        if (reportData.challenges) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Desafios Identificados:', 20, yPosition);
            yPosition += 6;
            pdf.setFont('helvetica', 'normal');

            const challenges = this.wrapText(reportData.challenges, 60);
            challenges.forEach(line => {
                pdf.text(`  ${line}`, 25, yPosition);
                yPosition += 6;
            });
        }

        return yPosition;
    }

    /**
     * Adiciona rodapé ao PDF
     */
    private static addFooter(pdf: jsPDF, reportData: any): void {
        const pageHeight = pdf.internal.pageSize.getHeight();
        const footerY = pageHeight - 20;

        pdf.setFontSize(9);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, footerY);
        pdf.text(`Versão do Template: 1.0`, 105, footerY, { align: 'center' });
        pdf.text(`Página ${pdf.getCurrentPageInfo().pageNumber}`, 190, footerY, { align: 'right' });
    }

    /**
     * Gera PDF simples como fallback
     */
    private static generateSimplePDF(reportData: any): Blob {
        const pdf = new jsPDF();

        pdf.setFontSize(20);
        pdf.text('Relatório de Compliance', 20, 20);

        pdf.setFontSize(12);
        pdf.text(`Tipo: ${this.getReportTypeLabel(reportData.reportType)}`, 20, 40);
        pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 50);

        return pdf.output('blob');
    }

    /**
     * Calcula score de compliance baseado nos dados
     */
    private static calculateComplianceScore(reportData: any, realData: any): number {
        let score = 0;

        // Base score
        score += 30;

        // Questionários respondidos
        if (realData?.questionnaireMetrics?.totalResponses) {
            score += Math.min(realData.questionnaireMetrics.totalResponses * 2, 20);
        }

        // Engajamento
        if (realData?.userMetrics?.engagementRate) {
            score += Math.min(realData.userMetrics.engagementRate * 0.3, 25);
        }

        // Atividades completadas
        if (reportData.collectedData?.activities) {
            score += Math.min(reportData.collectedData.activities * 0.5, 15);
        }

        // Score de satisfação
        if (reportData.collectedData?.satisfactionScore) {
            score += Math.min(reportData.collectedData.satisfactionScore, 10);
        }

        return Math.min(Math.round(score), 100);
    }

    /**
     * Retorna label do tipo de relatório
     */
    private static getReportTypeLabel(reportType: string): string {
        switch (reportType) {
            case 'compliance_lei14831':
                return 'Lei 14.831/2024 - Certificado Empresa Promotora da Saúde Mental';
            case 'nr1_psicossocial':
                return 'NR-1 - Riscos Psicossociais no Ambiente de Trabalho';
            default:
                return 'Relatório Personalizado de Compliance';
        }
    }

    /**
     * Quebra texto em linhas para caber no PDF
     */
    private static wrapText(text: string, maxWidth: number): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + word).length <= maxWidth) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });

        if (currentLine) lines.push(currentLine);
        return lines;
    }

    /**
     * Gera PDF usando HTML (método original mantido para compatibilidade)
     */
    static async generatePDFFromHTML(reportData: any): Promise<Blob> {
        try {
            // 1. Gerar o HTML do relatório
            const htmlContent = ReportStorageService.generateHTMLPreview(reportData);

            // 2. Criar um elemento temporário para renderizar o HTML
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.innerHTML = htmlContent;
            document.body.appendChild(container);

            // 3. Usar html2canvas para capturar o HTML como uma imagem
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
            });

            // 4. Usar jsPDF para criar o PDF a partir da imagem do canvas
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const height = pdfWidth / ratio;

            let position = 0;
            let remainingHeight = canvasHeight;

            while (remainingHeight > 0) {
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, height);
                remainingHeight -= canvasHeight;
                if (remainingHeight > 0) {
                    pdf.addPage();
                    position = -pdfHeight;
                }
            }

            return pdf.output('blob');

        } catch (error) {
            console.error('Erro ao gerar PDF do HTML:', error);
            // Fallback para PDF simples
            return this.generateSimplePDF(reportData);
        } finally {
            // Remover elemento temporário
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        }
    }
}
