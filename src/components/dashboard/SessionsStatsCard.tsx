
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const SessionsStatsCard: React.FC = () => {
  return (
    <Card className="w-full max-w-xs">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Sessões</p>
            <h3 className="text-4xl font-medium mt-1">12</h3>
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
