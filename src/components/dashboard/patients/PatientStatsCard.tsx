
import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import usePatientStats from '@/hooks/usePatientStats';

const PatientStatsCard: React.FC = () => {
  const { totalPatients, loading } = usePatientStats();

  return (
    <Card className="w-full max-w-xs">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Pacientes</p>
            {loading ? (
              <div className="h-9 w-12 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-4xl font-medium mt-1">{totalPatients}</div>
            )}
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
