
import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientsList from '@/components/dashboard/patients';

const PsychologistPatients: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Pacientes | Portal do Psicólogo</title>
      </Helmet>
      <DashboardLayout>
        <div className="w-full">
          <PatientsList />
        </div>
      </DashboardLayout>
    </>
  );
};

export default PsychologistPatients;
