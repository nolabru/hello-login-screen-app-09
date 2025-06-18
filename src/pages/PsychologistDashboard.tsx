import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientStatsCard from '@/components/dashboard/patients/PatientStatsCard';
import SentimentChart from '@/components/dashboard/SentimentChart';
import RecentPatientActivity from '@/components/dashboard/RecentPatientActivity';
import { Card, CardContent } from '@/components/ui/card';
import PsychologistDailyInteractionsCalendar from '@/components/dashboard/PsychologistDailyInteractionsCalendar';
import { supabase } from '@/integrations/supabase/client';
const PsychologistDashboard: React.FC = () => {
  return <>
      <Helmet>
        <title>Dashboard do Psicólogo</title>
      </Helmet>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-medium text-neutral-700">Visão Geral</h1>
          <p className="text-gray-500 mb-6">Acompanhe seus pacientes e sua interação com a AIA</p>
          
          <div className="flex justify-start mb-6">
            <PatientStatsCard />
          </div>
          
          <div className="w-full mb-6">
            <SentimentChart />
          </div>
          
          <div className="grid md:grid-cols-1 gap-6 mb-6">
            <RecentPatientActivity />
          </div>
          
          <div className="grid md:grid-cols-1 gap-6">
            <PsychologistDailyInteractionsCalendar />
          </div>
        </div>
      </DashboardLayout>
    </>;
};
export default PsychologistDashboard;
