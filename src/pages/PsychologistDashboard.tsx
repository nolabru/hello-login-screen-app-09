
import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientsList from '@/components/dashboard/PatientsList';
import PatientStatsCard from '@/components/dashboard/PatientStatsCard';
import SessionsStatsCard from '@/components/dashboard/SessionsStatsCard';
import SentimentChart from '@/components/dashboard/SentimentChart';
import RecentPatientActivity from '@/components/dashboard/RecentPatientActivity';
import { Search } from 'lucide-react';

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
          
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-4">Seus Pacientes</h2>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar pacientes..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <PatientsList />
        </div>
      </DashboardLayout>
    </>
  );
};

export default PsychologistDashboard;
