
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Activity = {
  id: number;
  name: string;
  action: string;
  date: string;
  dateFormatted: string;
  image: string | null;
};

const RecentPatientActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) return;
        
        const psychologistIdNumber = parseInt(psychologistId, 10);
        
        // Buscar associações de pacientes recentes (últimas atualizações)
        const { data: associations, error: associationsError } = await supabase
          .from('user_psychologist_associations')
          .select(`
            id_relacao,
            id_usuario,
            status,
            atualizado_em
          `)
          .eq('id_psicologo', psychologistIdNumber)
          .order('atualizado_em', { ascending: false })
          .limit(4);
        
        if (associationsError) throw associationsError;
        
        if (!associations || associations.length === 0) {
          setLoading(false);
          setActivities([]);
          return;
        }
        
        // Extrair IDs de usuários
        const userIds = associations.map(assoc => assoc.id_usuario);
        
        // Buscar informações do perfil dos usuários
        const { data: userProfiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, nome')
          .in('id', userIds);
        
        if (profilesError) throw profilesError;
        
        // Mapear as atividades
        const mappedActivities = associations.map(assoc => {
          const profile = userProfiles?.find(p => p.id === assoc.id_usuario);
          const date = new Date(assoc.atualizado_em || Date.now());
          
          // Determinar a descrição da atividade baseada no status
          let action = '';
          switch (assoc.status) {
            case 'approved':
              action = 'Paciente aprovado';
              break;
            case 'pending':
              action = 'Aguardando aprovação';
              break;
            case 'active':
              action = 'Sessão realizada';
              break;
            case 'inactive':
              action = 'Paciente inativo';
              break;
            default:
              action = `Status atualizado: ${assoc.status}`;
          }
          
          // Formatar data
          let dateFormatted;
          if (isToday(date)) {
            dateFormatted = `Hoje, ${format(date, 'HH:mm')}`;
          } else if (isYesterday(date)) {
            dateFormatted = `Ontem, ${format(date, 'HH:mm')}`;
          } else {
            dateFormatted = format(date, "d 'de' MMMM, HH:mm", { locale: ptBR });
          }
          
          return {
            id: assoc.id_relacao,
            name: profile?.nome || 'Paciente',
            action,
            date: assoc.atualizado_em || '',
            dateFormatted,
            image: null
          };
        });
        
        setActivities(mappedActivities);
      } catch (error) {
        console.error('Erro ao buscar atividades recentes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentActivities();
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Atividades Recentes</h3>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1"></div>
                  <div className="h-3 w-48 bg-gray-100 animate-pulse rounded"></div>
                </div>
                <div className="h-3 w-16 bg-gray-100 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activity.image || ''} alt={activity.name} />
                  <AvatarFallback className="bg-purple-100 text-portal-purple">
                    {activity.name.split(' ').map(name => name[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.name}</p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.dateFormatted}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma atividade recente encontrada.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentPatientActivity;
