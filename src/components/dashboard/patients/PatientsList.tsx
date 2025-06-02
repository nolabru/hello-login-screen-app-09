import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import PatientSearchBar from './PatientSearchBar';
import PatientsTable from './PatientsTable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PatientSearchDialog from './PatientSearchDialog';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
type Patient = {
  id: number;
  nome: string;
  email: string;
  phone: string;
  status: string;
  last_session?: string;
  user_id?: number;
  company_name?: string; // Added company name field
};
const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const {
    toast
  } = useToast();

  // Use effect for search filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      filterPatientsByTab(patients, activeTab);
    } else {
      const searched = patients.filter(patient => patient.nome.toLowerCase().includes(searchQuery.toLowerCase()) || patient.email.toLowerCase().includes(searchQuery.toLowerCase()));
      filterPatientsByTab(searched, activeTab);
    }
  }, [searchQuery, patients, activeTab]);

  // Filter patients based on active tab
  const filterPatientsByTab = (patientsList: Patient[], tab: string) => {
    if (tab === 'active') {
      // Case insensitive comparison for status
      setFilteredPatients(patientsList.filter(p => p.status.toLowerCase() === 'active'));
    } else if (tab === 'pending') {
      // Case insensitive comparison for status
      setFilteredPatients(patientsList.filter(p => p.status.toLowerCase() === 'pending'));
    } else {
      setFilteredPatients(patientsList);
    }
  };

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
      const {
        data: associations,
        error: associationsError
      } = await supabase.from('user_psychologist_associations').select(`
          id_relacao,
          status,
          id_usuario,
          atualizado_em
        `).eq('id_psicologo', psychologistIdNumber);
      if (associationsError) throw associationsError;
      if (!associations || associations.length === 0) {
        setLoading(false);
        setPatients([]);
        return;
      }
      console.log('Fetched associations:', associations);

      // Extrair os IDs dos usuários
      const userIds = associations.map(assoc => assoc.id_usuario);

      // Buscar os dados dos pacientes
      const {
        data: userProfiles,
        error: profilesError
      } = await supabase.from('user_profiles').select('id, nome, email, phone, id_empresa').in('id', userIds);
      if (profilesError) throw profilesError;
      console.log('Fetched user profiles:', userProfiles);

      // Collect all company IDs to fetch company names
      const companyIds = userProfiles?.filter(profile => profile.id_empresa !== null).map(profile => profile.id_empresa) || [];

      // Create a map to store company names by ID
      const companyNameMap = new Map();

      // Only fetch companies if there are company IDs
      if (companyIds.length > 0) {
        // Fetch company names
        const {
          data: companies,
          error: companiesError
        } = await supabase.from('companies').select('id, name, razao_social').in('id', companyIds);
        if (companiesError) throw companiesError;

        // Build a map of company ID to name
        companies?.forEach(company => {
          companyNameMap.set(company.id, company.name || company.razao_social);
        });
      }

      // Mapear e combinar os dados
      const patientsList = userProfiles?.map(profile => {
        const association = associations.find(assoc => assoc.id_usuario === profile.id);
        return {
          id: profile.id,
          nome: profile.nome,
          email: profile.email,
          phone: profile.phone || 'Não informado',
          status: association?.status || 'pending',
          last_session: association?.atualizado_em ? format(new Date(association.atualizado_em), 'dd/MM/yyyy', {
            locale: ptBR
          }) : 'Sem sessões',
          user_id: profile.id,
          company_name: profile.id_empresa ? companyNameMap.get(profile.id_empresa) || 'Empresa' : undefined
        };
      }) || [];
      console.log('Mapped patients list:', patientsList);
      setPatients(patientsList);
      filterPatientsByTab(patientsList, activeTab);
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

  // Handler for when a patient is removed or connection status changes
  const handlePatientRemoved = () => {
    fetchPacientes(); // Refresh the list
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-3xl bg-clip-text text-transparent bg-gradient-to-r from-portal-purple to-portal-purple-dark">
            Seus Pacientes
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie seus pacientes e visualize seus históricos de interação com a AIA
          </p>
        </div>
        <Button onClick={() => setIsSearchDialogOpen(true)} className="bg-portal-purple hover:bg-portal-purple-dark text-white">
          <Search className="h-5 w-5 mr-2" /> Procurar Paciente
        </Button>
      </div>
      
      <div className="w-full">
        <PatientSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Pacientes Ativos</TabsTrigger>
          <TabsTrigger value="pending">Solicitações Pendentes</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="shadow-sm overflow-hidden border border-gray-200">
            <CardContent className="p-0">
              <PatientsTable patients={filteredPatients} loading={loading && activeTab === 'active'} onPatientRemoved={handlePatientRemoved} />
            </CardContent>
          </Card>

          {!loading && filteredPatients.length === 0 && activeTab === 'active' && <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-gray-300">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum paciente ativo encontrado</h3>
              <p className="text-gray-500 text-center max-w-md">
                Você ainda não possui pacientes ativos. Clique em "Procurar Paciente" para solicitar conexão com um novo paciente.
              </p>
            </div>}
        </TabsContent>
        
        <TabsContent value="pending">
          <Card className="shadow-sm overflow-hidden border border-gray-200">
            <CardContent className="p-0">
              <PatientsTable patients={filteredPatients} loading={loading && activeTab === 'pending'} onPatientRemoved={handlePatientRemoved} />
            </CardContent>
          </Card>

          {!loading && filteredPatients.length === 0 && activeTab === 'pending' && <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-gray-300">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhuma solicitação pendente</h3>
              <p className="text-gray-500 text-center max-w-md">
                Você não possui solicitações de conexão pendentes no momento.
              </p>
            </div>}
        </TabsContent>

        <TabsContent value="all">
          <Card className="shadow-sm overflow-hidden border border-gray-200">
            <CardContent className="p-0">
              <PatientsTable patients={filteredPatients} loading={loading && activeTab === 'all'} onPatientRemoved={handlePatientRemoved} />
            </CardContent>
          </Card>

          {!loading && filteredPatients.length === 0 && activeTab === 'all' && <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-gray-300">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum paciente encontrado</h3>
              <p className="text-gray-500 text-center max-w-md">
                Você ainda não possui pacientes vinculados. Quando usuários começarem a interagir com a AIA, você poderá vinculá-los aqui.
              </p>
            </div>}
        </TabsContent>
      </Tabs>

      {/* Patient Search Dialog Component */}
      <PatientSearchDialog isOpen={isSearchDialogOpen} onClose={() => setIsSearchDialogOpen(false)} onPatientAdded={handlePatientRemoved} />
    </div>;
};
export default PatientsList;