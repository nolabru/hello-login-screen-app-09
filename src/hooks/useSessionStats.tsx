
import { useEffect, useState } from 'react';

interface SessionStats {
  sessionsCount: number;
  loading: boolean;
}

const useSessionStats = (): SessionStats => {
  const [sessionsCount, setSessionsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simular carregamento para manter a experiência do usuário
    const timer = setTimeout(() => {
      // A funcionalidade de associação entre psicólogos e pacientes foi removida
      // Retornando valores zerados
      setSessionsCount(0);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return { sessionsCount, loading };
};

export default useSessionStats;
