
import { useEffect, useState } from 'react';

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
    // Simular carregamento para manter a experiência do usuário
    const timer = setTimeout(() => {
      // A funcionalidade de associação entre psicólogos e pacientes foi removida
      // Retornando valores zerados
      setTotalPatients(0);
      setActivePatients(0);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return { totalPatients, activePatients, loading };
};

export default usePatientStats;
