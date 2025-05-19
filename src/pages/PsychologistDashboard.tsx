
import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientStatsCard from '@/components/dashboard/PatientStatsCard';
import SessionsStatsCard from '@/components/dashboard/SessionsStatsCard';
import SentimentChart from '@/components/dashboard/SentimentChart';
import RecentPatientActivity from '@/components/dashboard/RecentPatientActivity';

const PsychologistDashboard: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard do Psicólogo</title>
      </Helmet>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-medium mb-2">Visão Geral</h1>
          <p className="text-gray-500 mb-6">Acompanhe seus pacientes e estatísticas.</p>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <PatientStatsCard />
            <SessionsStatsCard />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <SentimentChart />
            </div>
            <div className="md:col-span-1">
              <RecentPatientActivity />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default PsychologistDashboard;
