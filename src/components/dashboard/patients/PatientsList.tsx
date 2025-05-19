
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

  useEffect(() => {
    fetchPacientes();
  }, []);

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

  const fetchPacientes = async () => {
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) return;
      
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

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-serif">Seus Pacientes</h1>
      
      <PatientSearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <PatientsTable 
            patients={filteredPatients}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsList;
