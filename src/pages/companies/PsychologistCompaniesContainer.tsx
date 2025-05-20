
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
