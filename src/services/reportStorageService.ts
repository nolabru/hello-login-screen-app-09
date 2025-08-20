import { supabase } from '@/integrations/supabase/client';

interface ReportSaveData {
  companyId: string;
  reportType: string;
  periodStart: Date;
  periodEnd: Date;
  metrics: any;
  insights: string[];
  highlights?: string;
  plannedActions?: string;
  challenges?: string;
  approverName?: string;
  approverEmail?: string;
  evidenceFiles?: any[];
}

export class ReportStorageService {
  /**
   * Salva o relatório no banco de dados
   */
  static async saveReport(data: ReportSaveData): Promise<string> {
    try {
      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Preparar dados para salvar conforme estrutura da tabela
      const reportData = {
        company_id: data.companyId,
        report_type: data.reportType,
        title: this.generateReportTitle(data.reportType, data.periodStart, data.periodEnd),
        report_period_start: data.periodStart.toISOString(),
        report_period_end: data.periodEnd.toISOString(),
        
        // Todos os dados do relatório em JSON
        report_data: {
          metrics: {
            totalActivities: data.metrics.totalActivities,
            completedActivities: data.metrics.completedActivities,
            workshops: data.metrics.workshops,
            lectures: data.metrics.lectures,
            supportGroups: data.metrics.supportGroups,
            meditationHours: data.metrics.meditationHours,
            conversationSessions: data.metrics.conversationSessions,
            diaryEntries: data.metrics.diaryEntries,
            activeUsers: data.metrics.activeUsers,
            totalEmployees: data.metrics.totalEmployees,
            engagementRate: data.metrics.engagementRate,
            participationRate: data.metrics.participationRate,
            satisfactionScore: data.metrics.satisfactionScore,
            complianceScore: data.metrics.complianceScore,
            departmentMetrics: data.metrics.departmentMetrics
          },
          insights: data.insights,
          additionalInfo: {
            highlights: data.highlights,
            plannedActions: data.plannedActions,
            challenges: data.challenges
          },
          evidenceFiles: data.evidenceFiles || []
        },
        
        template_version: '1.0',
        status: 'pronto',
        generated_at: new Date().toISOString(),
        generated_by: user.id,
        
        // Aprovação - approved_by deve ser UUID ou null
        approved_by: null, // Por enquanto null, pois não temos o UUID do aprovador
        approval_notes: data.approverName ? `Aprovado por: ${data.approverName}${data.approverEmail ? ` (${data.approverEmail})` : ''}` : null
      };

      // Inserir no banco
      const { data: savedReport, error } = await supabase
        .from('compliance_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;

      return savedReport.id;
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      throw error;
    }
  }

  /**
   * Busca um relatório salvo
   */
  static async getReport(reportId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      throw error;
    }
  }

  /**
   * Lista relatórios da empresa
   */
  static async listCompanyReports(companyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*')
        .eq('company_id', companyId)
        .order('generated_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao listar relatórios:', error);
      throw error;
    }
  }

  /**
   * Atualiza status do relatório
   */
  static async updateReportStatus(reportId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('compliance_reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar status do relatório:', error);
      throw error;
    }
  }

  /**
   * Gera título do relatório baseado no tipo e período
   */
  private static generateReportTitle(type: string, startDate: Date, endDate: Date): string {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    };

    const typeLabels: Record<string, string> = {
      'lei14831': 'Lei 14.831/2024 - Certificado',
      'nr1': 'NR-1 Riscos Psicossociais',
      'customizado': 'Relatório de Compliance'
    };

    const label = typeLabels[type] || 'Relatório';
    
    if (startDate.getMonth() === endDate.getMonth() && 
        startDate.getFullYear() === endDate.getFullYear()) {
      return `${label} - ${formatDate(startDate)}`;
    } else {
      return `${label} - ${formatDate(startDate)} a ${formatDate(endDate)}`;
    }
  }

  /**
   * Gera um preview HTML simples do relatório
   */
  static generateHTMLPreview(data: any): string {
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 10px 0 0;
            opacity: 0.9;
          }
          .section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
          .metric-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #667eea;
          }
          .metric-value {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin: 10px 0;
          }
          .metric-label {
            color: #666;
            font-size: 14px;
          }
          .compliance-score {
            font-size: 48px;
            font-weight: bold;
            color: ${data.metrics.complianceScore >= 80 ? '#10b981' : data.metrics.complianceScore >= 60 ? '#f59e0b' : '#ef4444'};
            text-align: center;
            margin: 20px 0;
          }
          .insights {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 15px;
            margin: 15px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-right: 8px;
          }
          .badge-success {
            background: #d1fae5;
            color: #065f46;
          }
          .badge-warning {
            background: #fed7aa;
            color: #92400e;
          }
          .badge-info {
            background: #dbeafe;
            color: #1e40af;
          }
          @media print {
            body {
              background: white;
            }
            .section {
              box-shadow: none;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.title}</h1>
          <p>Período: ${new Date(data.periodStart).toLocaleDateString('pt-BR')} - ${new Date(data.periodEnd).toLocaleDateString('pt-BR')}</p>
        </div>

        <div class="section">
          <h2>Score de Compliance</h2>
          <div class="compliance-score">${data.metrics.complianceScore}%</div>
          <p style="text-align: center; color: #666;">
            ${data.metrics.complianceScore >= 80 ? 'Excelente! Empresa em conformidade' : 
              data.metrics.complianceScore >= 60 ? 'Bom progresso, continue melhorando' : 
              'Atenção necessária para atingir conformidade'}
          </p>
        </div>

        <div class="section">
          <h2>Métricas Principais</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">Atividades Realizadas</div>
              <div class="metric-value">${data.metrics.completedActivities}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Taxa de Engajamento</div>
              <div class="metric-value">${data.metrics.engagementRate}%</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Usuários Ativos</div>
              <div class="metric-value">${data.metrics.activeUsers}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Horas de Meditação</div>
              <div class="metric-value">${data.metrics.meditationHours}h</div>
            </div>
          </div>
        </div>

        ${data.insights && data.insights.length > 0 ? `
          <div class="section">
            <h2>Insights Identificados</h2>
            ${data.insights.map((insight: string) => `
              <div class="insights">
                ${insight}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.highlights ? `
          <div class="section">
            <h2>Destaques do Período</h2>
            <p>${data.highlights.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}

        ${data.plannedActions ? `
          <div class="section">
            <h2>Ações Planejadas</h2>
            <p>${data.plannedActions.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}

        ${data.challenges ? `
          <div class="section">
            <h2>Desafios Identificados</h2>
            <p>${data.challenges.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          ${data.approverName ? `<p>Aprovado por: ${data.approverName}</p>` : ''}
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            Este relatório foi gerado automaticamente pelo Portal Calma com base em dados reais coletados no período.
          </p>
        </div>
      </body>
      </html>
    `;

    return html;
  }
}
