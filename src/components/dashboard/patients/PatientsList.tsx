
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import PatientSearchBar from './PatientSearchBar';
import PatientsTable from './PatientsTable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Patient = {
  id: number;
  nome: string;
  email: string;
  phone: string;
  status: string;
  last_session?: string;
  user_id?: number;
};

const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Use effect for search filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  // Function to fetch patients
  const fetchPacientes = async () => {
    setLoading(true);
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        setLoading(false);
        return;
      }
      
      const psychologistIdNumber = parseInt(psychologistId, 10);
      
      // Buscando associações de pacientes
      const { data: associations, error: associationsError } = await supabase
        .from('user_psychologist_associations')
        .select(`
          id_relacao,
          status,
          id_usuario,
          atualizado_em
        `)
        .eq('id_psicologo', psychologistIdNumber);
      
      if (associationsError) throw associationsError;
      
      if (!associations || associations.length === 0) {
        setLoading(false);
        setPatients([]);
        return;
      }
      
      // Extrair os IDs dos usuários
      const userIds = associations.map(assoc => assoc.id_usuario);
      
      // Buscar os dados dos pacientes
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, nome, email, phone')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Mapear e combinar os dados
      const patientsList = userProfiles?.map(profile => {
        const association = associations.find(assoc => assoc.id_usuario === profile.id);
        return {
          id: profile.id,
          nome: profile.nome,
          email: profile.email,
          phone: profile.phone || 'Não informado',
          status: association?.status || 'pending',
          last_session: association?.atualizado_em ? 
            format(new Date(association.atualizado_em), 'dd/MM/yyyy', {locale: ptBR}) : 
            'Sem sessões',
          user_id: profile.id
        };
      }) || [];
      
      setPatients(patientsList);
      setFilteredPatients(patientsList);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast({
        title: "Erro ao carregar pacientes",
        description: "Não foi possível carregar a lista de pacientes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initially load patients
  useEffect(() => {
    fetchPacientes();
  }, []);

  // Handler for when a patient is removed
  const handlePatientRemoved = () => {
    fetchPacientes(); // Refresh the list
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-serif bg-clip-text text-transparent bg-gradient-to-r from-portal-purple to-portal-purple-dark">
          Seus Pacientes
        </h1>
        <p className="text-gray-500 mt-1">
          Gerencie seus pacientes e visualize seus históricos de interação com a AIA
        </p>
      </div>
      
      <PatientSearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <Card className="shadow-sm overflow-hidden border border-gray-200">
        <CardContent className="p-0">
          <PatientsTable 
            patients={filteredPatients}
            loading={loading}
            onPatientRemoved={handlePatientRemoved}
          />
        </CardContent>
      </Card>

      {!loading && filteredPatients.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-gray-300">
          <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum paciente encontrado</h3>
          <p className="text-gray-500 text-center max-w-md">
            Você ainda não possui pacientes vinculados. Quando usuários começarem a interagir com a AIA, você poderá vinculá-los aqui.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientsList;
