import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { checkLicenseAvailability } from '@/services/licenseService';
import { fetchCompanyPsychologists } from '@/integrations/supabase/companyPsychologistsService';
import { useCompanySentimentData } from '@/hooks/useCompanySentimentData';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Brain, 
  DollarSign, 
  Activity, 
  Target, 
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Building2,
  Trophy,
  TrendingDown,
  Award,
  Volume2,
  BookOpen,
  Heart,
  Clock,
  Headphones,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  ComposedChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Tables } from '@/integrations/supabase/types';
import { MeditationService, type MeditationMetrics } from '@/services/meditationService';
import { SoundsService, type SoundsMetrics } from '@/services/soundsService';
import { DiaryService, type DiaryMetrics } from '@/services/diaryService';
import { getCompanyQuestionnaireMetrics, type QuestionnaireMetrics } from '@/services/questionnaireService';
import { AuthService } from '@/services/authService';

type Department = Tables<'company_departments'>;

// Dados mockados otimizados
const mockWellBeingEvolution = [
  { month: 'Ago/24', score: 6.1, benchmark: 5.8, sessions: 89 },
  { month: 'Set/24', score: 6.4, benchmark: 6.0, sessions: 142 },
  { month: 'Out/24', score: 6.7, benchmark: 6.2, sessions: 198 },
  { month: 'Nov/24', score: 6.9, benchmark: 6.4, sessions: 234 },
  { month: 'Dez/24', score: 7.0, benchmark: 6.5, sessions: 289 },
  { month: 'Jan/25', score: 7.2, benchmark: 6.6, sessions: 345 },
];

const mockRiskDistribution = [
  { name: 'Baixo Risco', value: 65, color: '#059669' },
  { name: 'Risco Moderado', value: 28, color: '#D97706' },
  { name: 'Alto Risco', value: 7, color: '#DC2626' },
];

const mockROIData = [
  { month: 'Ago', investment: 45, savings: 32, roi: 71 },
  { month: 'Set', investment: 48, savings: 41, roi: 85 },
  { month: 'Out', investment: 51, savings: 58, roi: 114 },
  { month: 'Nov', investment: 54, savings: 73, roi: 135 },
  { month: 'Dez', investment: 57, savings: 89, roi: 156 },
  { month: 'Jan', investment: 60, savings: 127, roi: 212 },
];

const CompanyDashboard: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [realStats, setRealStats] = useState({
    totalEmployees: 0,
    activePsychologists: 0,
    totalLicenses: 0,
    availableLicenses: 0
  });
  
  const { wellBeingIndex } = useCompanySentimentData('week');
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Estados para análise por setores
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentStats, setDepartmentStats] = useState<Record<string, any>>({});
  const [sectorAnalysisData, setSectorAnalysisData] = useState<any[]>([]);

  // Estados para dados de meditação
  const [meditationMetrics, setMeditationMetrics] = useState<MeditationMetrics | null>(null);
  const [meditationLoading, setMeditationLoading] = useState(true);

  // Estados para dados de sons
  const [soundsMetrics, setSoundsMetrics] = useState<SoundsMetrics | null>(null);
  const [soundsLoading, setSoundsLoading] = useState(true);

  // Estados para dados de diário
  const [diaryMetrics, setDiaryMetrics] = useState<DiaryMetrics | null>(null);
  const [diaryLoading, setDiaryLoading] = useState(true);

  // Estados para dados de questionário
  const [questionnaireMetrics, setQuestionnaireMetrics] = useState<QuestionnaireMetrics | null>(null);
  const [questionnaireLoading, setQuestionnaireLoading] = useState(true);

  // KPIs otimizados
  const [kpis, setKpis] = useState({
    engagement: {
      current: 0,
      total: 300,
      percentage: 0,
      change: '+12',
      trend: 'up' as 'up' | 'down' | 'stable',
      target: 70,
      status: 'success' as 'success' | 'warning' | 'danger'
    },
    wellBeing: {
      score: 7.2,
      change: '+0.8',
      trend: 'up' as 'up' | 'down' | 'stable',
      target: 7.0,
      status: 'success' as 'success' | 'warning' | 'danger'
    },
    roi: {
      value: 127000,
      change: '+45%',
      trend: 'up' as 'up' | 'down' | 'stable',
      payback: 1.2,
      status: 'success' as 'success' | 'warning' | 'danger'
    },
    alerts: {
      total: 7,
      highRisk: 3,
      moderateRisk: 4,
      trend: 'down' as 'up' | 'down' | 'stable',
      change: '-2'
    },
    activities: {
      meditationMinutes: 2340,
      aiSessions: 156,
      participation: 89,
      trend: 'up' as 'up' | 'down' | 'stable',
      weeklyGrowth: '+23%'
    },
    trend: {
      status: 'improving' as 'improving' | 'declining' | 'stable',
      change: '+15%',
      weeks: 3,
      confidence: 'alta'
    }
  });

  // Função para buscar dados dos setores
  const fetchDepartmentData = async (companyIdStr: string) => {
    try {
      // Buscar setores
      const { data: depts, error } = await supabase
        .from('company_departments')
        .select('*')
        .eq('company_id', companyIdStr)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setDepartments(depts || []);

      // Buscar funcionários por setor
      const stats: Record<string, any> = {};
      const mockSectorData: any[] = [];

      if (depts && depts.length > 0) {
        for (const dept of depts) {
          const { count } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyIdStr)
            .eq('department_id', dept.id);
          
          const employeeCount = count || 0;
          
          // Gerar dados mockados proporcionais ao número real de funcionários
          const mockScore = 6.5 + (Math.random() * 2); // 6.5 a 8.5
          const mockEngagement = Math.max(60, 70 + (Math.random() * 30)); // 70 a 100%
          const mockAlerts = Math.floor(employeeCount * (0.02 + Math.random() * 0.08)); // 2-10% dos funcionários
          
          stats[dept.id] = {
            employeeCount,
            wellBeingScore: mockScore,
            engagement: mockEngagement,
            alerts: mockAlerts,
            trend: mockScore > 7.0 ? 'up' : mockScore < 6.5 ? 'down' : 'stable'
          };

          // Adicionar ao array para gráficos
          mockSectorData.push({
            sector: dept.name,
            wellBeing: Number(mockScore.toFixed(1)),
            engagement: Math.round(mockEngagement),
            employees: employeeCount,
            alerts: mockAlerts,
            color: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][depts.indexOf(dept) % 5]
          });
        }
      }

      setDepartmentStats(stats);
      setSectorAnalysisData(mockSectorData);
    } catch (error) {
      console.error('Erro ao buscar dados dos setores:', error);
    }
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        console.log('🚀 CompanyDashboard: Inicializando autenticação...');
        
        // Usar o AuthService padronizado
        const companyIdStr = await AuthService.getValidatedCompanyId();
        if (!companyIdStr) {
          console.error('❌ CompanyDashboard: Company ID não encontrado');
          setLoading(false);
          return;
        }
        
        console.log('✅ CompanyDashboard: Company ID validado:', companyIdStr);
        setCompanyId(companyIdStr);

        // Get company name
        const companyIdNum = parseInt(companyIdStr, 10);
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyIdNum)
          .single();
        
        if (company) {
          setCompanyName(company.name);
        }

        // Fetch real data
        const { data: employees } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('company_id', companyIdStr);
        
        const totalEmployees = employees?.length || 0;
        
        const psychologists = await fetchCompanyPsychologists(companyIdStr);
        const activePsychs = psychologists.length;
        
        const licenseStats = await checkLicenseAvailability(companyIdStr);

        // Fetch department data
        await fetchDepartmentData(companyIdStr);

        // Fetch meditation data
        await fetchMeditationData(companyIdStr);

        // Fetch sounds data
        await fetchSoundsData(companyIdStr);

        // Fetch diary data
        await fetchDiaryData(companyIdStr);

        // Fetch questionnaire data
        await fetchQuestionnaireData(companyIdStr);

        // Update real stats
        setRealStats({
          totalEmployees,
          activePsychologists: activePsychs,
          totalLicenses: licenseStats.total,
          availableLicenses: licenseStats.available
        });

        // Update KPIs with real data
        setKpis(prev => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            current: totalEmployees,
            total: Math.max(totalEmployees + 66, 300),
            percentage: Math.round((totalEmployees / Math.max(totalEmployees + 66, 300)) * 100)
          }
        }));

      } catch (error) {
        console.error('Erro ao buscar dados da empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  // Função para buscar dados de meditação
  const fetchMeditationData = async (companyIdStr: string) => {
    try {
      setMeditationLoading(true);
      console.log('🧘 Carregando dados de meditação...');
      
      const metrics = await MeditationService.getCompanyMeditationMetrics();
      setMeditationMetrics(metrics);
      
      console.log('✅ Dados de meditação carregados:', metrics);
    } catch (error) {
      console.error('❌ Erro ao carregar dados de meditação:', error);
      setMeditationMetrics(MeditationService.getEmptyMetrics());
    } finally {
      setMeditationLoading(false);
    }
  };

  // Função para buscar dados de sons
  const fetchSoundsData = async (companyIdStr: string) => {
    try {
      setSoundsLoading(true);
      console.log('🎵 Carregando dados de sons...');
      
      const metrics = await SoundsService.getCompanySoundsMetrics();
      setSoundsMetrics(metrics);
      
      console.log('✅ Dados de sons carregados:', metrics);
    } catch (error) {
      console.error('❌ Erro ao carregar dados de sons:', error);
      setSoundsMetrics(SoundsService.getEmptyMetrics());
    } finally {
      setSoundsLoading(false);
    }
  };

  // Função para buscar dados de diário
  const fetchDiaryData = async (companyIdStr: string) => {
    try {
      setDiaryLoading(true);
      console.log('📔 Carregando dados de diário...');
      
      const metrics = await DiaryService.getCompanyDiaryMetrics();
      setDiaryMetrics(metrics);
      
      console.log('✅ Dados de diário carregados:', metrics);
    } catch (error) {
      console.error('❌ Erro ao carregar dados de diário:', error);
      setDiaryMetrics(DiaryService.getEmptyMetrics());
    } finally {
      setDiaryLoading(false);
    }
  };

  // Função para buscar dados de questionário
  const fetchQuestionnaireData = async (companyIdStr: string) => {
    try {
      setQuestionnaireLoading(true);
      console.log('📋 Carregando dados de questionários...');
      
      const metrics = await getCompanyQuestionnaireMetrics(companyIdStr);
      setQuestionnaireMetrics(metrics);
      
      console.log('✅ Dados de questionários carregados:', metrics);
    } catch (error) {
      console.error('❌ Erro ao carregar dados de questionários:', error);
      // Set empty metrics on error
      setQuestionnaireMetrics({
        totalQuestionnaires: 0,
        activeQuestionnaires: 0,
        totalResponses: 0,
        averageCompletionRate: 0,
        responsesByDepartment: [],
        responseEvolution: [],
        departmentSatisfaction: [],
        questionnairePerformance: []
      });
    } finally {
      setQuestionnaireLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', size = 'h-4 w-4') => {
    switch (trend) {
      case 'up': return <ArrowUp className={`${size} text-green-500`} />;
      case 'down': return <ArrowDown className={`${size} text-red-500`} />;
      default: return <Minus className={`${size} text-gray-500`} />;
    }
  };

  const getGradientByStatus = (status: 'success' | 'warning' | 'danger') => {
    switch (status) {
      case 'success': return 'from-green-50 to-emerald-50 border-green-200';
      case 'warning': return 'from-yellow-50 to-amber-50 border-yellow-200';
      case 'danger': return 'from-red-50 to-rose-50 border-red-200';
      default: return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name?.includes('%') ? `${entry.value}%` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <CompanyDashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </CompanyDashboardLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard Executivo - {companyName}</title>
      </Helmet>
      <CompanyDashboardLayout>
        <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
          {/* Header Clean e Minimalista */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  {companyName}
                </h1>
                <p className="text-sm text-gray-500">
                  Dashboard • Janeiro 2025
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Última atualização</div>
                <div className="text-sm font-medium text-gray-700">Há 5 minutos</div>
              </div>
            </div>
          </div>

          {/* KPIs Principais - Design Clean */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Funcionários */}
            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-calma-blue-light rounded-lg">
                    <Users className="h-4 w-4 text-calma" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Funcionários</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{kpis.engagement.current}</div>
                <div className="text-xs text-gray-500">de {kpis.engagement.total} planejados</div>
              </CardContent>
            </Card>

            {/* Bem-estar */}
            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Brain className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Bem-estar</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {wellBeingIndex !== 'N/A' ? `${(wellBeingIndex / 10).toFixed(1)}` : kpis.wellBeing.score}
                </div>
                <div className="text-xs text-green-600">↗ {kpis.wellBeing.change} vs mês anterior</div>
              </CardContent>
            </Card>

            {/* Participação */}
            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Participação</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{kpis.activities.participation}%</div>
                <div className="text-xs text-blue-600">↗ {kpis.activities.weeklyGrowth}</div>
              </CardContent>
            </Card>

            {/* Alertas */}
            <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Alertas</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{kpis.alerts.total}</div>
                <div className="text-xs text-green-600">↘ {kpis.alerts.change} vs mês anterior</div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Principais - Layout Organizado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bem-estar */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-calma-blue-light rounded-lg">
                    <BarChart3 className="h-4 w-4 text-calma" />
                  </div>
                  Evolução do Bem-estar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockWellBeingEvolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      domain={[5, 8]} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#645CBB" 
                      strokeWidth={3}
                      dot={{ fill: '#645CBB', strokeWidth: 2, r: 4 }}
                      name="Sua Empresa"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="benchmark" 
                      stroke="#9CA3AF" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#9CA3AF', strokeWidth: 2, r: 3 }}
                      name="Benchmark"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 text-sm text-gray-600">
                  📈 Crescimento de 18% vs benchmark do setor
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Riscos */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <PieChartIcon className="h-4 w-4 text-red-600" />
                  </div>
                  Distribuição de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockRiskDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                    >
                      {mockRiskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-wrap gap-3">
                  {mockRiskDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                      <span className="text-sm font-medium" style={{ color: item.color }}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ROI e Atividades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROI */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  ROI Acumulado
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockROIData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="investment" fill="#ef4444" name="Investimento (R$ mil)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="savings" fill="#10b981" name="Economia (R$ mil)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-sm text-gray-600">
                  🚀 Projeção: R$ 180k economia próximos 6 meses
                </div>
              </CardContent>
            </Card>

            {/* Resumo de Atividades */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  Atividades e Engajamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {(kpis.activities.meditationMinutes / 60).toFixed(0)}h
                    </div>
                    <div className="text-sm text-blue-500">Meditação Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {kpis.activities.aiSessions}
                    </div>
                    <div className="text-sm text-green-500">Sessões IA</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Participação Geral</span>
                      <span className="text-sm font-bold text-gray-900">{kpis.activities.participation}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-calma h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${kpis.activities.participation}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-calma-blue-light p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-calma-dark">Crescimento Semanal</span>
                      <span className="text-sm font-bold text-green-600">{kpis.activities.weeklyGrowth}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Analytics de Meditação - DADOS REAIS */}
          {meditationMetrics && !meditationLoading && (
            <>
              {/* Header da Seção de Meditação */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Brain className="h-5 w-5 text-purple-600" />
                      </div>
                      Analytics de Meditação e Mindfulness
                    </h2>
                    <p className="text-sm text-gray-600">
                      Dados reais do aplicativo móvel • Última sincronização: agora
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total de horas</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {meditationMetrics.totalHours}h
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs de Meditação */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Usuários Ativos</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{meditationMetrics.activeUsers}</div>
                    <div className="text-xs text-gray-500">de {meditationMetrics.totalUsers} cadastrados</div>
                    <div className="text-xs text-purple-600 mt-1">
                      {meditationMetrics.totalUsers > 0 ? Math.round((meditationMetrics.activeUsers / meditationMetrics.totalUsers) * 100) : 0}% de engajamento
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Target className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Fases Completadas</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{meditationMetrics.completedPhases}</div>
                    <div className="text-xs text-gray-500">total de progressos</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {meditationMetrics.activeUsers > 0 ? (meditationMetrics.completedPhases / meditationMetrics.activeUsers).toFixed(1) : 0} fases/usuário
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Award className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Trilhas Concluídas</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{meditationMetrics.completedTracks}</div>
                    <div className="text-xs text-gray-500">jornadas finalizadas</div>
                    <div className="text-xs text-green-600 mt-1">
                      {meditationMetrics.activeUsers > 0 ? Math.round((meditationMetrics.completedTracks / meditationMetrics.activeUsers) * 100) : 0}% taxa de conclusão
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Tempo Total</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{meditationMetrics.totalHours}h</div>
                    <div className="text-xs text-gray-500">de prática acumulada</div>
                    <div className="text-xs text-orange-600 mt-1">
                      {meditationMetrics.activeUsers > 0 ? Math.round(meditationMetrics.totalHours / meditationMetrics.activeUsers) : 0}h por usuário
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos de Meditação */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evolução Temporal */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      Evolução da Prática de Meditação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <ComposedChart data={meditationMetrics.evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis 
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          yAxisId="left"
                          dataKey="totalMinutes" 
                          fill="#8B5CF6" 
                          name="Minutos de Meditação"
                          radius={[2, 2, 0, 0]}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="activeUsers" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                          name="Usuários Ativos"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-sm text-gray-600">
                      📊 Crescimento consistente na prática de meditação
                    </div>
                  </CardContent>
                </Card>

                {/* Trilhas Populares */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Trophy className="h-4 w-4 text-indigo-600" />
                      </div>
                      Trilhas Mais Populares
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {meditationMetrics.popularTracks.slice(0, 5).map((track, index) => (
                        <div key={track.trackId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{track.title}</div>
                              <div className="text-sm text-gray-500">{track.subtitle}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-purple-600">{track.totalUsers} usuários</div>
                            <div className="text-xs text-gray-500">{track.completionRate}% conclusão</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-700 font-medium">
                        💡 Insight: Trilhas de mindfulness básico têm maior adesão
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Breakdown por Departamento - Meditação */}
              {meditationMetrics.departmentBreakdown.length > 0 && (
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      Engajamento em Meditação por Departamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {meditationMetrics.departmentBreakdown.map((dept, index) => (
                        <div key={dept.departmentId || 'sem_dept'} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{dept.departmentName}</h4>
                            <Badge variant="outline" className="text-xs">
                              {dept.totalUsers} usuários
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Engajamento</span>
                              <span className="text-sm font-bold text-purple-600">{dept.engagementRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${dept.engagementRate}%` }}
                              ></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-gray-900">{dept.averageMinutesPerUser}min</div>
                                <div className="text-gray-500">Média/usuário</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-gray-900">{dept.completedPhases}</div>
                                <div className="text-gray-500">Fases</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {meditationMetrics.departmentBreakdown.reduce((sum, d) => sum + d.totalMinutes, 0)}min
                          </div>
                          <div className="text-sm text-gray-600">Total de Prática</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-indigo-600">
                            {Math.round(meditationMetrics.departmentBreakdown.reduce((sum, d) => sum + d.engagementRate, 0) / meditationMetrics.departmentBreakdown.length)}%
                          </div>
                          <div className="text-sm text-gray-600">Engajamento Médio</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {meditationMetrics.departmentBreakdown.filter(d => d.engagementRate >= 30).length}
                          </div>
                          <div className="text-sm text-gray-600">Departamentos Ativos</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resumo Executivo de Meditação */}
              <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">
                        {meditationMetrics.totalHours}h
                      </div>
                      <div className="text-sm text-purple-100">Tempo Total de Prática</div>
                      <div className="text-xs text-purple-200 mt-1">
                        Equivale a {Math.round(meditationMetrics.totalHours / 8)} dias úteis
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">
                        {meditationMetrics.totalUsers > 0 ? Math.round((meditationMetrics.activeUsers / meditationMetrics.totalUsers) * 100) : 0}%
                      </div>
                      <div className="text-sm text-purple-100">Taxa de Adoção</div>
                      <div className="text-xs text-purple-200 mt-1">
                        {meditationMetrics.activeUsers} de {meditationMetrics.totalUsers} funcionários
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">
                        {meditationMetrics.activeUsers > 0 ? Math.round((meditationMetrics.totalHours * 60) / meditationMetrics.activeUsers) : 0}min
                      </div>
                      <div className="text-sm text-purple-100">Média por Usuário</div>
                      <div className="text-xs text-purple-200 mt-1">
                        Tempo médio de prática individual
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">
                        {meditationMetrics.popularTracks.length}
                      </div>
                      <div className="text-sm text-purple-100">Trilhas Ativas</div>
                      <div className="text-xs text-purple-200 mt-1">
                        Conteúdos disponíveis no app
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Seção de Analytics de Sons - DADOS REAIS */}
          {soundsMetrics && !soundsLoading && (
            <>
              {/* Header da Seção de Sons */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 shadow-sm border border-cyan-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-3">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <Volume2 className="h-5 w-5 text-cyan-600" />
                      </div>
                      Analytics de Sons Relaxantes
                    </h2>
                    <p className="text-sm text-gray-600">
                      Dados reais do aplicativo móvel • Última sincronização: agora
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total de horas</div>
                    <div className="text-2xl font-bold text-cyan-600">
                      {soundsMetrics.totalHours}h
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs de Sons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white shadow-sm border border-cyan-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-cyan-50 rounded-lg">
                        <Headphones className="h-4 w-4 text-cyan-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Usuários Ativos</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{soundsMetrics.activeUsers}</div>
                    <div className="text-xs text-gray-500">de {soundsMetrics.totalUsers} cadastrados</div>
                    <div className="text-xs text-cyan-600 mt-1">
                      {soundsMetrics.totalUsers > 0 ? Math.round((soundsMetrics.activeUsers / soundsMetrics.totalUsers) * 100) : 0}% de engajamento
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Sessões Totais</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{soundsMetrics.totalSessions}</div>
                    <div className="text-xs text-gray-500">sessões de escuta</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {soundsMetrics.activeUsers > 0 ? (soundsMetrics.totalSessions / soundsMetrics.activeUsers).toFixed(1) : 0} sessões/usuário
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Categorias Ativas</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{soundsMetrics.popularCategories.length}</div>
                    <div className="text-xs text-gray-500">tipos de conteúdo</div>
                    <div className="text-xs text-green-600 mt-1">
                      {soundsMetrics.popularCategories[0]?.category || 'Natureza'} é a favorita
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Tempo Total</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{soundsMetrics.totalHours}h</div>
                    <div className="text-xs text-gray-500">de escuta acumulada</div>
                    <div className="text-xs text-orange-600 mt-1">
                      {soundsMetrics.activeUsers > 0 ? Math.round(soundsMetrics.totalHours / soundsMetrics.activeUsers) : 0}h por usuário
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos de Sons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Categorias Populares */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-cyan-50 rounded-lg">
                        <Trophy className="h-4 w-4 text-cyan-600" />
                      </div>
                      Categorias Mais Populares
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {soundsMetrics.popularCategories.slice(0, 5).map((category, index) => (
                        <div key={category.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{category.category}</div>
                              <div className="text-sm text-gray-500">{category.averageSessionDuration}min sessão média</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-cyan-600">{category.totalUsers} usuários</div>
                            <div className="text-xs text-gray-500">{category.engagementRate}% engajamento</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-cyan-50 rounded-lg">
                      <div className="text-sm text-cyan-700 font-medium">
                        💡 Insight: Sons da natureza são preferidos para relaxamento
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Evolução Temporal de Sons */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      Evolução do Uso de Sons
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <ComposedChart data={soundsMetrics.evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis 
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          yAxisId="left"
                          dataKey="totalMinutes" 
                          fill="#06B6D4" 
                          name="Minutos de Escuta"
                          radius={[2, 2, 0, 0]}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="activeUsers" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                          name="Usuários Ativos"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-sm text-gray-600">
                      📊 Crescimento consistente no uso de sons relaxantes
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Seção de Analytics de Diário - DADOS REAIS */}
          {diaryMetrics && !diaryLoading && (
            <>
              {/* Header da Seção de Diário */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 shadow-sm border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                      </div>
                      Analytics de Diário Emocional
                    </h2>
                    <p className="text-sm text-gray-600">
                      Dados reais do aplicativo móvel • Última sincronização: agora
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total de entradas</div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {diaryMetrics.totalEntries}
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs de Diário */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white shadow-sm border border-emerald-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Usuários Ativos</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{diaryMetrics.activeUsers}</div>
                    <div className="text-xs text-gray-500">de {diaryMetrics.totalUsers} cadastrados</div>
                    <div className="text-xs text-emerald-600 mt-1">
                      {diaryMetrics.totalUsers > 0 ? Math.round((diaryMetrics.activeUsers / diaryMetrics.totalUsers) * 100) : 0}% de engajamento
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-teal-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-teal-50 rounded-lg">
                        <Heart className="h-4 w-4 text-teal-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Entradas Totais</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{diaryMetrics.totalEntries}</div>
                    <div className="text-xs text-gray-500">registros emocionais</div>
                    <div className="text-xs text-teal-600 mt-1">
                      {diaryMetrics.averageEntriesPerUser} entradas/usuário
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Smile className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Emoções Positivas</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {diaryMetrics.emotionalDistribution.filter(e => e.category === 'positive').reduce((sum, e) => sum + e.percentage, 0)}%
                    </div>
                    <div className="text-xs text-gray-500">do total de registros</div>
                    <div className="text-xs text-green-600 mt-1">
                      Tendência positiva no humor
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-yellow-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-yellow-50 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-yellow-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Score de Humor</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {diaryMetrics.evolutionData.length > 0 ? diaryMetrics.evolutionData[diaryMetrics.evolutionData.length - 1].moodScore : 7.0}/10
                    </div>
                    <div className="text-xs text-gray-500">humor médio atual</div>
                    <div className="text-xs text-yellow-600 mt-1">
                      Baseado em {diaryMetrics.totalEntries} registros
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos de Diário */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribuição Emocional */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <PieChartIcon className="h-4 w-4 text-emerald-600" />
                      </div>
                      Distribuição Emocional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={diaryMetrics.emotionalDistribution.slice(0, 8)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={30}
                          fill="#8884d8"
                          dataKey="percentage"
                          label={({ emotion, percentage }) => `${emotion}: ${percentage}%`}
                        >
                          {diaryMetrics.emotionalDistribution.slice(0, 8).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-sm text-gray-600">
                      😊 {diaryMetrics.emotionalDistribution.filter(e => e.category === 'positive').length} emoções positivas dominantes
                    </div>
                  </CardContent>
                </Card>

                {/* Evolução do Humor */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-teal-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-teal-600" />
                      </div>
                      Evolução do Humor Coletivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={diaryMetrics.evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis 
                          domain={[5, 8]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="moodScore" 
                          stroke="#14B8A6" 
                          strokeWidth={3}
                          dot={{ fill: '#14B8A6', strokeWidth: 2, r: 4 }}
                          name="Score de Humor"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-sm text-gray-600">
                      📈 Melhoria gradual no humor coletivo da empresa
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Seção de Analytics de Questionários - DADOS REAIS */}
          {questionnaireMetrics && !questionnaireLoading && (
            <>
              {/* Header da Seção de Questionários */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 shadow-sm border border-amber-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-amber-600" />
                      </div>
                      Analytics de Questionários de Bem-estar
                    </h2>
                    <p className="text-sm text-gray-600">
                      Dados reais do sistema de questionários • Última sincronização: agora
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total de respostas</div>
                    <div className="text-2xl font-bold text-amber-600">
                      {questionnaireMetrics.totalResponses}
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs de Questionários */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white shadow-sm border border-amber-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Questionários Ativos</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{questionnaireMetrics.activeQuestionnaires}</div>
                    <div className="text-xs text-gray-500">de {questionnaireMetrics.totalQuestionnaires} criados</div>
                    <div className="text-xs text-amber-600 mt-1">
                      {questionnaireMetrics.totalQuestionnaires > 0 ? Math.round((questionnaireMetrics.activeQuestionnaires / questionnaireMetrics.totalQuestionnaires) * 100) : 0}% taxa de ativação
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Total de Respostas</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{questionnaireMetrics.totalResponses}</div>
                    <div className="text-xs text-gray-500">respostas coletadas</div>
                    <div className="text-xs text-orange-600 mt-1">
                      {questionnaireMetrics.activeQuestionnaires > 0 ? Math.round(questionnaireMetrics.totalResponses / questionnaireMetrics.activeQuestionnaires) : 0} respostas/questionário
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Target className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Taxa de Conclusão</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{questionnaireMetrics.averageCompletionRate}%</div>
                    <div className="text-xs text-gray-500">questionários completados</div>
                    <div className="text-xs text-green-600 mt-1">
                      {questionnaireMetrics.averageCompletionRate >= 80 ? 'Excelente' : questionnaireMetrics.averageCompletionRate >= 60 ? 'Boa' : 'Melhorar'} adesão
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Departamentos</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{questionnaireMetrics.responsesByDepartment.length}</div>
                    <div className="text-xs text-gray-500">setores participantes</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {questionnaireMetrics.responsesByDepartment.length > 0 ? '100%' : '0%'} cobertura setorial
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos de Questionários */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evolução de Respostas */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                      </div>
                      Evolução de Participação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <ComposedChart data={questionnaireMetrics.responseEvolution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis 
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          yAxisId="left"
                          dataKey="totalResponses" 
                          fill="#F59E0B" 
                          name="Total de Respostas"
                          radius={[2, 2, 0, 0]}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="completionRate" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                          name="Taxa de Conclusão (%)"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-sm text-gray-600">
                      📊 Acompanhamento da participação nos questionários de bem-estar
                    </div>
                  </CardContent>
                </Card>

                {/* Satisfação por Departamento */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Heart className="h-4 w-4 text-green-600" />
                      </div>
                      Satisfação por Departamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {questionnaireMetrics.departmentSatisfaction.length > 0 ? (
                      <div className="space-y-4">
                        {questionnaireMetrics.departmentSatisfaction.slice(0, 6).map((dept, index) => (
                          <div key={dept.department} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${
                                dept.wellbeingScore >= 8 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                dept.wellbeingScore >= 6 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                'bg-gradient-to-r from-red-500 to-rose-500'
                              }`}>
                                {Math.round(dept.wellbeingScore)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{dept.department}</div>
                                <div className="text-sm text-gray-500">Bem-estar: {dept.wellbeingScore.toFixed(1)}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-900">{dept.wellbeingScore.toFixed(1)}/10</div>
                              <div className="text-xs text-gray-500">satisfação média</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Nenhum dado de satisfação disponível ainda</p>
                        <p className="text-sm">Os dados aparecerão após as primeiras respostas</p>
                      </div>
                    )}
                    
                    {questionnaireMetrics.departmentSatisfaction.length > 0 && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-700 font-medium">
                          💡 Insight: Score médio de {(questionnaireMetrics.departmentSatisfaction.reduce((sum, d) => sum + d.wellbeingScore, 0) / questionnaireMetrics.departmentSatisfaction.length).toFixed(1)}/10 na satisfação geral
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Performance de Questionários */}
              {questionnaireMetrics.questionnairePerformance.length > 0 && (
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Trophy className="h-4 w-4 text-blue-600" />
                      </div>
                      Performance de Questionários
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {questionnaireMetrics.questionnairePerformance.map((questionnaire, index) => (
                        <div key={questionnaire.questionnaire} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{questionnaire.questionnaire}</h4>
                            <Badge variant="outline" className="text-xs">
                              {questionnaire.totalResponses} respostas
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Taxa de Conclusão</span>
                              <span className="text-sm font-bold text-amber-600">{questionnaire.completionRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${questionnaire.completionRate}%` }}
                              ></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-gray-900">{questionnaire.averageScore.toFixed(1)}</div>
                                <div className="text-gray-500">Score médio</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-gray-900">{questionnaire.lastResponse}</div>
                                <div className="text-gray-500">Última resposta</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-amber-600">
                            {questionnaireMetrics.questionnairePerformance.reduce((sum, q) => sum + q.totalResponses, 0)}
                          </div>
                          <div className="text-sm text-gray-600">Total de Respostas</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {questionnaireMetrics.questionnairePerformance.length > 0 ? 
                              Math.round(questionnaireMetrics.questionnairePerformance.reduce((sum, q) => sum + q.completionRate, 0) / questionnaireMetrics.questionnairePerformance.length) : 0}%
                          </div>
                          <div className="text-sm text-gray-600">Conclusão Média</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {questionnaireMetrics.questionnairePerformance.length > 0 ? 
                              (questionnaireMetrics.questionnairePerformance.reduce((sum, q) => sum + q.averageScore, 0) / questionnaireMetrics.questionnairePerformance.length).toFixed(1) : 0}
                          </div>
                          <div className="text-sm text-gray-600">Score Médio Geral</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resumo Executivo de Questionários */}
              <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">
                        {questionnaireMetrics.totalResponses}
                      </div>
                      <div className="text-sm text-amber-100">Total de Respostas</div>
                      <div className="text-xs text-amber-200 mt-1">
                        Dados coletados para análise
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">
                        {questionnaireMetrics.averageCompletionRate}%
                      </div>
                      <div className="text-sm text-amber-100">Taxa de Conclusão</div>
                      <div className="text-xs text-amber-200 mt-1">
                        Engajamento dos funcionários
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">
                        {questionnaireMetrics.departmentSatisfaction.length > 0 ? 
                          (questionnaireMetrics.departmentSatisfaction.reduce((sum, d) => sum + d.wellbeingScore, 0) / questionnaireMetrics.departmentSatisfaction.length).toFixed(1) : 0}/10
                      </div>
                      <div className="text-sm text-amber-100">Satisfação Média</div>
                      <div className="text-xs text-amber-200 mt-1">
                        Score geral de bem-estar
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">
                        {questionnaireMetrics.activeQuestionnaires}
                      </div>
                      <div className="text-sm text-amber-100">Questionários Ativos</div>
                      <div className="text-xs text-amber-200 mt-1">
                        Em coleta de dados
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Análise por Setores - Versão Aprimorada */}
          {sectorAnalysisData.length > 0 && (
            <>
              {/* Header da Seção de Setores */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Building2 className="h-5 w-5 text-orange-600" />
                      </div>
                      Análise Detalhada por Setores
                    </h2>
                    <p className="text-sm text-gray-500">
                      Performance comparativa • {sectorAnalysisData.length} setores ativos
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total de funcionários</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {sectorAnalysisData.reduce((sum, s) => sum + s.employees, 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards de Performance por Setor */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectorAnalysisData.map((sector, index) => (
                  <Card key={sector.sector} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="border-b border-gray-100 pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: sector.color }}
                          ></div>
                          <span className="text-lg font-semibold text-gray-900">{sector.sector}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">funcionários</div>
                          <div className="text-sm font-semibold text-gray-700">{sector.employees}</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Bem-estar Score */}
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-calma mb-1">
                            {sector.wellBeing}/10
                          </div>
                          <div className="text-sm text-gray-600">Índice de Bem-estar</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-calma h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(sector.wellBeing / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Métricas */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-xl font-bold text-blue-600">
                              {sector.engagement}%
                            </div>
                            <div className="text-xs text-blue-500">Participação</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-xl font-bold text-red-600">
                              {sector.alerts}
                            </div>
                            <div className="text-xs text-red-500">Alertas</div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-center">
                          {sector.wellBeing >= 7.0 ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <ArrowUp className="h-3 w-3 mr-1" />
                              Excelente
                            </Badge>
                          ) : sector.wellBeing >= 6.0 ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Minus className="h-3 w-3 mr-1" />
                              Bom
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <ArrowDown className="h-3 w-3 mr-1" />
                              Atenção
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Gráfico Comparativo de Setores */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ranking de Bem-estar */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Trophy className="h-4 w-4 text-green-600" />
                      </div>
                      Ranking de Bem-estar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {sectorAnalysisData
                        .sort((a, b) => b.wellBeing - a.wellBeing)
                        .map((sector, index) => (
                          <div key={sector.sector} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-calma-blue-light text-calma text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="font-medium text-gray-700">{sector.sector}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-calma">{sector.wellBeing}/10</span>
                              {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Alertas por Setor */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      Distribuição de Alertas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={sectorAnalysisData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="sector"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#666' }}
                          width={80}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value} alertas`, 'Alertas']}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Bar 
                          dataKey="alerts" 
                          fill="#ef4444" 
                          radius={[0, 2, 2, 0]}
                          name="Alertas"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                      <div className="text-sm text-gray-600">
                        Total: {sectorAnalysisData.reduce((sum, s) => sum + s.alerts, 0)} colaboradores com alertas
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumo Executivo de Setores */}
              <Card className="bg-gradient-to-r from-calma-blue-light to-white shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-calma mb-1">
                        {Math.max(...sectorAnalysisData.map(s => s.wellBeing)).toFixed(1)}/10
                      </div>
                      <div className="text-sm text-gray-600">Melhor Performance</div>
                      <div className="text-xs text-green-600 mt-1">
                        {sectorAnalysisData.find(s => s.wellBeing === Math.max(...sectorAnalysisData.map(d => d.wellBeing)))?.sector}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-calma mb-1">
                        {Math.round(sectorAnalysisData.reduce((sum, s) => sum + s.engagement, 0) / sectorAnalysisData.length)}%
                      </div>
                      <div className="text-sm text-gray-600">Participação Média</div>
                      <div className="text-xs text-blue-600 mt-1">Across all departments</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-calma mb-1">
                        {sectorAnalysisData.filter(s => s.alerts === 0).length}/{sectorAnalysisData.length}
                      </div>
                      <div className="text-sm text-gray-600">Setores sem Alertas</div>
                      <div className="text-xs text-green-600 mt-1">Zero risk departments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </CompanyDashboardLayout>
    </>
  );
};

export default CompanyDashboard;
