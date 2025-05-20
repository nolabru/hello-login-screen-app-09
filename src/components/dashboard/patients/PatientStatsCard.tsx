
import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import usePatientStats from '@/hooks/usePatientStats';
import { Skeleton } from '@/components/ui/skeleton';

const PatientStatsCard: React.FC = () => {
  const { activePatients, loading, totalPatients } = usePatientStats();

  return (
    <Card className="w-full max-w-xs hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
            {loading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-3xl font-semibold text-gray-800">{activePatients}</div>
            )}
            <p className="text-xs text-gray-500">
              Total de pacientes ativos
            </p>
          </div>
          <div className="bg-portal-purple/10 p-3 rounded-full">
            <Users size={28} className="text-portal-purple" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientStatsCard;
