import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import CompanyList from './CompanyList';
import CompanySearchBar from './CompanySearchBar';
import CompanySearchDialog from './CompanySearchDialog';
import CompanyDetailDialog from './CompanyDetailDialog';
import { useCompanyDetails } from './hooks/useCompanyDetails';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import { fetchPsychologistCompanies, PsychologistCompany, fetchCompanyConnections } from '@/integrations/supabase/companyPsychologistsService';
import { Company } from './types';

const PsychologistCompaniesContainer: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [psychologistId, setPsychologistId] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const {
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    selectedCompany,
    handleViewCompanyDetails
  } = useCompanyDetails();

  // Função para carregar empresas
  const loadCompanies = async () => {
    if (!psychologistId) return;
    
    setIsLoading(true);
    try {
      // Usar a função fetchCompanyConnections que já retorna o formato Company
      const companies = await fetchCompanyConnections(psychologistId);
      
      setCompanies(companies);
      setFilteredCompanies(companies);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de empresas.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Inicializar o hook useCompanySearch após a definição de loadCompanies
  const {
    isSearchDialogOpen,
    setIsSearchDialogOpen,
    searchResults,
    isSearching,
    handleSearchCompanies,
    handleRequestConnection
  } = useCompanySearch(loadCompanies);

  useEffect(() => {
    const storedPsychologistId = localStorage.getItem('psychologistId');
    if (storedPsychologistId) {
      setPsychologistId(storedPsychologistId);
    }
  }, []);

  useEffect(() => {
    if (psychologistId) {
      loadCompanies();
    }
  }, [psychologistId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCompanies(
        companies.filter(
          company => 
            company.name.toLowerCase().includes(query) || 
            (company.corp_email && company.corp_email.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, companies]);

  // Group companies by status (all are active in this implementation)
  const pendingCompanies: Company[] = [];
  const requestedCompanies: Company[] = [];
  const activeCompanies = filteredCompanies;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium text-neutral-700">Empresas</h1>
      <p className="text-gray-500 mb-1">Gerencie suas conexões com empresas parceiras</p>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        
      </div>

      <div className="mb-6">
        <CompanySearchBar searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
      </div>

      {pendingCompanies.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3">Convites de Empresas</h2>
          <p className="text-sm text-gray-500 mb-4">
            Empresas que convidaram você para conexão. Aceite para disponibilizar seus serviços aos funcionários.
          </p>
          <CompanyList 
            companies={pendingCompanies} 
            isLoading={isLoading} 
            onViewDetails={handleViewCompanyDetails} 
            refreshCompanies={loadCompanies} 
            listType="pending" 
          />
        </div>
      )}

      {requestedCompanies.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3">Solicitações Enviadas</h2>
          <p className="text-sm text-gray-500 mb-4">
            Solicitações de conexão enviadas por você às empresas. Aguarde aprovação.
          </p>
          <CompanyList 
            companies={requestedCompanies} 
            isLoading={isLoading} 
            onViewDetails={handleViewCompanyDetails} 
            refreshCompanies={loadCompanies} 
            listType="requested" 
          />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3 text-neutral-700">Empresas Conectadas</h2>
        <CompanyList 
          companies={activeCompanies} 
          isLoading={isLoading} 
          onViewDetails={handleViewCompanyDetails} 
          refreshCompanies={loadCompanies} 
          listType="active" 
        />
      </div>
      
      {/* Dialog para buscar e conectar com empresas */}
      <CompanySearchDialog 
        open={isSearchDialogOpen} 
        onOpenChange={setIsSearchDialogOpen} 
        searchQuery={searchQuery} 
        onSearchQueryChange={setSearchQuery} 
        onSearch={() => handleSearchCompanies(searchQuery)} 
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

// Importar o hook useCompanySearch após a definição do componente
import { useCompanySearch } from './hooks/useCompanySearch';

export default PsychologistCompaniesContainer;
