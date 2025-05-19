
import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const PatientStatsCard: React.FC = () => {
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [activePatients, setActivePatients] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPatientStats = async () => {
      try {
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) return;
        
        // Converter para número
        const psychologistIdNumber = parseInt(psychologistId, 10);
        
        // Buscar todos os pacientes vinculados
        const { data: allPatients, error: allError } = await supabase
          .from('user_psychologist_associations')
          .select('id, status')
          .eq('id_psicologo', psychologistIdNumber);
        
        if (allError) throw allError;
        
        // Buscar pacientes ativos (com status 'approved' ou 'active')
        const activeOnes = allPatients?.filter(p => 
          p.status === 'approved' || p.status === 'active'
        ) || [];
        
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

  return (
    <Card className="w-full max-w-xs">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Pacientes</p>
            {loading ? (
              <div className="h-9 w-12 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-4xl font-medium mt-1">{totalPatients}</h3>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {loading ? (
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                `${activePatients} pacientes ativos`
              )}
            </p>
          </div>
          <div className="bg-purple-100 p-2 rounded-md">
            <Users size={24} className="text-portal-purple" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientStatsCard;
