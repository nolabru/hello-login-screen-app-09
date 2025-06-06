import React from 'react';
import { useParams } from 'react-router-dom';
import { usePatientDetails } from '@/hooks/usePatientDetails';
import { usePatientInsights } from '@/hooks/usePatientInsights';
import PatientDetailsHeader from '@/components/dashboard/patients/PatientDetailsHeader';
import PatientInfoSection from '@/components/dashboard/patients/PatientInfoSection';
import PatientInsightsList from '@/components/dashboard/patients/PatientInsightsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { patient, loading: patientLoading, error: patientError } = usePatientDetails(id!);
  const { insights, loading: insightsLoading, error: insightsError } = usePatientInsights(patient?.user_id);
  
  if (patientLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-portal-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (patientError) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erro ao carregar dados do paciente</h2>
          <p className="text-red-500">{patientError}</p>
        </div>
      </div>
    );
  }
  
  if (!patient) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">Paciente não encontrado</h2>
          <p className="text-yellow-500">Não foi possível encontrar o paciente com o ID especificado.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PatientDetailsHeader patient={patient} />
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-6">
          <PatientInfoSection patient={patient} />
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Insights das Sessões</h2>
            
            {insightsLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin h-8 w-8 border-4 border-portal-purple border-t-transparent rounded-full"></div>
              </div>
            ) : insightsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-500">Erro ao carregar insights: {insightsError}</p>
              </div>
            ) : insights.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">Nenhum insight encontrado para este paciente.</p>
              </div>
            ) : (
              <PatientInsightsList insights={insights} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetails;
