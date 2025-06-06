import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePatientDetails(patientId: string | number) {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatientDetails() {
      try {
        setLoading(true);
        
        // Buscar todos os dados do paciente usando match para ser mais flexível com os tipos
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .match({ id: patientId })
          .single();
          
        if (error) throw error;
        
        setPatient(data);
      } catch (err: any) {
        console.error('Erro ao buscar detalhes do paciente:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);
  
  return { patient, loading, error };
}
