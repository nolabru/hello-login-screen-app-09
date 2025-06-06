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
        
        // Obter a URL e a chave do Supabase do cliente
        const supabaseUrl = "https://ygafwrebafehwaomibmm.supabase.co";
        const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo";
        
        // Buscar sessões do usuário com os campos adicionais usando fetch
        const sessionsResponse = await fetch(
          `${supabaseUrl}/rest/v1/call_sessions?user_id=eq.${userId}&select=id,mood,summary,started_at`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!sessionsResponse.ok) {
          throw new Error(`Erro ao buscar sessões: ${sessionsResponse.statusText}`);
        }
        
        const sessions = await sessionsResponse.json();
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
        
        // Buscar insights das sessões usando fetch com operador IN
        // Construir a URL com parâmetros para a cláusula IN
        const insightsUrl = `${supabaseUrl}/rest/v1/session_insights?session_id=in.(${sessionIds.join(',')})&order=created_at.desc`;
        console.log('URL da consulta de insights:', insightsUrl);
        
        const insightsResponse = await fetch(
          insightsUrl,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!insightsResponse.ok) {
          throw new Error(`Erro ao buscar insights: ${insightsResponse.statusText}`);
        }
        
        const insightsData = await insightsResponse.json();
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
