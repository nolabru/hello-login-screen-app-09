
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const SessionsStatsCard: React.FC = () => {
  const [sessionsCount, setSessionsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSessionsStats = async () => {
      try {
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) return;
        
        const psychologistIdNumber = parseInt(psychologistId, 10);
        
        // Buscar sessões ativas dos últimos 7 dias
        // Aqui estamos usando as associações como proxy para sessões
        // Em uma implementação completa, você teria uma tabela de sessões
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

  return (
    <Card className="w-full max-w-xs">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Sessões</p>
            {loading ? (
              <div className="h-9 w-12 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-4xl font-medium mt-1">{sessionsCount}</div>
            )}
            <p className="text-sm text-gray-500 mt-1">Próximos 7 dias</p>
          </div>
          <div className="bg-purple-100 p-2 rounded-md">
            <Calendar size={24} className="text-portal-purple" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionsStatsCard;
