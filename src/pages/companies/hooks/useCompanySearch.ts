
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { CompanySearchResult } from '../types';
import { searchAvailableCompanies, requestCompanyConnection } from '../companiesService';

export const useCompanySearch = (onConnectionRequestComplete: () => Promise<void>) => {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearchCompanies = async (searchQuery: string) => {
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

      // Close the dialog and update the list
      setIsSearchDialogOpen(false);
      
      // Reload the connected companies list
      await onConnectionRequestComplete();
    } catch (error) {
      console.error('Erro ao solicitar conexão:', error);
      toast({
        title: "Erro na solicitação",
        description: "Não foi possível solicitar conexão com esta empresa.",
        variant: "destructive"
      });
    }
  };

  return {
    isSearchDialogOpen,
    setIsSearchDialogOpen,
    searchResults,
    isSearching,
    handleSearchCompanies,
    handleRequestConnection
  };
};
