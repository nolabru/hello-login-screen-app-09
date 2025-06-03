import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientsList from '@/components/dashboard/patients';
const PsychologistPatients: React.FC = () => {
  return <>
      <Helmet>
        <title>Pacientes | Portal do Psicólogo</title>
      </Helmet>
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <PatientsList />
          </div>
        </div>
      </DashboardLayout>
    </>;
};
export default PsychologistPatients;