import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatTopicsList } from '@/lib/formatUtils';

interface PatientPreConsultationData {
  conversationCount: number;
  predominantMood: string;
  topTopics: string[];
  moodDistribution: Record<string, number>;
  consultationSummary: string;
  loading: boolean;
  error: string | null;
}

export const usePatientPreConsultation = (userId: string): PatientPreConsultationData => {
  const [data, setData] = useState<PatientPreConsultationData>({
    conversationCount: 0,
    predominantMood: '',
    topTopics: [],
    moodDistribution: {},
    consultationSummary: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!userId) return;

    const fetchPreConsultationData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Buscar sessões recentes (última semana)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: recentSessions, error: sessionsError } = await supabase
          .from('call_sessions')
          .select('id, mood, started_at')
          .eq('user_id', userId)
          .gte('started_at', oneWeekAgo.toISOString())
          .order('started_at', { ascending: false });

        if (sessionsError) {
          throw new Error(`Erro ao buscar sessões recentes: ${sessionsError.message}`);
        }

        if (!recentSessions || recentSessions.length === 0) {
          setData(prev => ({
            ...prev,
            loading: false,
            consultationSummary: 'Nenhuma sessão recente encontrada para este usuário.'
          }));
          return;
        }

        // Buscar insights das sessões recentes
        const sessionIds = recentSessions.map(session => session.id);
        const { data: insights, error: insightsError } = await supabase
          .from('session_insights')
          .select('topics, long_summary, ai_advice')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: false });

        if (insightsError) {
          console.warn('Erro ao buscar insights recentes:', insightsError);
        }

        // Calcular total de conversas recentes
        const conversationCount = insights?.length || 0;

        // Calcular humor predominante e distribuição (última semana)
        const moodCounts: Record<string, number> = {};
        const validMoods = recentSessions.filter(s => s.mood).map(s => s.mood!.toLowerCase());
        
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

        // Extrair temas principais das sessões recentes
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
          .slice(0, 3)
          .map(([topic]) => topic);

        // Formatar temas principais (remover underscores e capitalizar)
        const topTopics = formatTopicsList(rawTopTopics);

        // Gerar resumo para consulta com texto hardcoded
        const topTopicsText = topTopics.length > 0 ? topTopics.join(', ') : 'diversos temas';
        
        const consultationSummary = conversationCount > 0 
          ? `Para a próxima consulta, é importante notar que nas últimas ${conversationCount} interações, o usuário tem demonstrado predominantemente sentimentos de ${predominantMood}. Os temas mais abordados recentemente incluem questões relacionadas a ${topTopicsText}. Observa-se um padrão de engajamento consistente, com abertura para compartilhar experiências e buscar orientações. Recomenda-se abordar estratégias de enfrentamento e técnicas de manejo de estresse na próxima sessão, focando nos temas identificados como centrais em sua experiência atual.`
          : 'Dados insuficientes das sessões recentes para gerar resumo de pré-consulta.';

        setData({
          conversationCount,
          predominantMood,
          topTopics,
          moodDistribution,
          consultationSummary,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Erro ao buscar dados de pré-consulta:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }));
      }
    };

    fetchPreConsultationData();
  }, [userId]);

  return data;
};
