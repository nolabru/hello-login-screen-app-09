import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Tipos simples para evitar inferência profunda
type SimpleDepartment = {
  id: string;
  name: string;
};

type SimpleEmployee = {
  user_id: string;
};

interface ReportMetrics {
  // Métricas do App Calma
  meditationHours: number;
  conversationSessions: number;
  diaryEntries: number;
  
  // Métricas de Atividades
  totalActivities: number;
  completedActivities: number;
  workshops: number;
  lectures: number;
  supportGroups: number;
  
  // Métricas de Engajamento
  totalEmployees: number;
  activeUsers: number;
  participationRate: number;
  engagementRate: number;
  satisfactionScore: number;
  
  // Métricas por Departamento
  departmentMetrics: Array<{
    name: string;
    employees: number;
    activitiesParticipated: number;
    engagementRate: number;
  }>;
}

export class ReportDataService {
  /**
   * Busca todas as métricas necessárias para o relatório
   */
  static async fetchReportMetrics(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReportMetrics> {
    try {
      // Buscar todas as métricas em paralelo para melhor performance
      const [
        activities,
        employees,
        departments,
        appMetrics
      ] = await Promise.all([
        this.fetchActivityMetrics(companyId, startDate, endDate),
        this.fetchEmployeeMetrics(companyId),
        this.fetchDepartmentMetrics(companyId, startDate, endDate),
        this.fetchAppMetrics(companyId, startDate, endDate)
      ]);

      // Calcular taxas de engajamento
      const activeUsers = await this.countActiveUsers(companyId, startDate, endDate);
      const participationRate = this.calculateParticipationRate(
        activities.participantsCount,
        employees.total
      );
      const engagementRate = this.calculateEngagementRate(
        activeUsers,
        employees.total
      );

      return {
        // Métricas do App
        meditationHours: appMetrics.meditationHours,
        conversationSessions: appMetrics.conversationSessions,
        diaryEntries: appMetrics.diaryEntries,
        
        // Métricas de Atividades
        totalActivities: activities.total,
        completedActivities: activities.completed,
        workshops: activities.workshops,
        lectures: activities.lectures,
        supportGroups: activities.supportGroups,
        
        // Métricas de Engajamento
        totalEmployees: employees.total,
        activeUsers,
        participationRate,
        engagementRate,
        satisfactionScore: await this.calculateSatisfactionScore(companyId, startDate, endDate),
        
        // Métricas por Departamento
        departmentMetrics: departments
      };
    } catch (error) {
      console.error('Erro ao buscar métricas do relatório:', error);
      throw error;
    }
  }

  /**
   * Busca métricas de atividades da empresa
   */
  private static async fetchActivityMetrics(
    companyId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Buscar atividades sem join para evitar tipo profundo
    const { data: activities, error } = await supabase
      .from('company_activities')
      .select('*')
      .eq('company_id', companyId)
      .gte('start_date', startDate.toISOString())
      .lte('start_date', endDate.toISOString());

    if (error) throw error;

    const completed = activities?.filter(a => a.status === 'concluida') || [];
    const workshops = activities?.filter(a => a.activity_type === 'workshop').length || 0;
    const lectures = activities?.filter(a => a.activity_type === 'palestra').length || 0;
    const supportGroups = activities?.filter(a => a.activity_type === 'grupo_apoio').length || 0;

    // Buscar participantes separadamente
    let participantsCount = 0;
    if (activities && activities.length > 0) {
      const activityIds = activities.map(a => a.id);
      const { data: participants } = await supabase
        .from('activity_participants')
        .select('participant_id')
        .in('activity_id', activityIds);
      
      const uniqueParticipants = new Set<string>();
      participants?.forEach((p: any) => {
        if (p.participant_id) uniqueParticipants.add(p.participant_id);
      });
      participantsCount = uniqueParticipants.size;
    }

    return {
      total: activities?.length || 0,
      completed: completed.length,
      workshops,
      lectures,
      supportGroups,
      participantsCount
    };
  }

  /**
   * Busca métricas de colaboradores
   */
  private static async fetchEmployeeMetrics(companyId: string) {
    const { data: employees, error } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('company_id', companyId)
      .not('user_id', 'is', null);

    if (error) throw error;

    return {
      total: employees?.length || 0,
      profiles: employees || []
    };
  }

  /**
   * Busca métricas por departamento
   */
  private static async fetchDepartmentMetrics(
    companyId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Buscar departamentos - tipo simples para evitar erro de tipo profundo
    // @ts-ignore - Tipo profundo do Supabase
    const departmentsQuery: any = await supabase
      .from('company_departments')
      .select('id, name')
      .eq('company_id', companyId)
      .eq('status', 'active');

    if (departmentsQuery.error) throw departmentsQuery.error;
    const departments = (departmentsQuery.data as SimpleDepartment[]) || [];

    const departmentMetrics = [];

    // Processar cada departamento
    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      
      // Buscar colaboradores do departamento
      const employeesQuery: any = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('company_id', companyId)
        .eq('department_id', dept.id);

      const employees = (employeesQuery.data as SimpleEmployee[]) || [];
      const employeeCount = employees.length;

      // Buscar participação em atividades
      let participationCount = 0;
      if (employeeCount > 0) {
        // Extrair IDs de usuário de forma simples
        const userIds: string[] = [];
        for (const emp of employees) {
          if (emp.user_id) userIds.push(emp.user_id);
        }
        
        if (userIds.length > 0) {
          // @ts-ignore - Tipo profundo do Supabase
          const participationsQuery: any = await supabase
            .from('activity_participants')
            .select('activity_id')
            .in('participant_id', userIds);
          
          participationCount = participationsQuery.data?.length || 0;
        }
      }

      const engagementRate = employeeCount > 0 
        ? (participationCount / employeeCount) * 100
        : 0;

      departmentMetrics.push({
        name: dept.name || '',
        employees: employeeCount,
        activitiesParticipated: participationCount,
        engagementRate: Math.round(engagementRate)
      });
    }

    return departmentMetrics;
  }

  /**
   * Busca métricas do app Calma (simulado por enquanto)
   */
  private static async fetchAppMetrics(
    companyId: string,
    startDate: Date,
    endDate: Date
  ) {
    // TODO: Quando tivermos as tabelas do app Calma, buscar dados reais
    // Por enquanto, vamos simular com base no número de colaboradores
    
    const { data: employees } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('company_id', companyId);

    const employeeCount = employees?.length || 1;
    
    // Simular métricas proporcionais ao número de colaboradores
    return {
      meditationHours: Math.round(employeeCount * 3.5), // Média de 3.5h por colaborador
      conversationSessions: Math.round(employeeCount * 2.2), // Média de 2.2 sessões
      diaryEntries: Math.round(employeeCount * 8.5) // Média de 8.5 entradas
    };
  }

  /**
   * Conta usuários ativos no período
   */
  private static async countActiveUsers(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Buscar atividades do período
    const { data: activities } = await supabase
      .from('company_activities')
      .select('id')
      .eq('company_id', companyId)
      .gte('start_date', startDate.toISOString())
      .lte('start_date', endDate.toISOString());

    if (!activities || activities.length === 0) return 0;

    // Buscar participantes das atividades
    const activityIds = activities.map(a => a.id);
    const { data: participants } = await supabase
      .from('activity_participants')
      .select('participant_id')
      .in('activity_id', activityIds);

    // Contar usuários únicos
    const uniqueUsers = new Set<string>();
    participants?.forEach((p: any) => {
      if (p.participant_id) uniqueUsers.add(p.participant_id);
    });

    return uniqueUsers.size;
  }

  /**
   * Calcula taxa de participação
   */
  private static calculateParticipationRate(
    participants: number,
    totalEmployees: number
  ): number {
    if (totalEmployees === 0) return 0;
    return Math.round((participants / totalEmployees) * 100);
  }

  /**
   * Calcula taxa de engajamento
   */
  private static calculateEngagementRate(
    activeUsers: number,
    totalEmployees: number
  ): number {
    if (totalEmployees === 0) return 0;
    return Math.round((activeUsers / totalEmployees) * 100);
  }

  /**
   * Calcula score de satisfação (simulado por enquanto)
   */
  private static async calculateSatisfactionScore(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // TODO: Quando tivermos sistema de feedback, calcular real
    // Por enquanto, vamos simular baseado no engajamento
    
    const { data: activities } = await supabase
      .from('company_activities')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'concluida')
      .gte('start_date', startDate.toISOString())
      .lte('start_date', endDate.toISOString());

    // Simular score baseado no número de atividades concluídas
    const completedCount = activities?.length || 0;
    
    if (completedCount >= 10) return 8.5;
    if (completedCount >= 5) return 7.8;
    if (completedCount >= 3) return 7.2;
    return 6.5;
  }

  /**
   * Calcula score de compliance
   */
  static calculateComplianceScore(metrics: ReportMetrics): number {
    const weights = {
      activities: 0.25,
      engagement: 0.30,
      participation: 0.25,
      satisfaction: 0.20
    };

    // Normalizar métricas (0-100)
    const activityScore = Math.min(100, (metrics.completedActivities / 12) * 100);
    const engagementScore = metrics.engagementRate;
    const participationScore = metrics.participationRate;
    const satisfactionScore = (metrics.satisfactionScore / 10) * 100;

    // Calcular score ponderado
    const totalScore = 
      (activityScore * weights.activities) +
      (engagementScore * weights.engagement) +
      (participationScore * weights.participation) +
      (satisfactionScore * weights.satisfaction);

    return Math.round(totalScore);
  }

  /**
   * Gera insights automáticos baseados nas métricas
   */
  static generateInsights(metrics: ReportMetrics): string[] {
    const insights: string[] = [];

    // Insights de atividades
    if (metrics.completedActivities >= 12) {
      insights.push('✅ Excelente número de atividades realizadas no período, garantindo cobertura consistente de ações de bem-estar.');
    } else if (metrics.completedActivities >= 6) {
      insights.push('📊 Bom número de atividades realizadas. Considere aumentar a frequência para melhor cobertura.');
    } else {
      insights.push('⚠️ Número de atividades abaixo do recomendado. Aumente a frequência para atender aos requisitos de compliance.');
    }

    // Insights de engajamento
    if (metrics.engagementRate >= 70) {
      insights.push(`✅ Alta taxa de engajamento (${metrics.engagementRate}%) demonstra boa adesão dos colaboradores.`);
    } else if (metrics.engagementRate >= 50) {
      insights.push(`📊 Taxa de engajamento moderada (${metrics.engagementRate}%). Implemente estratégias para aumentar a participação.`);
    } else {
      insights.push(`⚠️ Taxa de engajamento baixa (${metrics.engagementRate}%). Ações urgentes necessárias para melhorar a adesão.`);
    }

    // Insights de satisfação
    if (metrics.satisfactionScore >= 8) {
      insights.push(`✅ Excelente nível de satisfação (${metrics.satisfactionScore}/10) indica programas bem recebidos.`);
    } else if (metrics.satisfactionScore >= 6) {
      insights.push(`📊 Satisfação adequada (${metrics.satisfactionScore}/10). Continue monitorando e ajustando os programas.`);
    } else {
      insights.push(`⚠️ Satisfação abaixo do esperado (${metrics.satisfactionScore}/10). Revise o formato e conteúdo das atividades.`);
    }

    // Insights de uso do app
    if (metrics.meditationHours > 0) {
      insights.push(`🧘 ${metrics.meditationHours} horas de meditação acumuladas demonstram uso ativo do app Calma.`);
    }

    // Insights por departamento
    const topDepartment = metrics.departmentMetrics.reduce((prev, current) => 
      (prev.engagementRate > current.engagementRate) ? prev : current
    , metrics.departmentMetrics[0]);

    if (topDepartment) {
      insights.push(`🏆 Departamento ${topDepartment.name} lidera em engajamento com ${topDepartment.engagementRate}%.`);
    }

    return insights;
  }
}
