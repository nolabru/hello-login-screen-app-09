
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Key, Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableHead, 
  TableRow, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface License {
  id: number;
  company_id: number;
  plan_id: number;
  total_licenses: number;
  used_licenses: number;
  status: string;
  payment_status: string;
  start_date: string;
  expiry_date: string;
  company_name?: string;
  plan_name?: string;
}

const AdminLicenses: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<License | null>(null);

  const { data: licenses, isLoading, error } = useQuery({
    queryKey: ['adminLicenses'],
    queryFn: async () => {
      // Fetch licenses with company and plan information
      const { data, error } = await supabase
        .from('company_licenses')
        .select(`
          *,
          companies:company_id(name),
          plans:plan_id(name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching licenses:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar a lista de licenças.",
          variant: "destructive"
        });
        throw error;
      }
      
      // Transform the data to include company name and plan name
      const licensesData = data.map(license => ({
        ...license,
        company_name: license.companies?.name || 'Não informado',
        plan_name: license.plans?.name || 'Não informado'
      })) as License[];
      
      return licensesData;
    }
  });
  
  const filteredLicenses = licenses?.filter(license => {
    const searchLower = searchQuery.toLowerCase();
    return (
      license.company_name?.toLowerCase().includes(searchLower) ||
      license.plan_name?.toLowerCase().includes(searchLower) ||
      license.status?.toLowerCase().includes(searchLower) ||
      license.payment_status?.toLowerCase().includes(searchLower)
    );
  });
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return 'Data inválida';
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'expired':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    }
  };
  
  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    }
  };

  const handleDeleteClick = (license: License) => {
    setLicenseToDelete(license);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!licenseToDelete) return;
    
    try {
      const { error } = await supabase
        .from('company_licenses')
        .delete()
        .eq('id', licenseToDelete.id);

      if (error) throw error;

      toast({
        title: "Licença removida",
        description: `A licença da empresa ${licenseToDelete.company_name} foi removida com sucesso.`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['adminLicenses'] });
    } catch (error) {
      console.error("Error deleting license:", error);
      toast({
        title: "Erro ao remover licença",
        description: "Não foi possível remover a licença. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setLicenseToDelete(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Licenças | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-medium mb-2">Licenças</h1>
            <p className="text-gray-500">Gerencie todas as licenças adquiridas pelas empresas</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Search className="text-gray-400" size={20} />
                <Input
                  placeholder="Buscar licença por empresa ou plano..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando licenças...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Erro ao carregar dados. Por favor, tente novamente.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">Empresa</TableHead>
                  <TableHead className="font-medium">Plano</TableHead>
                  <TableHead className="font-medium">Total de Licenças</TableHead>
                  <TableHead className="font-medium">Licenças Utilizadas</TableHead>
                  <TableHead className="font-medium">Data de Início</TableHead>
                  <TableHead className="font-medium">Data de Expiração</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Pagamento</TableHead>
                  <TableHead className="text-right font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses && filteredLicenses.length > 0 ? (
                  filteredLicenses.map((license) => (
                    <TableRow key={license.id}>
                      <TableCell className="font-medium">{license.company_name}</TableCell>
                      <TableCell>{license.plan_name}</TableCell>
                      <TableCell>{license.total_licenses}</TableCell>
                      <TableCell>
                        {license.used_licenses} / {license.total_licenses}
                      </TableCell>
                      <TableCell>{formatDate(license.start_date)}</TableCell>
                      <TableCell>{formatDate(license.expiry_date)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(license.status)}>
                          {license.status === 'active' ? 'Ativa' : 
                           license.status === 'expired' ? 'Expirada' : 
                           license.status === 'canceled' ? 'Cancelada' : 
                           license.status === 'pending' ? 'Pendente' : 
                           license.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusBadgeClass(license.payment_status)}>
                          {license.payment_status === 'completed' ? 'Concluído' : 
                           license.payment_status === 'pending' ? 'Pendente' : 
                           license.payment_status === 'failed' ? 'Falhou' : 
                           license.payment_status === 'canceled' ? 'Cancelado' : 
                           license.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(license)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {searchQuery 
                        ? 'Nenhuma licença encontrada para essa busca.' 
                        : 'Nenhuma licença cadastrada no sistema.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </AdminDashboardLayout>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a licença da empresa {licenseToDelete?.company_name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminLicenses;
