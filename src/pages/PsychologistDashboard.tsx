import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientStatsCard from '@/components/dashboard/patients/PatientStatsCard';
import SessionsStatsCard from '@/components/dashboard/sessions/SessionsStatsCard';
import SentimentChart from '@/components/dashboard/SentimentChart';
import RecentPatientActivity from '@/components/dashboard/RecentPatientActivity';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
const PsychologistDashboard: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [interactions, setInteractions] = useState<Array<{
    id: number;
    name: string;
    action: string;
    image: string | null;
  }>>([]);
  const [loading, setLoading] = useState(false);

  // Fetch patient interactions for the selected date
  useEffect(() => {
    const fetchDateInteractions = async () => {
      if (!date) return;
      setLoading(true);
      try {
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) return;
        const psychologistIdNumber = parseInt(psychologistId, 10);

        // Format the date to match ISO format for comparison in Supabase query
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Query for interactions on the selected date, excluding pending status
        const {
          data: associations,
          error
        } = await supabase.from('user_psychologist_associations').select(`
            id_relacao,
            id_usuario,
            status,
            atualizado_em
          `).eq('id_psicologo', psychologistIdNumber).neq('status', 'pending') // Exclude pending status
        .gte('atualizado_em', selectedDate.toISOString()).lt('atualizado_em', nextDay.toISOString()).order('atualizado_em', {
          ascending: false
        });
        if (error) throw error;
        if (!associations || associations.length === 0) {
          setInteractions([]);
          setLoading(false);
          return;
        }

        // Extract user IDs
        const userIds = associations.map(assoc => assoc.id_usuario);

        // Get user profiles
        const {
          data: userProfiles,
          error: profilesError
        } = await supabase.from('user_profiles').select('id, nome').in('id', userIds);
        if (profilesError) throw profilesError;

        // Map interactions
        const mappedInteractions = associations.map(assoc => {
          const profile = userProfiles?.find(p => p.id === assoc.id_usuario);
          return {
            id: assoc.id_relacao,
            name: profile?.nome || 'Paciente',
            action: 'Interação com a AIA',
            image: null
          };
        });
        setInteractions(mappedInteractions);
      } catch (error) {
        console.error('Erro ao buscar interações:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDateInteractions();
  }, [date]);
  return <>
      <Helmet>
        <title>Dashboard do Psicólogo</title>
      </Helmet>
      <DashboardLayout>
        <div className="p-6">
          <h1 className=" text-2xl font-medium text-neutral-700">Visão Geral</h1>
          <p className="text-gray-500 mb-6">Acompanhe seus pacientes e sua interação com a AIA.</p>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <PatientStatsCard />
            <SessionsStatsCard />
          </div>
          
          <div className="w-full mb-6">
            <SentimentChart />
          </div>
          
          <div className="grid md:grid-cols-1 gap-6 mb-6">
            <RecentPatientActivity />
          </div>
          
          <div className="grid md:grid-cols-1 gap-6">
            <Card className="w-full">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4 text-neutral-700">Calendário de Interações</h3>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex justify-center">
                    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border shadow p-3 pointer-events-auto" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-3 text-neutral-700">
                      Interações AIA-paciente em {date?.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                    </h4>
                    
                    {loading ? <div className="space-y-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="flex items-center gap-3 p-3 border rounded-md animate-pulse">
                            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                            <div className="flex-1">
                              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 w-36 bg-gray-100 rounded"></div>
                            </div>
                          </div>)}
                      </div> : interactions.length > 0 ? <div className="space-y-3">
                        {interactions.map(interaction => <div key={interaction.id} className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={interaction.image || ''} alt={interaction.name} />
                              <AvatarFallback className="bg-purple-100 text-portal-purple">
                                {interaction.name.split(' ').map(name => name[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{interaction.name}</p>
                              <p className="text-sm text-gray-500">{interaction.action}</p>
                            </div>
                          </div>)}
                      </div> : <div className="text-center py-8 border rounded-md">
                        <p className="text-gray-500">Nenhuma interação com a AIA nesta data.</p>
                      </div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>;
};
export default PsychologistDashboard;