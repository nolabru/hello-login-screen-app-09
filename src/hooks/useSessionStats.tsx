import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SessionStats {
  sessionsCount: number;
  loading: boolean;
}

const useSessionStats = (): SessionStats => {
  const [sessionsCount, setSessionsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);

  // Função para buscar os dados das sessões
  const fetchSessionStats = async (psychologistId: string) => {
    try {
      // Comentando o filtro de data temporariamente para verificar se é o problema
      // const sevenDaysAgo = new Date();
      // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      // const formattedDate = sevenDaysAgo.toISOString();
      
      // Buscar pacientes vinculados a este psicólogo
      const patientsResponse = await fetch(
        `https://ygafwrebafehwaomibmm.supabase.co/rest/v1/user_profiles?psychologist_id=eq.${psychologistId}&select=user_id`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo`,
          },
        }
      );
      
      if (!patientsResponse.ok) {
        throw new Error(`Erro na requisição de pacientes: ${patientsResponse.status} - ${patientsResponse.statusText}`);
      }
      
      const patients = await patientsResponse.json();
      
      // Se não houver pacientes, retornar 0 sessões
      if (!Array.isArray(patients) || patients.length === 0) {
        setSessionsCount(0);
        setLoading(false);
        return;
      }
      
      // Extrair os IDs dos pacientes e filtrar valores nulos/indefinidos
      const patientUserIds = patients
        .map(patient => patient.user_id)
        .filter(Boolean); // Remove valores nulos/undefined/vazios
      
      console.log('IDs dos pacientes vinculados ao psicólogo:', patientUserIds);
      
      // Se não houver IDs válidos, retornar 0 sessões
      if (patientUserIds.length === 0) {
        setSessionsCount(0);
        setLoading(false);
        return;
      }
      
      // Buscar todas as sessões para esses pacientes (sem filtro de data)
      // Tentar uma abordagem diferente para a formatação da cláusula in
      const formattedUserIds = patientUserIds.join(',');
      const sessionsUrl = `https://ygafwrebafehwaomibmm.supabase.co/rest/v1/call_sessions?user_id=in.(${formattedUserIds})&select=id,started_at,user_id`;
      console.log('URL da requisição de sessões (sem filtro de data):', sessionsUrl);
      
      // Adicionar consulta SQL equivalente para verificação manual
      console.log('Consulta SQL equivalente:');
      console.log(`SELECT id, started_at, user_id FROM call_sessions WHERE user_id IN (${formattedUserIds});`);
      
      const sessionsResponse = await fetch(
        sessionsUrl,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo`,
          },
        }
      );
      
      if (!sessionsResponse.ok) {
        throw new Error(`Erro na requisição de sessões: ${sessionsResponse.status}`);
      }
      
      const sessions = await sessionsResponse.json();
      
      console.log('Sessões encontradas:', sessions);
      
      // Contar o número total de sessões
      const totalSessions = Array.isArray(sessions) ? sessions.length : 0;
      
      setSessionsCount(totalSessions);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de sessões:', error);
      // Em caso de erro, definir como 0 para não quebrar a interface
      setSessionsCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Obter o ID do psicólogo logado do localStorage
    const psychologistId = localStorage.getItem('psychologistId');
    
    if (!psychologistId) {
      setLoading(false);
      return;
    }
    
    // Buscar dados iniciais
    fetchSessionStats(psychologistId);
    
    // Importar o cliente Supabase para configurar a assinatura em tempo real
    import('@/integrations/supabase/client').then(({ supabase }) => {
      console.log('Configurando assinatura em tempo real para a tabela call_sessions');
      
      // Configurar assinatura em tempo real para a tabela call_sessions
      const channel = supabase
        .channel('call_sessions_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'call_sessions'
          },
          (payload) => {
            console.log('Mudança detectada na tabela call_sessions:', payload);
            // Atualizar os dados quando houver mudanças
            fetchSessionStats(psychologistId);
          }
        )
        .subscribe();
      
      setSubscription(channel);
      console.log('Assinatura em tempo real configurada com sucesso');
    }).catch(error => {
      console.error('Erro ao configurar assinatura em tempo real:', error);
    });
    
    // Limpar assinatura quando o componente for desmontado
    return () => {
      if (subscription) {
        console.log('Cancelando assinatura em tempo real');
        subscription.unsubscribe();
      }
    };
  }, []);

  return { sessionsCount, loading };
};

export default useSessionStats;
