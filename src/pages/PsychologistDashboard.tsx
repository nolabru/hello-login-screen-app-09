
import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientStatsCard from '@/components/dashboard/patients/PatientStatsCard';
import SessionsStatsCard from '@/components/dashboard/sessions/SessionsStatsCard';
import SentimentChart from '@/components/dashboard/SentimentChart';
import RecentPatientActivity from '@/components/dashboard/RecentPatientActivity';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

const PsychologistDashboard: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <>
      <Helmet>
        <title>Dashboard do Psicólogo</title>
      </Helmet>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-medium mb-2">Visão Geral</h1>
          <p className="text-gray-500 mb-6">Acompanhe seus pacientes e sua interação com a AIA.</p>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <PatientStatsCard />
            <SessionsStatsCard />
          </div>
          
          <div className="grid md:grid-cols-1 gap-6 mb-6">
            <SentimentChart />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <RecentPatientActivity />
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Calendário</h3>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow p-3 pointer-events-auto"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default PsychologistDashboard;
