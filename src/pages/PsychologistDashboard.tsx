
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientStatsCard from '@/components/dashboard/patients/PatientStatsCard';
import SessionsStatsCard from '@/components/dashboard/sessions/SessionsStatsCard';
import SentimentChart from '@/components/dashboard/SentimentChart';
import RecentPatientActivity from '@/components/dashboard/RecentPatientActivity';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';

const PsychologistDashboard: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState<string>('');
  
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
          
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-5 space-y-6">
              <RecentPatientActivity />
            </div>
            <div className="md:col-span-7">
              <Card className="h-full">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Calendário</h3>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border shadow p-3 pointer-events-auto"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h4 className="text-sm font-medium mb-2">
                        Anotações para {date?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </h4>
                      <Textarea 
                        placeholder="Registre interações da AIA com os pacientes nesta data..."
                        className="flex-1 min-h-[150px]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <div className="text-sm text-gray-500 mt-2">
                        {date && `Interações AIA-paciente em ${date.toLocaleDateString('pt-BR')}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default PsychologistDashboard;
