import { supabase } from '../integrations/supabase/client';
import { AuthService } from './authService';

// Types for questionnaire system - ONLY SCALE QUESTIONS
export interface QuestionOption {
  id: number;
  question: string;
  type: 'scale'; // RESTRICTED TO SCALE ONLY
  scale_min: number; // Required for scale questions
  scale_max: number; // Required for scale questions
  scale_labels: string[]; // Required for scale questions
  required: boolean;
}

export interface Questionnaire {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  questions: QuestionOption[];
  target_department: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  start_date: string | null;
  end_date: string | null;
  notification_sent: boolean;
  is_anonymous: boolean;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaire_id: string;
  user_id: string;
  company_id: string;
  department: string | null;
  responses: ResponseAnswer[];
  completion_status: string;
  submitted_at: string;
  created_at: string;
}

export interface ResponseAnswer {
  question_id: number;
  answer: string | number;
  question_text: string;
}

export interface QuestionnaireMetrics {
  totalQuestionnaires: number;
  activeQuestionnaires: number;
  totalResponses: number;
  averageCompletionRate: number;
  responsesByDepartment: DepartmentResponseData[];
  responseEvolution: ResponseEvolutionData[];
  questionnairePerformance: QuestionnairePerformanceData[];
  departmentSatisfaction: DepartmentSatisfactionData[];
}

export interface DepartmentResponseData {
  department: string;
  totalSent: number;
  totalCompleted: number;
  completionRate: number;
  averageScore: number;
}

export interface ResponseEvolutionData {
  date: string;
  responses: number;
  completionRate: number;
}

export interface QuestionnairePerformanceData {
  questionnaire: string;
  totalResponses: number;
  completionRate: number;
  averageScore: number;
  lastResponse: string;
}

export interface DepartmentSatisfactionData {
  department: string;
  wellbeingScore: number;
  stressLevel: number;
  workSatisfaction: number;
  workLifeBalance: number;
}

export async function getCompanyQuestionnaireMetrics(companyId?: string): Promise<QuestionnaireMetrics> {
  try {
    // Get the correct company_id using AuthService
    const validCompanyId = await AuthService.getValidatedCompanyId();
    if (!validCompanyId) {
      console.error('No valid company_id found');
      return getEmptyMetrics();
    }

    console.log('📊 getCompanyQuestionnaireMetrics - Using company_id:', validCompanyId);

    // Get all questionnaires for the company
    const { data: questionnaires, error: questionnairesError } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('company_id', validCompanyId);

    if (questionnairesError) {
      console.error('Error fetching questionnaires:', questionnairesError);
      return getEmptyMetrics();
    }

    // Get all responses for the company
    const { data: responses, error: responsesError } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('company_id', validCompanyId);

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      return getEmptyMetrics();
    }

    // Get analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from('questionnaire_analytics')
      .select('*')
      .eq('company_id', validCompanyId)
      .order('period_start', { ascending: false });

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
    }

    // Calculate metrics
    const totalQuestionnaires = questionnaires?.length || 0;
    const activeQuestionnaires = questionnaires?.filter(q => q.status === 'active').length || 0;
    const totalResponses = responses?.length || 0;

    // Calculate completion rate
    const completedResponses = responses?.filter(r => r.completion_status === 'completed').length || 0;
    const averageCompletionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;

    // Type conversion for responses to match our interface
    const typedResponses: QuestionnaireResponse[] = (responses || []).map(r => ({
      ...r,
      responses: Array.isArray(r.responses) ? r.responses as unknown as ResponseAnswer[] : []
    }));

    // Type conversion for questionnaires to match our interface  
    const typedQuestionnaires: Questionnaire[] = (questionnaires || []).map(q => ({
      ...q,
      questions: Array.isArray(q.questions) ? q.questions as unknown as QuestionOption[] : [],
      is_anonymous: (q as any).is_anonymous ?? false,
    }));

    // Group responses by department
    const responsesByDepartment = calculateDepartmentMetrics(typedResponses);

    // Generate evolution data (last 30 days)
    const responseEvolution = generateEvolutionData(typedResponses);

    // Calculate questionnaire performance
    const questionnairePerformance = calculateQuestionnairePerformance(typedQuestionnaires, typedResponses);

    // Calculate department satisfaction scores
    const departmentSatisfaction = calculateDepartmentSatisfaction(typedResponses);

    return {
      totalQuestionnaires,
      activeQuestionnaires,
      totalResponses,
      averageCompletionRate,
      responsesByDepartment,
      responseEvolution,
      questionnairePerformance,
      departmentSatisfaction,
    };
  } catch (error) {
    console.error('Error fetching questionnaire metrics:', error);
    return getEmptyMetrics();
  }
}

function calculateDepartmentMetrics(responses: QuestionnaireResponse[]): DepartmentResponseData[] {
  const departmentMap = new Map<string, {
    totalSent: number;
    totalCompleted: number;
    scores: number[];
  }>();

  responses.forEach(response => {
    const dept = response.department || 'Não Informado';
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, { totalSent: 0, totalCompleted: 0, scores: [] });
    }

    const deptData = departmentMap.get(dept)!;
    deptData.totalSent += 1;

    if (response.completion_status === 'completed') {
      deptData.totalCompleted += 1;

      // Calculate average score from responses (scale questions only)
      const scaleResponses = response.responses.filter(r => typeof r.answer === 'number');
      if (scaleResponses.length > 0) {
        const avgScore = scaleResponses.reduce((sum, r) => sum + (r.answer as number), 0) / scaleResponses.length;
        deptData.scores.push(avgScore);
      }
    }
  });

  return Array.from(departmentMap.entries()).map(([department, data]) => ({
    department,
    totalSent: data.totalSent,
    totalCompleted: data.totalCompleted,
    completionRate: data.totalSent > 0 ? (data.totalCompleted / data.totalSent) * 100 : 0,
    averageScore: data.scores.length > 0 ? data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length : 0,
  }));
}

function generateEvolutionData(responses: QuestionnaireResponse[]): ResponseEvolutionData[] {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  return last30Days.map(date => {
    const dayResponses = responses.filter(r =>
      r.created_at.split('T')[0] === date
    );

    const completedResponses = dayResponses.filter(r => r.completion_status === 'completed');

    return {
      date,
      responses: dayResponses.length,
      completionRate: dayResponses.length > 0 ? (completedResponses.length / dayResponses.length) * 100 : 0,
    };
  });
}

function calculateQuestionnairePerformance(
  questionnaires: Questionnaire[],
  responses: QuestionnaireResponse[]
): QuestionnairePerformanceData[] {
  return questionnaires.map(questionnaire => {
    const questionnaireResponses = responses.filter(r => r.questionnaire_id === questionnaire.id);
    const completedResponses = questionnaireResponses.filter(r => r.completion_status === 'completed');

    // Calculate average score
    const allScores: number[] = [];
    completedResponses.forEach(response => {
      const scaleResponses = response.responses.filter(r => typeof r.answer === 'number');
      if (scaleResponses.length > 0) {
        const avgScore = scaleResponses.reduce((sum, r) => sum + (r.answer as number), 0) / scaleResponses.length;
        allScores.push(avgScore);
      }
    });

    const averageScore = allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0;

    // Find last response date
    const lastResponse = questionnaireResponses.length > 0
      ? questionnaireResponses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
      : '';

    return {
      questionnaire: questionnaire.title,
      totalResponses: questionnaireResponses.length,
      completionRate: questionnaireResponses.length > 0 ? (completedResponses.length / questionnaireResponses.length) * 100 : 0,
      averageScore,
      lastResponse: lastResponse ? new Date(lastResponse).toLocaleDateString('pt-BR') : 'Nenhuma resposta',
    };
  });
}

function calculateDepartmentSatisfaction(responses: QuestionnaireResponse[]): DepartmentSatisfactionData[] {
  const departmentMap = new Map<string, {
    wellbeingScores: number[];
    stressLevels: number[];
    workSatisfactionScores: number[];
    workLifeBalanceScores: number[];
  }>();

  responses.filter(r => r.completion_status === 'completed').forEach(response => {
    const dept = response.department || 'Não Informado';
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, {
        wellbeingScores: [],
        stressLevels: [],
        workSatisfactionScores: [],
        workLifeBalanceScores: [],
      });
    }

    const deptData = departmentMap.get(dept)!;

    // Map responses to specific categories (based on question IDs from our schema)
    response.responses.forEach(answer => {
      if (typeof answer.answer === 'number') {
        switch (answer.question_id) {
          case 1: // Stress level
            deptData.stressLevels.push(answer.answer);
            break;
          case 3: // Work environment satisfaction
            deptData.workSatisfactionScores.push(answer.answer);
            break;
          case 7: // Work-life balance
            deptData.workLifeBalanceScores.push(answer.answer);
            break;
          case 9: // General wellbeing
            deptData.wellbeingScores.push(answer.answer);
            break;
        }
      }
    });
  });

  return Array.from(departmentMap.entries()).map(([department, data]) => ({
    department,
    wellbeingScore: data.wellbeingScores.length > 0
      ? data.wellbeingScores.reduce((sum, score) => sum + score, 0) / data.wellbeingScores.length
      : 0,
    stressLevel: data.stressLevels.length > 0
      ? data.stressLevels.reduce((sum, score) => sum + score, 0) / data.stressLevels.length
      : 0,
    workSatisfaction: data.workSatisfactionScores.length > 0
      ? data.workSatisfactionScores.reduce((sum, score) => sum + score, 0) / data.workSatisfactionScores.length
      : 0,
    workLifeBalance: data.workLifeBalanceScores.length > 0
      ? data.workLifeBalanceScores.reduce((sum, score) => sum + score, 0) / data.workLifeBalanceScores.length
      : 0,
  }));
}

export function getEmptyMetrics(): QuestionnaireMetrics {
  return {
    totalQuestionnaires: 0,
    activeQuestionnaires: 0,
    totalResponses: 0,
    averageCompletionRate: 0,
    responsesByDepartment: [],
    responseEvolution: [],
    questionnairePerformance: [],
    departmentSatisfaction: [],
  };
}

// Helper functions for managing questionnaires
export async function createQuestionnaire(questionnaire: Omit<Questionnaire, 'id' | 'created_at' | 'updated_at'>): Promise<Questionnaire | null> {
  try {
    // Enhanced debug logging with session details
    console.log('=== DEBUG: Creating questionnaire ===');

    // Get detailed auth information
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const { data: session } = await supabase.auth.getSession();

    console.log('🔐 Auth Details:');
    console.log('User:', user);
    console.log('User ID:', user?.id);
    console.log('Auth Error:', authError);
    console.log('Session:', session?.session);
    console.log('Access Token:', session?.session?.access_token ? 'Present' : 'Missing');
    console.log('Token Expires At:', session?.session?.expires_at);

    // Test database auth context
    const { data: authTest, error: authTestError } = await supabase
      .from('questionnaires')
      .select('count')
      .limit(1);

    console.log('🗄️ Database Auth Test:');
    console.log('Query Result:', authTest);
    console.log('Query Error:', authTestError);

    console.log('📝 Input questionnaire data:', {
      ...questionnaire,
      questions: `[${questionnaire.questions.length} questions]` // Don't log full questions to keep clean
    });

    // Use user.id for questionnaires table (follows FK constraint to auth.users)
    const actualCompanyId = user?.id || questionnaire.company_id;
    console.log('🔄 Company ID Correction for FK:');
    console.log('Original company_id (from empresa):', questionnaire.company_id);
    console.log('User ID (for FK to auth.users):', user?.id);
    console.log('Using company_id for insert:', actualCompanyId);

    // Prepare the data for insertion
    const insertData = {
      company_id: actualCompanyId,
      title: questionnaire.title,
      description: questionnaire.description,
      // Garante que questions é sempre um array JSON válido
      questions: Array.isArray(questionnaire.questions) ? questionnaire.questions : [],
      target_department: questionnaire.target_department,
      status: questionnaire.status || 'inactive',
      created_by: user?.id || questionnaire.created_by,
      start_date: questionnaire.start_date,
      end_date: questionnaire.end_date,
      notification_sent: questionnaire.notification_sent || false,
      is_anonymous: questionnaire.is_anonymous || false,
    };

    console.log('Data being inserted:', {
      ...insertData,
      questions: `[${Array.isArray(insertData.questions) ? insertData.questions.length : 0} questions]`
    });

    const { data, error } = await supabase
      .from('questionnaires')
      .insert([{
        ...insertData,
        questions: JSON.parse(JSON.stringify(insertData.questions)) // Garante JSON puro
      }])
      .select()
      .single();

    if (error) {
      console.error('=== SUPABASE ERROR DETAILS ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Full error object:', error);
      return null;
    }

    if (!data) {
      console.error('No data returned from insert operation');
      return null;
    }

    console.log('✅ Questionnaire created successfully:', data.id);

    return {
      ...data,
      questions: Array.isArray(data.questions) ? data.questions as unknown as QuestionOption[] : [],
      is_anonymous: (data as any).is_anonymous ?? false,
    };
  } catch (error) {
    console.error('=== JAVASCRIPT ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', (error as any)?.message);
    console.error('Error stack:', (error as any)?.stack);
    console.error('Full error:', error);
    return null;
  }
}

export async function getQuestionnaireById(id: string): Promise<Questionnaire | null> {
  try {
    const { data, error } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching questionnaire:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      questions: Array.isArray(data.questions) ? data.questions as unknown as QuestionOption[] : [],
      is_anonymous: (data as any).is_anonymous ?? false,
    };
  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    return null;
  }
}

export async function submitQuestionnaireResponse(
  questionnaireId: string,
  userId: string,
  companyId: string,
  department: string,
  responses: ResponseAnswer[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('questionnaire_responses')
      .insert([{
        questionnaire_id: questionnaireId,
        user_id: userId,
        company_id: companyId,
        department,
        responses: responses as any,
        completion_status: 'completed',
        submitted_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('Error submitting response:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error submitting response:', error);
    return false;
  }
}

export async function getQuestionnaireResponses(
  companyId?: string,
  questionnaireId?: string,
  department?: string
): Promise<QuestionnaireResponse[]> {
  try {
    // Get the correct company_id using AuthService
    const validCompanyId = await AuthService.getValidatedCompanyId();
    if (!validCompanyId) {
      console.error('No valid company_id found for getQuestionnaireResponses');
      return [];
    }

    console.log('💬 getQuestionnaireResponses - Using company_id:', validCompanyId);
    console.log('  - Questionnaire ID filter:', questionnaireId);
    console.log('  - Department filter:', department);

    let query = supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('company_id', validCompanyId);

    if (questionnaireId) {
      query = query.eq('questionnaire_id', questionnaireId);
    }

    if (department) {
      query = query.eq('department', department);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching responses:', error);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} questionnaire responses`);

    // Type conversion for responses to match our interface
    const typedResponses: QuestionnaireResponse[] = (data || []).map(r => ({
      ...r,
      responses: Array.isArray(r.responses) ? r.responses as unknown as ResponseAnswer[] : []
    }));

    return typedResponses;
  } catch (error) {
    console.error('Error fetching responses:', error);
    return [];
  }
}

// NEW FUNCTIONS FOR ENHANCED FUNCTIONALITY

export async function getDefaultQuestionnaire(companyId?: string): Promise<Questionnaire | null> {
  try {
    // Get authenticated user ID (questionnaires.company_id references auth.users.id)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('No authenticated user found for getDefaultQuestionnaire');
      return null;
    }

    console.log('📝 getDefaultQuestionnaire - Using user.id as company_id:', user.id);

    // First, try to get an existing default questionnaire
    const { data: existingQuestionnaire, error: existingError } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('company_id', user.id)
      .eq('title', 'Questionário de Bem-Estar Padrão')
      .single();

    if (existingQuestionnaire && !existingError) {
      return {
        ...existingQuestionnaire,
        questions: Array.isArray(existingQuestionnaire.questions)
          ? existingQuestionnaire.questions as unknown as QuestionOption[]
          : [],
        is_anonymous: (existingQuestionnaire as any).is_anonymous ?? false,
      };
    }

    // If no default questionnaire exists, create one
    const defaultQuestions: QuestionOption[] = [
      {
        id: 1,
        question: "Como você avalia seu nível de estresse no trabalho?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Muito baixo", "Baixo", "Médio", "Alto", "Muito alto"],
        required: true
      },
      {
        id: 2,
        question: "Você se sente motivado em seu trabalho atual?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Nada motivado", "Pouco motivado", "Neutro", "Motivado", "Muito motivado"],
        required: true
      },
      {
        id: 3,
        question: "Como você avalia a qualidade do ambiente de trabalho?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Muito ruim", "Ruim", "Regular", "Bom", "Excelente"],
        required: true
      },
      {
        id: 4,
        question: "Com que frequência você sente sobrecarga de trabalho?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"],
        required: true
      },
      {
        id: 5,
        question: "Você sente que tem autonomia suficiente em suas tarefas?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Nenhuma autonomia", "Pouca", "Moderada", "Boa", "Total autonomia"],
        required: true
      },
      {
        id: 6,
        question: "Como você avalia o equilíbrio entre vida pessoal e trabalho?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Muito ruim", "Ruim", "Regular", "Bom", "Excelente"],
        required: true
      },
      {
        id: 7,
        question: "Você se sente reconhecido pelo seu trabalho?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"],
        required: true
      },
      {
        id: 8,
        question: "Como está seu bem-estar geral no momento?",
        type: "scale",
        scale_min: 1,
        scale_max: 10,
        scale_labels: ["1 - Muito mal", "2", "3", "4", "5", "6", "7", "8", "9", "10 - Excelente"],
        required: true
      },
      {
        id: 9,
        question: "Como você avalia a clareza das metas e objetivos do seu trabalho?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Muito confusas", "Confusas", "Regulares", "Claras", "Muito claras"],
        required: true
      }
    ];

    const newQuestionnaire: Omit<Questionnaire, 'id' | 'created_at' | 'updated_at'> = {
      company_id: user.id, // Use user.id for FK constraint
      title: 'Questionário de Bem-Estar Padrão',
      description: 'Questionário padrão para avaliar o bem-estar e satisfação dos colaboradores',
      questions: defaultQuestions,
      target_department: null,
      status: 'active',
      created_by: user.id,
      start_date: null,
      end_date: null,
      notification_sent: false,
      is_anonymous: false,
    };

    const createdQuestionnaire = await createQuestionnaire(newQuestionnaire);
    return createdQuestionnaire;
  } catch (error) {
    console.error('Error getting/creating default questionnaire:', error);
    return null;
  }
}

export async function triggerQuestionnaire(
  questionnaireId: string,
  targetDepartments?: string[]
): Promise<boolean> {
  try {
    console.log(`🚀 Triggering questionnaire ${questionnaireId} for departments:`, targetDepartments);

    const { data, error } = await supabase.functions.invoke('trigger-questionnaire', {
      body: { questionnaireId, targetDepartments },
    });

    if (error) {
      console.error('Error invoking trigger-questionnaire function:', error);
      return false;
    }

    console.log('✅ Function invoked successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in triggerQuestionnaire service:', error);
    return false;
  }
}

export async function getActiveQuestionnaires(companyId?: string): Promise<Questionnaire[]> {
  try {
    // Get the correct company_id using AuthService
    const validCompanyId = await AuthService.getValidatedCompanyId();
    if (!validCompanyId) {
      console.error('No valid company_id found for getActiveQuestionnaires');
      return [];
    }

    console.log('🎯 getActiveQuestionnaires - Using company_id:', validCompanyId);

    const { data, error } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('company_id', validCompanyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active questionnaires:', error);
      return [];
    }

    return (data || []).map(q => ({
      ...q,
      questions: Array.isArray(q.questions) ? q.questions as unknown as QuestionOption[] : [],
      is_anonymous: (q as any).is_anonymous ?? false,
    }));
  } catch (error) {
    console.error('Error fetching active questionnaires:', error);
    return [];
  }
}

export interface RealTimeStats {
  totalActive: number;
  totalResponses: number;
  pendingResponses: number;
  responseRate: number;
  departmentStats: {
    department: string;
    sent: number;
    responded: number;
    responseRate: number;
  }[];
  lastUpdated: string;
}

export async function getRealTimeStats(companyId?: string): Promise<RealTimeStats> {
  try {
    // Get the correct company_id using AuthService
    const validCompanyId = await AuthService.getValidatedCompanyId();
    if (!validCompanyId) {
      console.error('No valid company_id found for getRealTimeStats');
      return {
        totalActive: 0,
        totalResponses: 0,
        pendingResponses: 0,
        responseRate: 0,
        departmentStats: [],
        lastUpdated: new Date().toISOString()
      };
    }

    console.log('📈 getRealTimeStats - Using company_id:', validCompanyId);

    const [questionnaires, responses] = await Promise.all([
      supabase.from('questionnaires').select('*').eq('company_id', validCompanyId).eq('status', 'active'),
      supabase.from('questionnaire_responses').select('*').eq('company_id', validCompanyId)
    ]);

    const totalActive = questionnaires.data?.length || 0;
    const totalResponses = responses.data?.length || 0;

    // Estimate pending responses based on active questionnaires
    // For now, we'll assume each active questionnaire should have responses from all departments
    const estimatedTotalExpected = totalActive * 5; // Assuming 5 departments on average
    const pendingResponses = Math.max(0, estimatedTotalExpected - totalResponses);
    const responseRate = estimatedTotalExpected > 0 ? (totalResponses / estimatedTotalExpected) * 100 : 0;

    // Calculate department stats from actual responses
    const departmentMap = new Map<string, { sent: number; responded: number }>();

    responses.data?.forEach(response => {
      const dept = response.department || 'Geral';
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, { sent: totalActive, responded: 0 });
      }
      departmentMap.get(dept)!.responded += 1;
    });

    const departmentStats = Array.from(departmentMap.entries()).map(([department, stats]) => ({
      department,
      sent: stats.sent,
      responded: stats.responded,
      responseRate: stats.sent > 0 ? (stats.responded / stats.sent) * 100 : 0
    }));

    return {
      totalActive,
      totalResponses,
      pendingResponses,
      responseRate,
      departmentStats,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching real-time stats:', error);
    return {
      totalActive: 0,
      totalResponses: 0,
      pendingResponses: 0,
      responseRate: 0,
      departmentStats: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

export async function getQuestionnaireSchedule(companyId?: string): Promise<{
  upcoming: Array<{
    id: string;
    title: string;
    scheduledDate: string;
    targetDepartment: string | null;
    status: string;
  }>;
  active: Array<{
    id: string;
    title: string;
    startDate: string;
    endDate: string | null;
    responseCount: number;
    targetDepartment: string | null;
  }>;
}> {
  try {
    // Get the correct company_id using AuthService
    const validCompanyId = await AuthService.getValidatedCompanyId();
    if (!validCompanyId) {
      console.error('No valid company_id found for getQuestionnaireSchedule');
      return { upcoming: [], active: [] };
    }

    console.log('📅 getQuestionnaireSchedule - Using company_id:', validCompanyId);

    const { data: questionnaires, error } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('company_id', validCompanyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questionnaire schedule:', error);
      return { upcoming: [], active: [] };
    }

    const { data: responses } = await supabase
      .from('questionnaire_responses')
      .select('questionnaire_id')
      .eq('company_id', validCompanyId);

    const responseCounts = responses?.reduce((acc, response) => {
      acc[response.questionnaire_id] = (acc[response.questionnaire_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const upcoming = (questionnaires || [])
      .filter(q => q.status === 'inactive' || !q.notification_sent)
      .map(q => ({
        id: q.id,
        title: q.title,
        scheduledDate: q.start_date || q.created_at,
        targetDepartment: q.target_department,
        status: q.status
      }));

    const active = (questionnaires || [])
      .filter(q => q.status === 'active' && q.notification_sent)
      .map(q => ({
        id: q.id,
        title: q.title,
        startDate: q.start_date || q.created_at,
        endDate: q.end_date,
        responseCount: responseCounts[q.id] || 0,
        targetDepartment: q.target_department
      }));

    return { upcoming, active };
  } catch (error) {
    console.error('Error fetching questionnaire schedule:', error);
    return { upcoming: [], active: [] };
  }
}

// NEW FUNCTIONS FOR CUSTOM QUESTIONNAIRES

export interface CustomQuestionnaireTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  questions: QuestionOption[];
}

export const questionnaireTemplates: CustomQuestionnaireTemplate[] = [
  {
    name: "Satisfação no Trabalho",
    description: "Avalia a satisfação geral dos colaboradores com seu trabalho e ambiente",
    category: "Satisfação",
    questions: [
      {
        id: 1,
        question: "Como você avalia sua satisfação geral com o trabalho?",
        type: "scale",
        scale_min: 1,
        scale_max: 10,
        scale_labels: ["1 - Muito insatisfeito", "2", "3", "4", "5", "6", "7", "8", "9", "10 - Muito satisfeito"],
        required: true
      },
      {
        id: 2,
        question: "Você se sente valorizado pela empresa?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"],
        required: true
      },
      {
        id: 3,
        question: "Como você avalia o reconhecimento que recebe pelo seu trabalho?",
        type: "scale",
        scale_min: 1,
        scale_max: 10,
        scale_labels: ["1 - Muito ruim", "2", "3", "4", "5", "6", "7", "8", "9", "10 - Excelente"],
        required: true
      },
      {
        id: 4,
        question: "Como você avalia as oportunidades de crescimento na empresa?",
        type: "scale",
        scale_min: 1,
        scale_max: 10,
        scale_labels: ["1 - Muito limitadas", "2", "3", "4", "5", "6", "7", "8", "9", "10 - Excelentes"],
        required: true
      }
    ]
  },
  {
    name: "Clima Organizacional",
    description: "Mede o clima organizacional e relacionamentos interpessoais",
    category: "Clima",
    questions: [
      {
        id: 1,
        question: "Como você avalia o clima organizacional da empresa?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Muito ruim", "Ruim", "Regular", "Bom", "Excelente"],
        required: true
      },
      {
        id: 2,
        question: "Você se sente confortável para expressar suas opiniões?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"],
        required: true
      },
      {
        id: 3,
        question: "Como é a comunicação entre as equipes?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Muito ruim", "Ruim", "Regular", "Boa", "Excelente"],
        required: true
      },
      {
        id: 4,
        question: "Você confia na liderança da empresa?",
        type: "scale",
        scale_min: 1,
        scale_max: 10,
        scale_labels: ["1 - Não confio", "2", "3", "4", "5", "6", "7", "8", "9", "10 - Confio plenamente"],
        required: true
      }
    ]
  },
  {
    name: "Saúde Mental e Estresse",
    description: "Foca especificamente em aspectos de saúde mental e gestão de estresse",
    category: "Saúde Mental",
    questions: [
      {
        id: 1,
        question: "Como você avalia seu nível atual de estresse?",
        type: "scale",
        scale_min: 1,
        scale_max: 10,
        scale_labels: ["1 - Sem estresse", "2", "3", "4", "5", "6", "7", "8", "9", "10 - Muito estressado"],
        required: true
      },
      {
        id: 2,
        question: "Como você avalia o nível de pressão no seu trabalho?",
        type: "scale",
        scale_min: 1,
        scale_max: 10,
        scale_labels: ["1 - Sem pressão", "2", "3", "4", "5", "6", "7", "8", "9", "10 - Pressão excessiva"],
        required: true
      },
      {
        id: 3,
        question: "Como você avalia o equilíbrio entre vida pessoal e trabalho?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Muito ruim", "Ruim", "Regular", "Bom", "Excelente"],
        required: true
      },
      {
        id: 4,
        question: "Como está sua qualidade do sono?",
        type: "scale",
        scale_min: 1,
        scale_max: 5,
        scale_labels: ["Muito ruim", "Ruim", "Regular", "Boa", "Excelente"],
        required: true
      }
    ]
  }
];

export async function getCustomQuestionnaireTemplates(): Promise<CustomQuestionnaireTemplate[]> {
  return questionnaireTemplates;
}

export async function createCustomQuestionnaire(
  companyId: string,
  template: CustomQuestionnaireTemplate,
  customTitle?: string,
  customDescription?: string,
  targetDepartment?: string,
  isAnonymous?: boolean,
  startDate?: string,
  endDate?: string
): Promise<Questionnaire | null> {
  try {
    console.log('=== DEBUG: Creating CUSTOM questionnaire ===');
    console.log('Company ID:', companyId);
    console.log('Template:', template.name, '(', template.category, ')');
    console.log('Custom Title:', customTitle);
    console.log('Custom Description:', customDescription);
    console.log('Target Department:', targetDepartment);
    console.log('Is Anonymous:', isAnonymous);

    const questionnaire: Omit<Questionnaire, 'id' | 'created_at' | 'updated_at'> = {
      company_id: companyId,
      title: customTitle || `${template.name} - ${new Date().toLocaleDateString('pt-BR')}`,
      description: customDescription || template.description,
      questions: template.questions,
      target_department: targetDepartment || null,
      status: 'inactive',
      created_by: companyId,
      start_date: startDate || null,
      end_date: endDate || null,
      notification_sent: false,
      is_anonymous: isAnonymous || false,
    };

    console.log('Built questionnaire object:', {
      ...questionnaire,
      questions: `[${questionnaire.questions.length} questions from template]`
    });

    const result = await createQuestionnaire(questionnaire);

    if (result) {
      console.log('✅ Custom questionnaire created successfully:', result.id);
    } else {
      console.error('❌ Failed to create custom questionnaire');
    }

    return result;
  } catch (error) {
    console.error('=== ERROR in createCustomQuestionnaire ===');
    console.error('Error creating custom questionnaire:', error);
    return null;
  }
}

export async function getAllCompanyQuestionnaires(companyId?: string): Promise<Questionnaire[]> {
  try {
    // Get authenticated user ID (questionnaires.company_id references auth.users.id)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('No authenticated user found for getAllCompanyQuestionnaires');
      return [];
    }

    console.log('📋 getAllCompanyQuestionnaires - Using user.id as company_id:', user.id);

    const { data, error } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('company_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company questionnaires:', error);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} company questionnaires`);

    return (data || []).map(q => ({
      ...q,
      questions: Array.isArray(q.questions) ? q.questions as unknown as QuestionOption[] : [],
      is_anonymous: (q as any).is_anonymous ?? false,
    }));
  } catch (error) {
    console.error('Error fetching company questionnaires:', error);
    return [];
  }
}

export async function updateQuestionnaireStatus(
  questionnaireId: string,
  status: 'active' | 'inactive' | 'completed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('questionnaires')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionnaireId);

    if (error) {
      console.error('Error updating questionnaire status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating questionnaire status:', error);
    return false;
  }
}

export async function updateQuestionnaire(
  questionnaireId: string,
  patch: Partial<Pick<Questionnaire, 'title' | 'description' | 'questions' | 'target_department' | 'status' | 'start_date' | 'end_date' | 'is_anonymous'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('questionnaires')
      .update({
        ...patch,
        questions: patch.questions ? JSON.parse(JSON.stringify(patch.questions)) : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionnaireId);

    if (error) {
      console.error('Error updating questionnaire:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error updating questionnaire:', error);
    return false;
  }
}

export async function getCompanyDepartments(companyId: string): Promise<{ id: string; name: string; }[]> {
  try {
    // Get the real company_id from user_profiles (company_departments uses companies.id)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('No authenticated user found for getCompanyDepartments');
      return [];
    }

    // Get company_id from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      console.error('No company_id found in user_profiles for departments');
      return [];
    }

    console.log('🏢 getCompanyDepartments - Using company_id from user_profiles:', profile.company_id);

    const { data, error } = await supabase
      .from('company_departments')
      .select('id, name')
      .eq('company_id', profile.company_id)
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching company departments:', error);
      return [];
    }

    console.log('🏢 Found', data?.length || 0, 'departments');
    return data || [];
  } catch (error) {
    console.error('Error fetching company departments:', error);
    return [];
  }
}

// NEW FUNCTION: Get detailed responses for a specific questionnaire
export async function getQuestionnaireDetailedResponses(questionnaireId: string): Promise<{
  totalResponses: number;
  averageScore: number;
  responsesByQuestion: Array<{
    questionId: number;
    questionText: string;
    responses: number[];
    averageScore: number;
    medianScore: number;
    modeScore: number;
    standardDeviation: number;
    scoreDistribution: { [key: number]: number };
  }>;
  departmentBreakdown: Array<{
    department: string;
    totalResponses: number;
    averageScore: number;
  }>;
  responseTimeline: Array<{
    date: string;
    responses: number;
  }>;
}> {
  try {
    // Get the correct company_id using AuthService
    const validCompanyId = await AuthService.getValidatedCompanyId();
    if (!validCompanyId) {
      console.error('No valid company_id found for getQuestionnaireDetailedResponses');
      return {
        totalResponses: 0,
        averageScore: 0,
        responsesByQuestion: [],
        departmentBreakdown: [],
        responseTimeline: []
      };
    }

    console.log('📊 getQuestionnaireDetailedResponses - Questionnaire ID:', questionnaireId);

    // Fetch all responses for this questionnaire
    const { data: responses, error } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('company_id', validCompanyId)
      .eq('questionnaire_id', questionnaireId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching detailed responses:', error);
      return {
        totalResponses: 0,
        averageScore: 0,
        responsesByQuestion: [],
        departmentBreakdown: [],
        responseTimeline: []
      };
    }

    if (!responses || responses.length === 0) {
      console.log('No responses found for questionnaire:', questionnaireId);
      return {
        totalResponses: 0,
        averageScore: 0,
        responsesByQuestion: [],
        departmentBreakdown: [],
        responseTimeline: []
      };
    }

    console.log(`✅ Found ${responses.length} responses for questionnaire`);

    // Process responses by question
    const questionMap = new Map<number, {
      questionText: string;
      responses: number[];
    }>();

    // Process department breakdown
    const departmentMap = new Map<string, { total: number; scores: number[] }>();

    // Process timeline
    const timelineMap = new Map<string, number>();

    let totalScore = 0;
    let totalResponses = 0;

    responses.forEach(response => {
      // Process each answer in the response
      if (Array.isArray(response.responses)) {
        response.responses.forEach((answer: any) => {
          const questionId = answer.question_id;
          const questionText = answer.question_text;
          const answerValue = Number(answer.answer);

          if (!isNaN(answerValue)) {
            // Add to question map
            if (!questionMap.has(questionId)) {
              questionMap.set(questionId, { questionText, responses: [] });
            }
            questionMap.get(questionId)!.responses.push(answerValue);

            // Add to total score
            totalScore += answerValue;
            totalResponses++;
          }
        });
      }

      // Process department
      if (response.department) {
        if (!departmentMap.has(response.department)) {
          departmentMap.set(response.department, { total: 0, scores: [] });
        }
        departmentMap.get(response.department)!.total++;

        // Calculate average score for this response
        if (Array.isArray(response.responses)) {
          const responseScore = response.responses.reduce((sum: number, ans: any) => {
            return sum + Number(ans.answer || 0);
          }, 0) / response.responses.length;
          departmentMap.get(response.department)!.scores.push(responseScore);
        }
      }

      // Process timeline
      const date = new Date(response.created_at).toLocaleDateString('pt-BR');
      timelineMap.set(date, (timelineMap.get(date) || 0) + 1);
    });

    // Calculate statistics for each question
    const responsesByQuestion = Array.from(questionMap.entries()).map(([questionId, data]) => {
      const responses = data.responses;
      const averageScore = responses.reduce((a, b) => a + b, 0) / responses.length;
      const sortedResponses = [...responses].sort((a, b) => a - b);
      const medianScore = sortedResponses[Math.floor(responses.length / 2)];

      // Calculate mode
      const scoreCounts: { [key: number]: number } = {};
      responses.forEach(score => {
        scoreCounts[score] = (scoreCounts[score] || 0) + 1;
      });
      let modeScore = 0;
      let maxCount = 0;
      Object.entries(scoreCounts).forEach(([score, count]) => {
        if (count > maxCount) {
          maxCount = count;
          modeScore = Number(score);
        }
      });

      // Calculate standard deviation
      const variance = responses.reduce((sum, score) =>
        sum + Math.pow(score - averageScore, 2), 0
      ) / responses.length;
      const standardDeviation = Math.sqrt(variance);

      // Calculate score distribution
      const scoreDistribution: { [key: number]: number } = {};
      responses.forEach(score => {
        scoreDistribution[score] = (scoreDistribution[score] || 0) + 1;
      });

      return {
        questionId,
        questionText: data.questionText,
        responses,
        averageScore: Number(averageScore.toFixed(2)),
        medianScore,
        modeScore: Number(modeScore),
        standardDeviation: Number(standardDeviation.toFixed(2)),
        scoreDistribution
      };
    });

    // Calculate department breakdown
    const departmentBreakdown = Array.from(departmentMap.entries()).map(([department, data]) => ({
      department,
      totalResponses: data.total,
      averageScore: Number((data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(2))
    }));

    // Calculate response timeline
    const responseTimeline = Array.from(timelineMap.entries())
      .map(([date, count]) => ({ date, responses: count }))
      .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());

    const overallAverageScore = totalResponses > 0 ? Number((totalScore / totalResponses).toFixed(2)) : 0;

    return {
      totalResponses: responses.length,
      averageScore: overallAverageScore,
      responsesByQuestion,
      departmentBreakdown,
      responseTimeline
    };

  } catch (error) {
    console.error('Error in getQuestionnaireDetailedResponses:', error);
    return {
      totalResponses: 0,
      averageScore: 0,
      responsesByQuestion: [],
      departmentBreakdown: [],
      responseTimeline: []
    };
  }
}

export async function deleteQuestionnaire(questionnaireId: string): Promise<boolean> {
  try {
    // First, delete related responses
    await supabase
      .from('questionnaire_responses')
      .delete()
      .eq('questionnaire_id', questionnaireId);

    // Then delete the questionnaire
    const { error } = await supabase
      .from('questionnaires')
      .delete()
      .eq('id', questionnaireId);

    if (error) {
      console.error('Error deleting questionnaire:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting questionnaire:', error);
    return false;
  }
}
