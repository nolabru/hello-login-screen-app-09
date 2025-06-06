import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SessionInsight {
  id: number;
  session_id: string;
  created_at: string;
  topics: string[];
  ai_advice: string;
  long_summary: string;
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
        
        // Usar fetch diretamente para evitar problemas de tipagem com o Supabase
        const fetchSessions = async () => {
          // Obter a URL e a chave do Supabase do cliente
          const supabaseUrl = "https://ygafwrebafehwaomibmm.supabase.co";
          const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo";
          
          // Buscar sessões do usuário
          const sessionsResponse = await fetch(
            `${supabaseUrl}/rest/v1/call_sessions?user_id=eq.${userId}&select=id`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (!sessionsResponse.ok) {
            throw new Error('Erro ao buscar sessões');
          }
          
          return await sessionsResponse.json();
        };
        
        const sessions = await fetchSessions();
        
        if (!sessions || sessions.length === 0) {
          setInsights([]);
          setLoading(false);
          return;
        }
        
        // Extrair IDs das sessões
        const sessionIds = sessions.map((session: any) => session.id);
        
        // Buscar insights das sessões
        const fetchInsights = async () => {
          const supabaseUrl = "https://ygafwrebafehwaomibmm.supabase.co";
          const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo";
          
          // Construir a consulta para a cláusula IN
          const sessionIdsQuery = sessionIds.map(id => `session_id=eq.${id}`).join('&');
          
          const insightsResponse = await fetch(
            `${supabaseUrl}/rest/v1/session_insights?${sessionIdsQuery}&order=created_at.desc`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (!insightsResponse.ok) {
            throw new Error('Erro ao buscar insights');
          }
          
          return await insightsResponse.json();
        };
        
        const insightsData = await fetchInsights();
        setInsights(insightsData || []);
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
