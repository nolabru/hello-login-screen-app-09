
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Eye, Unlink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Company } from './types';
import { useToast } from '@/components/ui/use-toast';
import { disconnectFromCompany } from './companiesService';

interface CompanyListProps {
  companies: Company[];
  isLoading: boolean;
  onViewDetails: (company: Company) => void;
  onDisconnect?: (companyId: number) => void;
  refreshCompanies: () => void;
}

const CompanyList: React.FC<CompanyListProps> = ({ 
  companies, 
  isLoading, 
  onViewDetails,
  refreshCompanies
}) => {
  const { toast } = useToast();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ativa</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejeitada</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };
  
  const handleDisconnectFromCompany = async (companyId: number) => {
    try {
      if (!confirm('Tem certeza que deseja se desconectar desta empresa? Isso removerá também todas as conexões com seus funcionários.')) {
        return;
      }
      
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('ID do psicólogo não encontrado');
      }
      
      await disconnectFromCompany(companyId, psychologistId);
      
      toast({
        title: 'Desconectado com sucesso',
        description: 'Você foi desconectado desta empresa e seus funcionários',
      });
      
      // Refresh the company list
      refreshCompanies();
    } catch (error) {
      console.error('Erro ao desconectar da empresa:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao desconectar',
        description: 'Não foi possível desconectar da empresa. Tente novamente.',
      });
    }
  };
  
  return (
    <div>
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando empresas...</p>
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Card key={company.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Building2 className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-medium">{company.name}</h3>
                </div>
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-gray-500">{company.contact_email}</p>
                  <div>
                    {getStatusBadge(company.connection_status)}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => onViewDetails(company)}
                  >
                    <Eye className="h-4 w-4" />
                    Detalhes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 border-red-300 text-red-500 hover:bg-red-50"
                    onClick={() => handleDisconnectFromCompany(company.id)}
                  >
                    <Unlink className="h-4 w-4" />
                    Desconectar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma empresa encontrada</h3>
          <p className="text-gray-500 mb-4">
            Você ainda não está conectado a nenhuma empresa.
          </p>
          <p className="text-sm text-gray-400">
            Utilize o botão "Solicitar Conexão" para se conectar a uma empresa.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
