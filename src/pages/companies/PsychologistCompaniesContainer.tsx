
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import CompanyList from './CompanyList';
import CompanySearchBar from './CompanySearchBar';
import CompanySearchDialog from './CompanySearchDialog';
import CompanyDetailDialog from './CompanyDetailDialog';
import { useCompanies } from './hooks/useCompanies';
import { useCompanySearch } from './hooks/useCompanySearch';
import { useCompanyDetails } from './hooks/useCompanyDetails';
import { useIsMobile } from '@/hooks/use-mobile';

const PsychologistCompaniesContainer: React.FC = () => {
  // Use our custom hooks
  const { 
    filteredCompanies, 
    isLoading, 
    searchQuery, 
    setSearchQuery, 
    loadCompanies 
  } = useCompanies();

  const {
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    selectedCompany,
    handleViewCompanyDetails
  } = useCompanyDetails();

  const {
    isSearchDialogOpen,
    setIsSearchDialogOpen,
    searchResults,
    isSearching,
    handleSearchCompanies,
    handleRequestConnection
  } = useCompanySearch(loadCompanies);
  
  const isMobile = useIsMobile();

  // Group companies by status
  const pendingCompanies = filteredCompanies.filter(company => company.connection_status === 'pending');
  const requestedCompanies = filteredCompanies.filter(company => company.connection_status === 'requested');
  const activeCompanies = filteredCompanies.filter(company => company.connection_status === 'active');

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-medium">Empresas</h1>
          <p className="text-gray-500">Gerencie suas conexões com empresas</p>
        </div>
        <Button 
          className="bg-indigo-900 hover:bg-indigo-800 w-full md:w-auto"
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
        <h2 className="text-lg font-medium mb-3">Empresas Conectadas</h2>
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

export default PsychologistCompaniesContainer;
