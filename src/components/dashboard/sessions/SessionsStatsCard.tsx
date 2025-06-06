import React from 'react';
import { SmilePlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import useSessionStats from '@/hooks/useSessionStats';
import { Skeleton } from '@/components/ui/skeleton';
const SessionsStatsCard: React.FC = () => {
  const {
    sessionsCount,
    loading
  } = useSessionStats();
  return <Card className="w-full max-w-xs hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Interações com a AIA</p>
            {loading ? <Skeleton className="h-10 w-16" /> : <div className="text-3xl font-semibold text-gray-800">{sessionsCount}</div>}
            <p className="text-xs text-gray-500">Último Mês</p>
          </div>
          <div className="bg-portal-purple/10 p-3 rounded-full">
            <SmilePlus size={28} className="text-portal-purple" />
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default SessionsStatsCard;