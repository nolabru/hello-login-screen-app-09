
import React from 'react';
import { SmilePlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import useSessionStats from '@/hooks/useSessionStats';

const SessionsStatsCard: React.FC = () => {
  const { sessionsCount, loading } = useSessionStats();

  return (
    <Card className="w-full max-w-xs">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Interações com a AIA</p>
            {loading ? (
              <div className="h-9 w-12 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-4xl font-medium mt-1">{sessionsCount}</div>
            )}
            <p className="text-sm text-gray-500 mt-1">Últimos 7 dias</p>
          </div>
          <div className="bg-purple-100 p-2 rounded-md">
            <SmilePlus size={24} className="text-portal-purple" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionsStatsCard;
