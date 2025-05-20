
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Search, Clock, Calendar } from 'lucide-react';
import { TableCell, TableRow, TableBody, TableHead, TableHeader, Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';

type Company = {
  id: number;
  name: string;
  contact_email: string;
  status: boolean;
  connection_status: string;
  created_at?: string; // Timestamp of when the connection was requested
};

type CompanySearchResult = {
  id: number;
  name: string;
  contact_email: string;
  status: boolean;
};

type CompanyDetail = {
  id: number;
  name: string;
  contact_email: string;
  status: boolean;
  connection_status: string;
  created_at?: string;
  updated_at?: string;
};

const PsychologistCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetail | null>(null);
  const { toast } = useToast();

  // Buscar empresas associadas ao psicólogo
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) {
          throw new Error('Nenhum psicólogo logado');
        }

        const psychologistIdNumber = parseInt(psychologistId, 10);

        // Buscar associações do psicólogo com empresas
        const { data: associations, error: associationsError } = await supabase
          .from('company_psychologist_associations')
          .select('id_empresa, status, created_at, updated_at')
          .eq('id_psicologo', psychologistIdNumber);

        if (associationsError) throw associationsError;

        if (associations && associations.length > 0) {
          // Extrair IDs das empresas associadas
          const companyIds = associations.map(assoc => assoc.id_empresa);

          // Buscar detalhes das empresas
          const { data: companiesData, error: companiesError } = await supabase
            .from('companies')
            .select('id, name, contact_email, status')
            .in('id', companyIds);

          if (companiesError) throw companiesError;

          // Mapear empresas com status de conexão
          const mappedCompanies = companiesData?.map(company => {
            const association = associations.find(a => a.id_empresa === company.id);
            return {
              ...company,
              connection_status: association?.status || 'pending',
              created_at: association?.created_at
            };
          }) || [];

          setCompanies(mappedCompanies);
          setFilteredCompanies(mappedCompanies);
        } else {
          setCompanies([]);
          setFilteredCompanies([]);
        }
      } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        toast({
          title: "Erro ao carregar empresas",
          description: "Não foi possível carregar a lista de empresas associadas.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [toast]);

  // Filtrar empresas com base na busca
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = companies.filter(company => 
      company.name.toLowerCase().includes(lowercaseQuery) || 
      company.contact_email.toLowerCase().includes(lowercaseQuery)
    );

    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  // Buscar empresas para conexão
  const searchCompanies = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Obter o ID do psicólogo atual
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('Nenhum psicólogo logado');
      }
      
      const psychologistIdNumber = parseInt(psychologistId, 10);
      
      // Buscar empresas que correspondem à pesquisa
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, contact_email, status')
        .or(`name.ilike.%${searchQuery}%,contact_email.ilike.%${searchQuery}%`)
        .eq('status', true)
        .limit(10);

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Obter empresas já conectadas para filtrá-las dos resultados
        const { data: existingAssociations } = await supabase
          .from('company_psychologist_associations')
          .select('id_empresa')
          .eq('id_psicologo', psychologistIdNumber);
        
        const connectedCompanyIds = existingAssociations?.map(assoc => assoc.id_empresa) || [];
        
        // Filtrar empresas já conectadas
        const filteredResults = data.filter(company => !connectedCompanyIds.includes(company.id));
        
        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar empresas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Solicitar conexão com uma empresa
  const requestCompanyConnection = async (companyId: number) => {
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('Nenhum psicólogo logado');
      }

      const psychologistIdNumber = parseInt(psychologistId, 10);

      // Criar nova associação com status pendente
      const { error } = await supabase
        .from('company_psychologist_associations')
        .insert({
          id_empresa: companyId,
          id_psicologo: psychologistIdNumber,
          status: 'pending' // Solicitação pendente
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada",
        description: "Conexão com a empresa solicitada com sucesso.",
      });

      // Fechar o diálogo e atualizar a lista
      setIsSearchDialogOpen(false);
      // Recarregar a lista de empresas conectadas
      fetchCompanies();
    } catch (error) {
      console.error('Erro ao solicitar conexão:', error);
      toast({
        title: "Erro na solicitação",
        description: "Não foi possível solicitar conexão com esta empresa.",
        variant: "destructive"
      });
    }
  };

  // Visualizar detalhes da empresa
  const viewCompanyDetails = async (company: Company) => {
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('Nenhum psicólogo logado');
      }

      const psychologistIdNumber = parseInt(psychologistId, 10);

      // Buscar detalhes da associação
      const { data: associationData, error: associationError } = await supabase
        .from('company_psychologist_associations')
        .select('*')
        .eq('id_empresa', company.id)
        .eq('id_psicologo', psychologistIdNumber)
        .single();

      if (associationError) throw associationError;

      setSelectedCompany({
        ...company,
        created_at: associationData?.created_at,
        updated_at: associationData?.updated_at
      });
      
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes da empresa:', error);
      toast({
        title: "Erro ao carregar detalhes",
        description: "Não foi possível carregar os detalhes desta conexão.",
        variant: "destructive"
      });
    }
  };

  // Função auxiliar para carregar empresas
  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('Nenhum psicólogo logado');
      }

      const psychologistIdNumber = parseInt(psychologistId, 10);

      // Buscar associações do psicólogo com empresas
      const { data: associations, error: associationsError } = await supabase
        .from('company_psychologist_associations')
        .select('id_empresa, status, created_at, updated_at')
        .eq('id_psicologo', psychologistIdNumber);

      if (associationsError) throw associationsError;

      if (associations && associations.length > 0) {
        // Extrair IDs das empresas associadas
        const companyIds = associations.map(assoc => assoc.id_empresa);

        // Buscar detalhes das empresas
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name, contact_email, status')
          .in('id', companyIds);

        if (companiesError) throw companiesError;

        // Mapear empresas com status de conexão
        const mappedCompanies = companiesData?.map(company => {
          const association = associations.find(a => a.id_empresa === company.id);
          return {
            ...company,
            connection_status: association?.status || 'pending',
            created_at: association?.created_at
          };
        }) || [];

        setCompanies(mappedCompanies);
        setFilteredCompanies(mappedCompanies);
      } else {
        setCompanies([]);
        setFilteredCompanies([]);
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast({
        title: "Erro ao carregar empresas",
        description: "Não foi possível carregar a lista de empresas associadas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não disponível';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <>
      <Helmet>
        <title>Empresas - Portal do Psicólogo</title>
      </Helmet>
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-medium">Empresas</h1>
              <p className="text-gray-500">Gerencie suas conexões com empresas</p>
            </div>
            <Button 
              className="bg-indigo-900 hover:bg-indigo-800"
              onClick={() => setIsSearchDialogOpen(true)}
            >
              <UserPlus size={16} className="mr-2" />
              Solicitar Conexão
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Search className="text-gray-400" size={20} />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Carregando empresas...</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Nenhuma empresa conectada.</p>
                  <p className="text-sm text-gray-400 mt-2">Use o botão "Solicitar Conexão" para iniciar uma parceria com uma empresa.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-medium">Nome</TableHead>
                      <TableHead className="font-medium">Email</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="text-right font-medium">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.contact_email}</TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              company.connection_status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {company.connection_status === 'active' ? 'Conectada' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewCompanyDetails(company)}
                          >
                            Ver detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          {/* Dialog para buscar e conectar com empresas */}
          <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Conectar com Empresas</DialogTitle>
                <DialogDescription>
                  Busque empresas para solicitar uma conexão.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Buscar por nome ou email da empresa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={searchCompanies}
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {isSearching ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Buscando empresas...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((company) => (
                          <TableRow key={company.id}>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell>{company.contact_email}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm"
                                onClick={() => requestCompanyConnection(company.id)}
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
                ) : searchQuery.trim() && !isSearching ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Nenhuma empresa encontrada com este termo.</p>
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog de detalhes da empresa */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Detalhes da Conexão</DialogTitle>
                <DialogDescription>
                  Informações sobre sua conexão com esta empresa.
                </DialogDescription>
              </DialogHeader>
              
              {selectedCompany && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Empresa</h3>
                    <p>{selectedCompany.name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Email de contato</h3>
                    <p>{selectedCompany.contact_email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Status da conexão</h3>
                    <p>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedCompany.connection_status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedCompany.connection_status === 'active' ? 'Conectada' : 'Pendente'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <h3 className="font-medium">Data da solicitação</h3>
                    </div>
                    <p>{formatDate(selectedCompany.created_at)}</p>
                  </div>
                  
                  {selectedCompany.updated_at && selectedCompany.created_at !== selectedCompany.updated_at && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        <h3 className="font-medium">Última atualização</h3>
                      </div>
                      <p>{formatDate(selectedCompany.updated_at)}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </>
  );
};

export default PsychologistCompanies;
