
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import CompanyList from './CompanyList';
import CompanySearchBar from './CompanySearchBar';
import CompanySearchDialog from './CompanySearchDialog';
import CompanyDetailDialog from './CompanyDetailDialog';
import { Company, CompanyDetail, CompanySearchResult } from './types';
import { 
  fetchCompanyConnections, 
  searchAvailableCompanies, 
  requestCompanyConnection,
  fetchCompanyDetails
} from './companiesService';

const PsychologistCompaniesContainer: React.FC = () => {
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
    const loadCompanies = async () => {
      setIsLoading(true);
      try {
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) {
          throw new Error('Nenhum psicólogo logado');
        }

        const loadedCompanies = await fetchCompanyConnections(psychologistId);
        setCompanies(loadedCompanies);
        setFilteredCompanies(loadedCompanies);
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

    loadCompanies();
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
  const handleSearchCompanies = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('Nenhum psicólogo logado');
      }
      
      const results = await searchAvailableCompanies(searchQuery, psychologistId);
      setSearchResults(results);
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
  const handleRequestConnection = async (companyId: number) => {
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('Nenhum psicólogo logado');
      }

      await requestCompanyConnection(companyId, psychologistId);

      toast({
        title: "Solicitação enviada",
        description: "Conexão com a empresa solicitada com sucesso.",
      });

      // Fechar o diálogo e atualizar a lista
      setIsSearchDialogOpen(false);
      // Recarregar a lista de empresas conectadas
      loadCompanies();
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
  const handleViewCompanyDetails = async (company: Company) => {
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('Nenhum psicólogo logado');
      }

      const companyDetails = await fetchCompanyDetails(company, psychologistId);
      setSelectedCompany(companyDetails);
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
  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('Nenhum psicólogo logado');
      }

      const loadedCompanies = await fetchCompanyConnections(psychologistId);
      setCompanies(loadedCompanies);
      setFilteredCompanies(loadedCompanies);
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

  return (
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
        <CompanySearchBar 
          searchQuery={searchQuery} 
          onSearchQueryChange={setSearchQuery} 
        />
      </div>

      <CompanyList 
        companies={filteredCompanies} 
        isLoading={isLoading} 
        onViewDetails={handleViewCompanyDetails} 
      />
      
      {/* Dialog para buscar e conectar com empresas */}
      <CompanySearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearchCompanies}
        isSearching={isSearching}
        searchResults={searchResults}
        onRequestConnection={handleRequestConnection}
      />

      {/* Dialog de detalhes da empresa */}
      <CompanyDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        company={selectedCompany}
      />
    </div>
  );
};

export default PsychologistCompaniesContainer;
