import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TableCell, TableRow, TableBody, TableHead, TableHeader, Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, UserMinus, UserCheck, UserX } from 'lucide-react';
import { Company } from './types';
import { useToast } from '@/components/ui/use-toast';
import { disconnectFromCompany, acceptCompanyRequest } from '@/integrations/supabase/companyPsychologistsService';
import { useIsMobile } from '@/hooks/use-mobile';

interface CompanyListProps {
  companies: Company[];
  isLoading: boolean;
  onViewDetails: (company: Company) => void;
  refreshCompanies: () => void;
  listType?: 'pending' | 'requested' | 'active';
}

const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  isLoading,
  onViewDetails,
  refreshCompanies,
  listType = 'active'
}) => {
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const handleDisconnect = async (companyId: number) => {
    if (!confirm('Tem certeza que deseja se desconectar desta empresa?')) {
      return;
    }
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) return;
      await disconnectFromCompany(String(companyId), psychologistId);
      toast({
        title: "Desconexão bem-sucedida",
        description: "Você foi desconectado da empresa com sucesso."
      });
      refreshCompanies();
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: "Erro na Desconexão",
        description: "Não foi possível desconectar da empresa. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  const handleAcceptRequest = async (companyId: number) => {
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) return;
      await acceptCompanyRequest(String(companyId), psychologistId);
      toast({
        title: "Empresa conectada",
        description: "Conexão com a empresa aceita com sucesso."
      });
      refreshCompanies();
    } catch (error) {
      console.error('Erro ao aceitar conexão:', error);
      toast({
        title: "Erro ao aceitar",
        description: "Não foi possível aceitar a conexão. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-blue-500">Aguardando sua aceitação</Badge>;
      case 'requested':
        return <Badge className="bg-yellow-500">Aguardando aprovação</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };
  if (isLoading) {
    return <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="p-8 text-center">
            <p className="text-gray-500">Carregando empresas...</p>
          </div>
        </CardContent>
      </Card>;
  }
  if (companies.length === 0) {
    return <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="p-8 text-center">
            <p className="text-lg font-medium text-neutral-700 font-display">
              {listType === 'pending' ? 'Nenhum convite de empresa pendente.' : listType === 'requested' ? 'Nenhuma solicitação de conexão enviada.' : 'Nenhuma Empresa Conectada.'}
            </p>
            {listType === 'active' && <p className="mt-2 text-sm font-normal text-gray-500">Conecte-se com uma empresa para visualizá-la.</p>}
          </div>
        </CardContent>
      </Card>;
  }
  if (isMobile) {
    return <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {companies.map(company => <div key={company.id} className="p-4">
                <h3 className="font-medium text-lg">{company.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{company.corp_email}</p>
                <div className="mt-2">
                  {getStatusBadge(company.connection_status)}
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {company.connection_status === 'pending' ? <>
                      <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAcceptRequest(company.id)}>
                        <UserCheck size={16} className="mr-1" />
                        Aceitar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-300 hover:bg-red-50" onClick={() => handleDisconnect(company.id)}>
                        <UserX size={16} className="mr-1" />
                        Recusar
                      </Button>
                    </> : company.connection_status === 'active' ? <>
                      {/* Botão de desconectar removido */}
                    </> : <Button variant="outline" size="sm" className="text-red-500 border-red-300 hover:bg-red-50" onClick={() => handleDisconnect(company.id)}>
                      <UserX size={16} className="mr-1" />
                      Cancelar
                    </Button>}
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium">Empresa</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map(company => <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.corp_email}</TableCell>
                <TableCell>{getStatusBadge(company.connection_status)}</TableCell>
                <TableCell className="text-right space-x-2">
                  {company.connection_status === 'pending' ? <>
                      <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAcceptRequest(company.id)}>
                        <UserCheck size={16} className="mr-1" />
                        Aceitar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-300 hover:bg-red-50" onClick={() => handleDisconnect(company.id)}>
                        <UserX size={16} className="mr-1" />
                        Recusar
                      </Button>
                    </> : company.connection_status === 'active' ? <>
                      {/* Botão de desconectar removido */}
                    </> : <Button variant="outline" size="sm" className="text-red-500 border-red-300 hover:bg-red-50" onClick={() => handleDisconnect(company.id)}>
                      <UserX size={16} className="mr-1" />
                      Cancelar
                    </Button>}
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </CardContent>
    </Card>;
};

export default CompanyList;
