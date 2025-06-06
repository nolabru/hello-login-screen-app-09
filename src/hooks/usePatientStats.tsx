import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PatientStats {
  totalPatients: number;
  activePatients: number;
  loading: boolean;
}

const usePatientStats = (): PatientStats => {
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [activePatients, setActivePatients] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Função para buscar os dados dos pacientes
  const fetchPatientStats = async (psychologistId: string) => {
    try {
      // Usar o ID diretamente como string UUID
      // Não converter para número, pois é um UUID
      
      // Usar uma abordagem mais simples com fetch nativo
      // para evitar problemas de tipagem do Supabase
      const response = await fetch(
        `https://ygafwrebafehwaomibmm.supabase.co/rest/v1/user_profiles?psychologist_id=eq.${psychologistId}&select=id`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYWZ3cmViYWZlaHdhb21pYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjQsImV4cCI6MjA2MjM3MDI2NH0.tD90iyVXxrt1HJlzz_LV-SLY5usqC4cwmLEXe9hWEvo`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Definir o número total de pacientes
      const totalCount = Array.isArray(data) ? data.length : 0;
      setTotalPatients(totalCount);
      setActivePatients(totalCount); // Considerando todos como ativos por enquanto
    } catch (error) {
      console.error('Erro ao buscar estatísticas de pacientes:', error);
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
    fetchPatientStats(psychologistId);
    
    // Configurar um intervalo para atualizar os dados a cada 30 segundos
    // Isso simula atualizações em tempo real sem usar as assinaturas do Supabase
    const intervalId = setInterval(() => {
      fetchPatientStats(psychologistId);
    }, 30000);
    
    // Limpar intervalo quando o componente for desmontado
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return { totalPatients, activePatients, loading };
};

export default usePatientStats;
