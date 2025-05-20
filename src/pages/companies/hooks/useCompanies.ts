
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Company } from '../types';
import { fetchCompanyConnections } from '../companiesService';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Load companies
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

  // Filter companies based on search query
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

  // Initial load
  useEffect(() => {
    loadCompanies();
  }, [toast]);

  return {
    companies,
    filteredCompanies,
    isLoading,
    searchQuery,
    setSearchQuery,
    loadCompanies
  };
};
