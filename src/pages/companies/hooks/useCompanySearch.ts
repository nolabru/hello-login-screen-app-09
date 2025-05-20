
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { searchAvailableCompanies, requestCompanyConnection } from '../companiesService';
import { CompanySearchResult } from '../types';

export const useCompanySearch = (onSuccess: () => void) => {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearchCompanies = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('ID do psicólogo não encontrado');
      }

      const results = await searchAvailableCompanies(query, psychologistId);
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
        throw new Error('ID do psicólogo não encontrado');
      }

      await requestCompanyConnection(companyId, psychologistId);
      
      toast({
        title: "Solicitação enviada",
        description: "Solicitação de conexão enviada com sucesso.",
      });

      // Close dialog and refresh companies list
      setIsSearchDialogOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Erro ao solicitar conexão:', error);
      toast({
        title: "Erro na solicitação",
        description: "Não foi possível enviar a solicitação. Tente novamente.",
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
