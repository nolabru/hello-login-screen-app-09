import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SessionInsight {
  id: number;
  session_id: string;
  created_at: string;
  topics: string[];
  ai_advice: string;
  long_summary: string;
  // Novos campos da tabela call_sessions
  mood?: string;
  summary?: string;
  started_at?: string;
}

export function usePatientInsights(userId: string | null) {
  const [insights, setInsights] = useState<SessionInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatientInsights() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Buscando insights para o usuário:', userId);
        
        // Buscar sessões do usuário usando o cliente Supabase
        const { data: sessions, error: sessionsError } = await supabase
          .from('call_sessions')
          .select('id, mood, summary, started_at')
          .eq('user_id', userId);
        
        if (sessionsError) {
          throw new Error(`Erro ao buscar sessões: ${sessionsError.message}`);
        }
        console.log('Sessões encontradas:', sessions);
        
        if (!sessions || sessions.length === 0) {
          console.log('Nenhuma sessão encontrada para o usuário');
          setInsights([]);
          setLoading(false);
          return;
        }
        
        // Extrair IDs das sessões
        const sessionIds = sessions.map((session: any) => session.id);
        console.log('IDs das sessões:', sessionIds);
        
        // Buscar insights das sessões usando o cliente Supabase
        const { data: insightsData, error: insightsError } = await supabase
          .from('session_insights')
          .select('*')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: false });
        
        if (insightsError) {
          throw new Error(`Erro ao buscar insights: ${insightsError.message}`);
        }
        console.log('Insights encontrados:', insightsData);
        
        // Criar um mapa de sessões para fácil acesso
        const sessionsMap = sessions.reduce((map: Record<string, any>, session: any) => {
          map[session.id] = session;
          return map;
        }, {});
        
        // Combinar os dados de insights com os dados das sessões
        const combinedInsights = insightsData.map((insight: any) => {
          // Garantir que topics seja um array, mesmo se vier como string JSON
          let topics = insight.topics;
          if (typeof topics === 'string') {
            try {
              topics = JSON.parse(topics);
            } catch (e) {
              console.error('Erro ao fazer parse dos tópicos:', e);
              topics = [];
            }
          }
          
          return {
            ...insight,
            topics: Array.isArray(topics) ? topics : [],
            mood: sessionsMap[insight.session_id]?.mood,
            summary: sessionsMap[insight.session_id]?.summary,
            started_at: sessionsMap[insight.session_id]?.started_at
          };
        });
        
        console.log('Insights combinados:', combinedInsights);
        
        setInsights(combinedInsights || []);
      } catch (err: any) {
        console.error('Erro ao buscar insights do paciente:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPatientInsights();
  }, [userId]);
  
  return { insights, loading, error };
}
