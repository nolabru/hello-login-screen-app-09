
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const recentActivity = [
  {
    id: 1,
    name: 'Maria Oliveira',
    action: 'Nova sessão agendada',
    date: '19 Maio, 14:30',
    image: null,
  },
  {
    id: 2,
    name: 'João Silva',
    action: 'Completou questionário de acompanhamento',
    date: '18 Maio, 11:20',
    image: null,
  },
  {
    id: 3,
    name: 'Luiza Santos',
    action: 'Cancelou sessão',
    date: '17 Maio, 09:45',
    image: null,
  },
  {
    id: 4,
    name: 'Pedro Costa',
    action: 'Registrou novo diário',
    date: '16 Maio, 19:15',
    image: null,
  },
];

const RecentPatientActivity: React.FC = () => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Atividades Recentes</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.image || ''} alt={activity.name} />
                <AvatarFallback className="bg-purple-100 text-portal-purple">
                  {activity.name.split(' ').map(name => name[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.name}</p>
                <p className="text-xs text-gray-500">{activity.action}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.date}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPatientActivity;
