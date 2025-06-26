import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatTopicsList } from '@/lib/formatUtils';

interface PatientGeneralSummaryData {
  totalConversations: number;
  predominantMood: string;
  daysActive: number;
  topTopics: string[];
  moodDistribution: Record<string, number>;
  generalSummary: string;
  loading: boolean;
  error: string | null;
}

export const usePatientGeneralSummary = (userId: string): PatientGeneralSummaryData => {
  const [data, setData] = useState<PatientGeneralSummaryData>({
    totalConversations: 0,
    predominantMood: '',
    daysActive: 0,
    topTopics: [],
    moodDistribution: {},
    generalSummary: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!userId) return;

    const fetchPatientSummary = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // 1. Buscar todas as sessões do usuário
        const { data: sessions, error: sessionsError } = await supabase
          .from('call_sessions')
          .select('id, mood, started_at')
          .eq('user_id', userId)
          .order('started_at', { ascending: true });

        if (sessionsError) {
          throw new Error(`Erro ao buscar sessões: ${sessionsError.message}`);
        }

        if (!sessions || sessions.length === 0) {
          setData(prev => ({
            ...prev,
            loading: false,
            generalSummary: 'Nenhuma sessão encontrada para este usuário.'
          }));
          return;
        }

        // 2. Buscar insights das sessões
        const sessionIds = sessions.map(session => session.id);
        const { data: insights, error: insightsError } = await supabase
          .from('session_insights')
          .select('topics, long_summary')
          .in('session_id', sessionIds);

        if (insightsError) {
          console.warn('Erro ao buscar insights:', insightsError);
        }

        // 3. Calcular total de conversas
        const totalConversations = insights?.length || 0;

        // 4. Calcular humor predominante e distribuição
        const moodCounts: Record<string, number> = {};
        const validMoods = sessions.filter(s => s.mood).map(s => s.mood!.toLowerCase());
        
        validMoods.forEach(mood => {
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });

        const totalMoods = validMoods.length;
        const moodDistribution: Record<string, number> = {};
        
        Object.entries(moodCounts).forEach(([mood, count]) => {
          moodDistribution[mood] = Math.round((count / totalMoods) * 100);
        });

        const predominantMood = Object.entries(moodCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutro';

        // 5. Calcular dias ativos
        const firstSession = new Date(sessions[0].started_at);
        const lastSession = new Date(sessions[sessions.length - 1].started_at);
        const daysActive = Math.ceil((lastSession.getTime() - firstSession.getTime()) / (1000 * 60 * 60 * 24)) || 1;

        // 6. Extrair temas principais
        const topicCounts: Record<string, number> = {};
        
        insights?.forEach(insight => {
          if (insight.topics && Array.isArray(insight.topics)) {
            insight.topics.forEach(topic => {
              if (typeof topic === 'string') {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
              }
            });
          }
        });

        const rawTopTopics = Object.entries(topicCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([topic]) => topic);

        // Formatar temas principais (remover underscores e capitalizar)
        const topTopics = formatTopicsList(rawTopTopics);

        // 7. Gerar resumo geral com texto hardcoded
        const sessionsPerDay = (totalConversations / daysActive).toFixed(1);
        const topTopicsText = topTopics.length > 0 ? topTopics.join(', ') : 'diversos temas';
        
        const generalSummary = `Baseado em ${totalConversations} sessões ao longo de ${daysActive} dias, este usuário tem demonstrado um padrão de humor predominantemente ${predominantMood}. Durante suas interações, abordou frequentemente temas relacionados a ${topTopicsText}. Com uma média de ${sessionsPerDay} sessões por dia, demonstra engajamento consistente com o sistema e abertura para compartilhar experiências. O padrão de interação sugere uma pessoa em busca de autoconhecimento e melhoria de sua qualidade de vida, mostrando receptividade às orientações e capacidade de reflexão sobre suas experiências.`;

        setData({
          totalConversations,
          predominantMood,
          daysActive,
          topTopics,
          moodDistribution,
          generalSummary,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Erro ao buscar resumo geral do paciente:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }));
      }
    };

    fetchPatientSummary();
  }, [userId]);

  return data;
};
