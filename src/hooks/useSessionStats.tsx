
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SessionStats {
  sessionsCount: number;
  loading: boolean;
}

const useSessionStats = (): SessionStats => {
  const [sessionsCount, setSessionsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSessionsStats = async () => {
      try {
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) return;
        
        const psychologistIdNumber = parseInt(psychologistId, 10);
        
        // Fetch active sessions (using associations as proxy for sessions)
        const { count, error } = await supabase
          .from('user_psychologist_associations')
          .select('id_relacao', { count: 'exact' })
          .eq('id_psicologo', psychologistIdNumber)
          .eq('status', 'active');
        
        if (error) throw error;
        
        setSessionsCount(count || 0);
      } catch (error) {
        console.error('Erro ao buscar estatísticas de sessões:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionsStats();
  }, []);

  return { sessionsCount, loading };
};

export default useSessionStats;
