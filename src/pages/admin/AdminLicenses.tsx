import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Key, Trash2, Users, Building2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { 
  Table, 
  TableHeader, 
  TableHead, 
  TableRow, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/search-bar';
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

interface CompanyLicenseData {
  company_id: string;
  company_name: string;
  plan_name: string;
  total_licenses: number;
  used_licenses: number;
  available_licenses: number;
  status: string;
  expiry_date: string | null;
  license_id?: number;
}

const AdminLicenses: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<CompanyLicenseData | null>(null);

  const { data: companyLicenses, isLoading, error } = useQuery({
    queryKey: ['adminLicenses'],
    queryFn: async () => {
      try {
        // 1. Buscar todas as empresas
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id, name, status')
          .order('name', { ascending: true });

        if (companiesError) throw companiesError;

        const companyLicenseData: CompanyLicenseData[] = [];

        // 2. Para cada empresa, calcular licenças e funcionários
        for (const company of companies || []) {
          // Buscar licença ativa da empresa com o plano
          const { data: companyLicense, error: licensesError } = await supabase
            .from('company_licenses')
            .select('id, plan_id, expiry_date, status')
            .eq('company_id', company.id.toString())
            .eq('status', 'active')
            .single();

          if (licensesError) {
            console.error(`Error fetching license for company ${company.id}:`, licensesError);
            // Se não tem licença, adicionar com valores zerados
            companyLicenseData.push({
              company_id: company.id.toString(),
              company_name: company.name,
              plan_name: 'Sem plano',
              total_licenses: 0,
              used_licenses: 0,
              available_licenses: 0,
              status: company.status ? 'active' : 'inactive',
              expiry_date: null,
              license_id: undefined
            });
            continue;
          }

          // Buscar detalhes do plano
          const { data: plan, error: planError } = await supabase
            .from('license_plans')
            .select('name, max_users')
            .eq('id', companyLicense.plan_id)
            .single();

          if (planError) {
            console.error(`Error fetching plan for company ${company.id}:`, planError);
            continue;
          }

          // Buscar funcionários ativos da empresa
          const { data: employees, error: employeesError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('company_id', company.id.toString())
            .not('company_id', 'is', null);

          if (employeesError) {
            console.error(`Error fetching employees for company ${company.id}:`, employeesError);
            continue;
          }

          // Calcular totais CORRETOS baseado no plano
          const totalLicenses = plan.max_users; // Licenças do plano
          const usedLicenses = employees?.length || 0; // Funcionários ativos
          const availableLicenses = totalLicenses - usedLicenses; // Disponíveis

          companyLicenseData.push({
            company_id: company.id.toString(),
            company_name: company.name,
            plan_name: plan.name,
            total_licenses: totalLicenses,
            used_licenses: usedLicenses,
            available_licenses: availableLicenses,
            status: company.status ? 'active' : 'inactive',
            expiry_date: companyLicense.expiry_date,
            license_id: companyLicense.id
          });
        }

        return companyLicenseData;
      } catch (error) {
        console.error("Error fetching licenses:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar a lista de licenças.",
          variant: "destructive"
        });
        throw error;
      }
    }
  });
  
  const filteredLicenses = companyLicenses?.filter(license => {
    const searchLower = searchQuery.toLowerCase();
    return (
      license.company_name?.toLowerCase().includes(searchLower) ||
      license.status?.toLowerCase().includes(searchLower)
    );
  });
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definida';
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
      case 'inactive':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getUsageBadgeClass = (used: number, total: number) => {
    const percentage = total > 0 ? (used / total) * 100 : 0;
    if (percentage >= 90) return 'bg-red-100 text-red-800 hover:bg-red-100';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    return 'bg-green-100 text-green-800 hover:bg-green-100';
  };

  const handleDeleteClick = (license: CompanyLicenseData) => {
    setLicenseToDelete(license);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!licenseToDelete || !licenseToDelete.license_id) return;
    
    try {
      const { error } = await supabase
        .from('company_licenses')
        .delete()
        .eq('id', licenseToDelete.license_id);

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
            <h1 className="text-2xl font-medium text-neutral-700">Licenças por Empresa</h1>
            <p className="text-gray-500">Visualize o uso de licenças de cada empresa cadastrada</p>
          </div>

          <SearchBar
            placeholder="Buscar empresa por nome ou status..."
            value={searchQuery}
            onChange={setSearchQuery}
          />

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando dados de licenças...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Erro ao carregar dados. Por favor, tente novamente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium w-[200px]">Empresa</TableHead>
                    <TableHead className="font-medium w-[120px]">Plano</TableHead>
                    <TableHead className="font-medium w-[120px]">Total de Licenças</TableHead>
                    <TableHead className="font-medium w-[120px]">Funcionários Ativos</TableHead>
                    <TableHead className="font-medium w-[120px]">Licenças Disponíveis</TableHead>
                    <TableHead className="font-medium w-[100px]">Uso</TableHead>
                    <TableHead className="font-medium w-[120px]">Próxima Expiração</TableHead>
                    <TableHead className="font-medium w-[80px]">Status</TableHead>
                    <TableHead className="text-right font-medium w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLicenses && filteredLicenses.length > 0 ? (
                    filteredLicenses.map((license) => (
                      <TableRow key={license.company_id}>
                        <TableCell className="font-medium w-[200px]">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                            <span className="truncate">{license.company_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <Badge variant="outline" className="text-xs">
                            {license.plan_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <div className="flex items-center">
                            <Key className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="font-semibold">{license.total_licenses}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-green-500 mr-2" />
                            <span className="font-semibold">{license.used_licenses}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <span className={`font-semibold ${license.available_licenses < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {license.available_licenses}
                          </span>
                        </TableCell>
                        <TableCell className="w-[100px]">
                          <Badge className={getUsageBadgeClass(license.used_licenses, license.total_licenses)}>
                            {license.total_licenses > 0 
                              ? `${Math.round((license.used_licenses / license.total_licenses) * 100)}%`
                              : '0%'
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <span className="text-sm">
                            {formatDate(license.expiry_date)}
                          </span>
                        </TableCell>
                        <TableCell className="w-[80px]">
                          <Badge className={getStatusBadgeClass(license.status)}>
                            {license.status === 'active' ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right w-[80px]">
                          {license.license_id && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(license)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        {searchQuery 
                          ? 'Nenhuma empresa encontrada para essa busca.' 
                          : 'Nenhuma empresa cadastrada no sistema.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </AdminDashboardLayout>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a licença da empresa {licenseToDelete?.company_name}? Esta ação não pode ser desfeita e pode afetar o acesso dos funcionários.
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
