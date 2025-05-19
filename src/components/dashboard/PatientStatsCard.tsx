
import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PatientStatsCard: React.FC = () => {
  return (
    <Card className="w-full max-w-xs">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Pacientes</p>
            <h3 className="text-4xl font-bold mt-1">0</h3>
            <p className="text-sm text-gray-500 mt-1">Pacientes ativos</p>
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
