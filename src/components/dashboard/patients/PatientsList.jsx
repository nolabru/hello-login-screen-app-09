import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PatientCard from './PatientCard';

const PatientsList = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [errorMessage, setErrorMessage] = useState(null);

  // Função para buscar os pacientes
  const fetchPatients = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // Obter o ID do psicólogo logado
      const psychologistId = localStorage.getItem('psychologistId');
      
      if (!psychologistId) {
        setErrorMessage("Não foi possível identificar o psicólogo logado.");
        setLoading(false);
        return;
      }
      
      // Buscar pacientes vinculados a este psicólogo
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('psychologist_id', psychologistId);
      
      if (error) {
        console.error('Erro ao buscar pacientes:', error);
        setErrorMessage("Não foi possível carregar a lista de pacientes.");
        setLoading(false);
        return;
      }
      
      console.log('Pacientes encontrados:', data);
      console.log('Estrutura do primeiro paciente:', data && data.length > 0 ? JSON.stringify(data[0], null, 2) : 'Nenhum paciente encontrado');
      
      // Verificar campos específicos
      if (data && data.length > 0) {
        const firstPatient = data[0];
        console.log('Campos do primeiro paciente:');
        console.log('- profile_photo:', firstPatient.profile_photo);
        console.log('- profile:', firstPatient.profile);
        console.log('- profilePhotoPath:', firstPatient.profilePhotoPath);
        console.log('- profile_photo_path:', firstPatient.profile_photo_path);
      }
      setPatients(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      setErrorMessage("Ocorreu um erro ao carregar os pacientes.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-medium text-neutral-700">
            Seus Pacientes
          </h1>
          <p className="text-gray-500">
            Gerencie seus pacientes e visualize seus históricos de interação com a AIA
          </p>
        </div>
        <Button className="bg-portal-purple hover:bg-portal-purple-dark text-white">
          <UserPlus size={16} className="mr-2" />
          Adicionar Paciente
        </Button>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="text-neutral-700">Pacientes Ativos</TabsTrigger>
          <TabsTrigger value="all" className="text-neutral-700">Todos</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-portal-purple"></div>
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border">
            <h3 className="text-lg font-medium mb-2 text-red-500">Erro</h3>
            <p className="text-gray-500 text-center max-w-md">
              {errorMessage}
            </p>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border">
            <h3 className="text-lg font-medium mb-2">Nenhum paciente encontrado</h3>
            <p className="text-gray-500 text-center max-w-md">
              Você ainda não possui pacientes vinculados. Quando um paciente enviar um convite e você aceitá-lo, ele aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {console.log('Renderizando cards para pacientes:', patients)}
            {patients.map(patient => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default PatientsList;
