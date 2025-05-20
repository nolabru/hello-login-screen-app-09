
import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PsychologistCompaniesContainer from './companies/PsychologistCompaniesContainer';

const PsychologistCompanies: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Empresas - Portal do Psicólogo</title>
      </Helmet>
      <DashboardLayout>
        <PsychologistCompaniesContainer />
      </DashboardLayout>
    </>
  );
};

export default PsychologistCompanies;
