import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Buscar pacientes vinculados a este psicólogo usando o cliente Supabase
      const { data: patients, error: patientsError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('psychologist_id', psychologistId);
      
      if (patientsError) {
        throw new Error(`Erro na requisição de pacientes: ${patientsError.message}`);
      }
      
      // Se não houver pacientes, retornar 0 sessões
      if (!Array.isArray(patients) || patients.length === 0) {
        setSessionsCount(0);
        setLoading(false);
        return;
      }
      
      // Extrair os IDs dos pacientes e filtrar valores nulos/indefinidos
      // Convertendo para string para compatibilidade com o método .in() do Supabase
      const patientIds = patients
        .map(patient => String(patient.user_id))
        .filter(Boolean); // Remove valores nulos/undefined/vazios
      
      console.log('IDs dos pacientes vinculados ao psicólogo:', patientIds);
      
      // Se não houver IDs válidos, retornar 0 sessões
      if (patientIds.length === 0) {
        setSessionsCount(0);
        setLoading(false);
        return;
      }
      
      // Buscar todas as sessões para esses pacientes usando o cliente Supabase
      console.log('Buscando sessões para os pacientes com IDs:', patientIds);
      
      // Usar o cliente Supabase para buscar as sessões
      const { data: sessions, error: sessionsError } = await supabase
        .from('call_sessions')
        .select('id, started_at, user_id')
        .in('user_id', patientIds);
      
      if (sessionsError) {
        throw new Error(`Erro na requisição de sessões: ${sessionsError.message}`);
      }
      
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
