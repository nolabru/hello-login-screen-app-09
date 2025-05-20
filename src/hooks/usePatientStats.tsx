
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

  useEffect(() => {
    const fetchPatientStats = async () => {
      try {
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) return;
        
        // Convert to number
        const psychologistIdNumber = parseInt(psychologistId, 10);
        
        // Fetch all associated patients EXCLUDING pending status
        const { data: allPatients, error: allError } = await supabase
          .from('user_psychologist_associations')
          .select('id_relacao, status')
          .eq('id_psicologo', psychologistIdNumber)
          .neq('status', 'pending'); // Exclude pending status
        
        if (allError) throw allError;
        
        // Filter active patients (with status 'active')
        const activeOnes = allPatients?.filter(p => p.status === 'active') || [];
        
        setTotalPatients(allPatients?.length || 0);
        setActivePatients(activeOnes.length);
      } catch (error) {
        console.error('Erro ao buscar estatísticas de pacientes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientStats();
  }, []);

  return { totalPatients, activePatients, loading };
};

export default usePatientStats;
