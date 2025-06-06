
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Company, CompanyDetail } from '../types';
import { fetchCompanyDetails } from '@/integrations/supabase/companyPsychologistsService';

export const useCompanyDetails = () => {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetail | null>(null);
  const { toast } = useToast();

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

  return {
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    selectedCompany,
    handleViewCompanyDetails
  };
};
