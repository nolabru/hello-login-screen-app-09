import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PatientCard from './PatientCard';
import PatientSearchDialog from './PatientSearchDialog';

const PatientsList = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [pendingPatients, setPendingPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

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
      
      // Importar a função fetchPendingInvites para os casos que precisam dela
      const { fetchPendingInvites } = await import('@/integrations/supabase/psychologistPatientsService');
      
      if (activeTab === 'pending') {
        // Buscar apenas pacientes com convites pendentes
        const pendingData = await fetchPendingInvites(psychologistId);
        console.log('Pacientes pendentes encontrados:', pendingData);
        setPendingPatients(pendingData || []);
        setPatients([]);
      } else {
        // Buscar pacientes vinculados a este psicólogo (ativos)
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
        
        // Se for a aba "Todos", buscar também os pacientes pendentes
        if (activeTab === 'all') {
          const pendingData = await fetchPendingInvites(psychologistId);
          console.log('Pacientes pendentes encontrados para aba Todos:', pendingData);
          setPendingPatients(pendingData || []);
        } else {
          // Se for a aba "Ativos", limpar os pendentes
          setPendingPatients([]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      setErrorMessage("Ocorreu um erro ao carregar os pacientes.");
    } finally {
      setLoading(false);
    }
  };
  
  // Efeito para buscar pacientes quando a aba mudar
  useEffect(() => {
    fetchPatients();
  }, [activeTab]);
  
  useEffect(() => {
    // Adicionar listener para o evento patientConnectionUpdated
    const handleConnectionUpdate = () => {
      console.log('Evento patientConnectionUpdated recebido, recarregando pacientes...');
      fetchPatients();
    };
    
    window.addEventListener('patientConnectionUpdated', handleConnectionUpdate);
    
    // Limpar o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('patientConnectionUpdated', handleConnectionUpdate);
    };
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
        <div className="flex space-x-2">
          <Button 
            onClick={fetchPatients} 
            variant="outline" 
            className="text-portal-purple border-portal-purple hover:bg-portal-purple/10"
          >
            {loading ? 'Atualizando...' : 'Atualizar Lista'}
          </Button>
          <Button 
            className="bg-portal-purple hover:bg-portal-purple-dark text-white"
            onClick={() => setIsSearchDialogOpen(true)}
          >
            <UserPlus size={16} className="mr-2" />
            Adicionar Paciente
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="text-neutral-700">Pacientes Ativos</TabsTrigger>
          <TabsTrigger value="pending" className="text-neutral-700">Pendentes</TabsTrigger>
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
        ) : activeTab === 'pending' ? (
          pendingPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border">
              <h3 className="text-lg font-medium mb-2">Nenhum Convite Pendente</h3>
              <p className="text-gray-500 text-center max-w-md">
                Você não possui convites pendentes para pacientes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {console.log('Renderizando cards para pacientes pendentes:', pendingPatients)}
              {pendingPatients.map(patient => (
                <PatientCard 
                  key={patient.connection_id || patient.id} 
                  patient={patient} 
                  isPending={true}
                />
              ))}
            </div>
          )
        ) : activeTab === 'all' ? (
          patients.length === 0 && pendingPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border">
              <h3 className="text-lg font-medium mb-2">Nenhum Paciente Encontrado</h3>
              <p className="text-gray-500 text-center max-w-md">
                Você ainda não possui pacientes vinculados ou convites pendentes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Renderizar pacientes ativos */}
              {patients.map(patient => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
              
              {/* Renderizar pacientes pendentes */}
              {pendingPatients.map(patient => (
                <PatientCard 
                  key={`pending-${patient.connection_id || patient.id}`} 
                  patient={patient} 
                  isPending={true}
                />
              ))}
            </div>
          )
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border">
            <h3 className="text-lg font-medium mb-2">Nenhum Paciente Encontrado</h3>
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
      
      {/* Diálogo para buscar e convidar pacientes */}
      <PatientSearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        onPatientInvited={fetchPatients}
      />
    </div>
  );
};

export default PatientsList;
