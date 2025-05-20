
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, UserCheck, UserX } from 'lucide-react';
import { TableCell, TableRow, TableBody, TableHead, TableHeader, Table } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Psychologist = {
  id: number;
  nome: string;
  email: string;
  crp: string;
  especialidade?: string;
  status: string;
};

const CompanyPsychologistsList: React.FC = () => {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [companyPsychologists, setCompanyPsychologists] = useState<Psychologist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Psychologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

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
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('psychologists')
        .select('id, nome, email, crp, especialidade')
        .or(`nome.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,crp.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      // Filter out already connected psychologists
      const companyPsychologistIds = companyPsychologists.map(p => p.id);
      const filteredResults = data?.filter(p => !companyPsychologistIds.includes(p.id)) || [];

      setSearchResults(filteredResults.map(p => ({
        ...p,
        status: 'not_connected'
      })));
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

      // Create association with pending status
      const { error } = await supabase
        .from('company_psychologist_associations')
        .insert({
          id_empresa: companyIdNumber,
          id_psicologo: psychologistId,
          status: 'pending' // Request pending approval from psychologist
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada",
        description: "A solicitação de conexão foi enviada ao psicólogo.",
      });

      // Refresh list
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

      // Update association status to active
      const { error } = await supabase
        .from('company_psychologist_associations')
        .update({ status: 'active' })
        .eq('id_empresa', companyIdNumber)
        .eq('id_psicologo', psychologistId);

      if (error) throw error;

      // Connect all company employees to this psychologist
      const { data: employees, error: employeesError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id_empresa', companyIdNumber);

      if (employeesError) throw employeesError;

      if (employees && employees.length > 0) {
        // Create associations between employees and psychologist
        const employeeAssociations = employees.map(employee => ({
          id_usuario: employee.id,
          id_psicologo: psychologistId,
          status: 'active' // Auto-approve employee-psychologist connection
        }));

        const { error: associationError } = await supabase
          .from('user_psychologist_associations')
          .insert(employeeAssociations);

        if (associationError) throw associationError;
      }

      toast({
        title: "Psicólogo aprovado",
        description: "O psicólogo foi aprovado e conectado aos funcionários da empresa.",
      });

      // Refresh list
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

      // Delete the association
      const { error } = await supabase
        .from('company_psychologist_associations')
        .delete()
        .eq('id_empresa', companyIdNumber)
        .eq('id_psicologo', psychologistId);

      if (error) throw error;

      toast({
        title: "Solicitação rejeitada",
        description: "A solicitação de conexão foi rejeitada.",
      });

      // Refresh list
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

      // Remove association
      const { error } = await supabase
        .from('company_psychologist_associations')
        .delete()
        .eq('id_empresa', companyIdNumber)
        .eq('id_psicologo', psychologistId);

      if (error) throw error;

      // Remove all associations between company employees and this psychologist
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
        description: "O psicólogo foi desconectado da empresa e seus funcionários.",
      });

      // Refresh list
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

  // Handle search when search query changes
  useEffect(() => {
    if (isSearchDialogOpen) {
      searchPsychologists();
    }
  }, [searchQuery, isSearchDialogOpen]);

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Solicitação Enviada</Badge>;
      case 'requested':
        return <Badge className="bg-blue-500">Solicitou Conexão</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconhecido</Badge>;
    }
  };

  // Group psychologists by status
  const pendingRequests = companyPsychologists.filter(p => p.status === 'requested');
  const activePsychologists = companyPsychologists.filter(p => p.status === 'active');
  const pendingInvites = companyPsychologists.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium">Psicólogos da Empresa</h2>
          <p className="text-gray-500">Gerencie os psicólogos conectados à sua empresa</p>
        </div>
        <Button 
          onClick={() => setIsSearchDialogOpen(true)}
          className="bg-indigo-900 hover:bg-indigo-800"
        >
          <UserPlus size={16} className="mr-2" />
          Adicionar Psicólogo
        </Button>
      </div>

      {/* Pending Connection Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Solicitações de Conexão</h3>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium">Nome</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">CRP</TableHead>
                    <TableHead className="font-medium">Especialidade</TableHead>
                    <TableHead className="text-right font-medium">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((psychologist) => (
                    <TableRow key={psychologist.id}>
                      <TableCell className="font-medium">{psychologist.nome}</TableCell>
                      <TableCell>{psychologist.email}</TableCell>
                      <TableCell>{psychologist.crp}</TableCell>
                      <TableCell>{psychologist.especialidade || 'Não especificada'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approvePsychologist(psychologist.id)}
                        >
                          <UserCheck size={16} className="mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 border-red-300 hover:bg-red-50"
                          onClick={() => rejectPsychologist(psychologist.id)}
                        >
                          <UserX size={16} className="mr-1" />
                          Rejeitar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium">Nome</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">CRP</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="text-right font-medium">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvites.map((psychologist) => (
                    <TableRow key={psychologist.id}>
                      <TableCell className="font-medium">{psychologist.nome}</TableCell>
                      <TableCell>{psychologist.email}</TableCell>
                      <TableCell>{psychologist.crp}</TableCell>
                      <TableCell>{renderStatusBadge(psychologist.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 border-red-300 hover:bg-red-50"
                          onClick={() => disconnectPsychologist(psychologist.id)}
                        >
                          <UserX size={16} className="mr-1" />
                          Cancelar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Psychologists Section */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Carregando psicólogos...</p>
            </div>
          ) : activePsychologists.length === 0 && pendingRequests.length === 0 && pendingInvites.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Nenhum psicólogo conectado à empresa.</p>
              <p className="text-sm text-gray-400 mt-2">Clique em "Adicionar Psicólogo" para conectar.</p>
            </div>
          ) : activePsychologists.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Nenhum psicólogo ativo no momento.</p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium p-4 border-b">Psicólogos Ativos</h3>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium">Nome</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">CRP</TableHead>
                    <TableHead className="font-medium">Especialidade</TableHead>
                    <TableHead className="text-right font-medium">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activePsychologists.map((psychologist) => (
                    <TableRow key={psychologist.id}>
                      <TableCell className="font-medium">{psychologist.nome}</TableCell>
                      <TableCell>{psychologist.email}</TableCell>
                      <TableCell>{psychologist.crp}</TableCell>
                      <TableCell>{psychologist.especialidade || 'Não especificada'}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 border-red-300 hover:bg-red-50"
                          onClick={() => disconnectPsychologist(psychologist.id)}
                        >
                          <UserX size={16} className="mr-1" />
                          Desconectar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={searchPsychologists}
                disabled={isSearching || !searchQuery.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {isSearching ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Buscando psicólogos...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CRP</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((psychologist) => (
                      <TableRow key={psychologist.id}>
                        <TableCell className="font-medium">{psychologist.nome}</TableCell>
                        <TableCell>{psychologist.crp}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm"
                            onClick={() => connectPsychologist(psychologist.id)}
                          >
                            <UserPlus size={16} className="mr-1" />
                            Conectar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : searchQuery.trim() ? (
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
