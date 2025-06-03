import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PsychologistSearch from './PsychologistSearch';
import ViewModeToggle from './ViewModeToggle';
import PsychologistsTableView from './PsychologistsTableView';
import PsychologistsCardView from './PsychologistsCardView';
import type { Psychologist } from './PsychologistsTableView';

const CompanyPsychologistsList: React.FC = () => {
  const [companyPsychologists, setCompanyPsychologists] = useState<Psychologist[]>([]);
  const [filteredPsychologists, setFilteredPsychologists] = useState<Psychologist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Psychologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [dialogSearchQuery, setDialogSearchQuery] = useState('');
  const { toast } = useToast();

  // Filter psychologists based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPsychologists(companyPsychologists);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPsychologists(
        companyPsychologists.filter(psychologist => 
          psychologist.nome?.toLowerCase().includes(query) ||
          psychologist.email?.toLowerCase().includes(query) ||
          psychologist.crp?.toLowerCase().includes(query) ||
          psychologist.especialidade?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, companyPsychologists]);

  // Fetch company psychologists
  const fetchCompanyPsychologists = async () => {
    setIsLoading(true);
    try {
      const companyId = localStorage.getItem('companyId');
      if (!companyId) return;
      const companyIdNumber = parseInt(companyId, 10);

      // First get the associations
      const { data: associations, error: associationsError } = await supabase
        .from('company_psychologist_associations')
        .select('id, id_psicologo, status')
        .eq('id_empresa', companyIdNumber);

      if (associationsError) {
        console.error('Error fetching associations:', associationsError);
        throw associationsError;
      }

      if (!associations || associations.length === 0) {
        setCompanyPsychologists([]);
        setIsLoading(false);
        return;
      }

      // Extract psychologist IDs
      const psychologistIds = associations.map(assoc => assoc.id_psicologo);

      // Fetch psychologist details
      const { data: psychologistsData, error: psychologistsError } = await supabase
        .from('psychologists')
        .select('id, nome, email, crp, especialidade')
        .in('id', psychologistIds);

      if (psychologistsError) {
        console.error('Error fetching psychologists:', psychologistsError);
        throw psychologistsError;
      }

      // Map psychologists with their association status
      const mappedPsychologists = psychologistsData?.map(psych => {
        const association = associations.find(a => a.id_psicologo === psych.id);
        return {
          ...psych,
          status: association?.status || 'pending'
        };
      }) || [];

      setCompanyPsychologists(mappedPsychologists);
    } catch (error) {
      console.error('Error fetching company psychologists:', error);
      toast({
        title: "Erro ao carregar psicólogos",
        description: "Não foi possível carregar a lista de psicólogos associados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search for psychologists
  const searchPsychologists = async () => {
    if (!dialogSearchQuery.trim()) return;
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('psychologists')
        .select('id, nome, email, crp, especialidade')
        .or(`nome.ilike.%${dialogSearchQuery}%,email.ilike.%${dialogSearchQuery}%,crp.ilike.%${dialogSearchQuery}%`)
        .limit(10);

      if (error) throw error;

      // Filter out already connected psychologists
      const companyPsychologistIds = companyPsychologists.map(p => p.id);
      const filteredResults = data?.filter(p => !companyPsychologistIds.includes(p.id)) || [];
      setSearchResults(filteredResults.map(p => ({ ...p, status: 'not_connected' })));
    } catch (error) {
      console.error('Error searching psychologists:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar psicólogos.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Connect psychologist to company (set as pending until psychologist accepts)
  const connectPsychologist = async (psychologistId: number) => {
    try {
      const companyId = localStorage.getItem('companyId');
      if (!companyId) return;
      const companyIdNumber = parseInt(companyId, 10);

      const { error } = await supabase
        .from('company_psychologist_associations')
        .insert({
          id_empresa: companyIdNumber,
          id_psicologo: psychologistId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada",
        description: "A solicitação de conexão foi enviada ao psicólogo."
      });

      fetchCompanyPsychologists();
      setIsSearchDialogOpen(false);
    } catch (error) {
      console.error('Error connecting psychologist:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível enviar a solicitação ao psicólogo.",
        variant: "destructive"
      });
    }
  };

  // Approve pending psychologist connection
  const approvePsychologist = async (psychologistId: number) => {
    try {
      const companyId = localStorage.getItem('companyId');
      if (!companyId) return;
      const companyIdNumber = parseInt(companyId, 10);

      const { error } = await supabase
        .from('company_psychologist_associations')
        .update({ status: 'active' })
        .eq('id_empresa', companyIdNumber)
        .eq('id_psicologo', psychologistId);

      if (error) throw error;

      const { data: employees, error: employeesError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id_empresa', companyIdNumber);

      if (employeesError) throw employeesError;

      if (employees && employees.length > 0) {
        const employeeIds = employees.map(emp => emp.id);
        const { data: existingAssociations, error: checkError } = await supabase
          .from('user_psychologist_associations')
          .select('id_usuario')
          .eq('id_psicologo', psychologistId)
          .in('id_usuario', employeeIds);

        if (checkError) throw checkError;

        const existingUserIds = existingAssociations?.map(assoc => assoc.id_usuario) || [];
        const newEmployees = employees.filter(emp => !existingUserIds.includes(emp.id));

        if (newEmployees.length > 0) {
          const employeeAssociations = newEmployees.map(employee => ({
            id_usuario: employee.id,
            id_psicologo: psychologistId,
            status: 'active'
          }));

          const { error: associationError } = await supabase
            .from('user_psychologist_associations')
            .insert(employeeAssociations);

          if (associationError) throw associationError;
        }
      }

      toast({
        title: "Psicólogo aprovado",
        description: "O psicólogo foi aprovado e conectado aos funcionários da empresa."
      });

      fetchCompanyPsychologists();
    } catch (error) {
      console.error('Error approving psychologist:', error);
      toast({
        title: "Erro na aprovação",
        description: "Não foi possível aprovar o psicólogo.",
        variant: "destructive"
      });
    }
  };

  // Reject pending psychologist connection
  const rejectPsychologist = async (psychologistId: number) => {
    try {
      const companyId = localStorage.getItem('companyId');
      if (!companyId) return;
      const companyIdNumber = parseInt(companyId, 10);

      const { error } = await supabase
        .from('company_psychologist_associations')
        .delete()
        .eq('id_empresa', companyIdNumber)
        .eq('id_psicologo', psychologistId);

      if (error) throw error;

      toast({
        title: "Solicitação rejeitada",
        description: "A solicitação de conexão foi rejeitada."
      });

      fetchCompanyPsychologists();
    } catch (error) {
      console.error('Error rejecting psychologist:', error);
      toast({
        title: "Erro ao rejeitar",
        description: "Não foi possível rejeitar a solicitação.",
        variant: "destructive"
      });
    }
  };

  // Disconnect psychologist from company
  const disconnectPsychologist = async (psychologistId: number) => {
    try {
      const companyId = localStorage.getItem('companyId');
      if (!companyId) return;
      const companyIdNumber = parseInt(companyId, 10);

      const { error } = await supabase
        .from('company_psychologist_associations')
        .delete()
        .eq('id_empresa', companyIdNumber)
        .eq('id_psicologo', psychologistId);

      if (error) throw error;

      const { data: employees, error: employeesError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id_empresa', companyIdNumber);

      if (employeesError) throw employeesError;

      if (employees && employees.length > 0) {
        const employeeIds = employees.map(e => e.id);
        const { error: dissociationError } = await supabase
          .from('user_psychologist_associations')
          .delete()
          .eq('id_psicologo', psychologistId)
          .in('id_usuario', employeeIds);

        if (dissociationError) throw dissociationError;
      }

      toast({
        title: "Psicólogo desconectado",
        description: "O psicólogo foi desconectado da empresa e seus funcionários."
      });

      fetchCompanyPsychologists();
    } catch (error) {
      console.error('Error disconnecting psychologist:', error);
      toast({
        title: "Erro ao remover conexão",
        description: "Não foi possível desconectar o psicólogo da empresa.",
        variant: "destructive"
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCompanyPsychologists();
  }, []);

  // Handle search when dialog search query changes
  useEffect(() => {
    if (isSearchDialogOpen) {
      searchPsychologists();
    }
  }, [dialogSearchQuery, isSearchDialogOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Group psychologists by status
  const pendingRequests = filteredPsychologists.filter(p => p.status === 'requested');
  const activePsychologists = filteredPsychologists.filter(p => p.status === 'active');
  const pendingInvites = filteredPsychologists.filter(p => p.status === 'pending');

  const renderPsychologistSection = (psychologists: Psychologist[], sectionType: 'pending' | 'active' | 'invites') => {
    if (viewMode === 'table') {
      return (
        <PsychologistsTableView
          psychologists={psychologists}
          onApprovePsychologist={approvePsychologist}
          onRejectPsychologist={rejectPsychologist}
          onDisconnectPsychologist={disconnectPsychologist}
          sectionType={sectionType}
        />
      );
    } else {
      return (
        <PsychologistsCardView
          psychologists={psychologists}
          onApprovePsychologist={approvePsychologist}
          onRejectPsychologist={rejectPsychologist}
          onDisconnectPsychologist={disconnectPsychologist}
          sectionType={sectionType}
        />
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-medium text-neutral-700 text-xl">Psicólogos da Empresa</h2>
        </div>
        <Button 
          onClick={() => setIsSearchDialogOpen(true)} 
          className="bg-portal-purple hover:bg-portal-purple-dark"
        >
          <UserPlus size={16} className="mr-2" />
          Adicionar Psicólogo
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <PsychologistSearch 
          searchQuery={searchQuery} 
          onSearchChange={handleSearchChange} 
        />
        
        <ViewModeToggle 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
        />
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Carregando psicólogos...</p>
        </div>
      ) : (
        <>
          {/* Pending Connection Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Solicitações de Conexão</h3>
              <Card>
                <CardContent className="p-0">
                  {renderPsychologistSection(pendingRequests, 'pending')}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pending Invites Section */}
          {pendingInvites.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Convites Pendentes</h3>
              <Card>
                <CardContent className="p-0">
                  {renderPsychologistSection(pendingInvites, 'invites')}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Active Psychologists Section */}
          <Card>
            <CardContent className="p-0">
              {activePsychologists.length === 0 && pendingRequests.length === 0 && pendingInvites.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-neutral-700 font-display font-medium text-base">
                    {searchQuery.trim() ? 'Nenhum psicólogo encontrado para essa busca.' : 'Nenhum Psicólogo conectado à empresa.'}
                  </p>
                  {!searchQuery.trim() && (
                    <p className="mt-2 text-slate-500 text-sm font-normal">Clique em "Adicionar Psicólogo" para conectar.</p>
                  )}
                </div>
              ) : activePsychologists.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    {searchQuery.trim() ? 'Nenhum psicólogo ativo encontrado para essa busca.' : 'Nenhum psicólogo ativo no momento.'}
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium p-4 border-b">Psicólogos Ativos</h3>
                  {renderPsychologistSection(activePsychologists, 'active')}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Search Dialog */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buscar Psicólogos</DialogTitle>
            <DialogDescription>
              Conecte psicólogos à sua empresa para fornecer suporte aos seus funcionários.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Buscar por nome, email ou CRP..." 
                value={dialogSearchQuery} 
                onChange={e => setDialogSearchQuery(e.target.value)} 
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={searchPsychologists} 
                disabled={isSearching || !dialogSearchQuery.trim()}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>

            {isSearching ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Buscando psicólogos...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto">
                <PsychologistsTableView
                  psychologists={searchResults}
                  onApprovePsychologist={connectPsychologist}
                  showActions={true}
                  sectionType="pending"
                />
              </div>
            ) : dialogSearchQuery.trim() ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Nenhum psicólogo encontrado com este termo.</p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyPsychologistsList;
