
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Trash2 } from 'lucide-react';
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
import { SearchBar } from '@/components/ui/search-bar';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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

interface Company {
  id: number;
  name: string;
  corp_email: string;
  email: string;
  cnpj: string;
  status: boolean;
  legal_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

const AdminCompanies: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['adminCompanies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) {
        console.error("Error fetching companies:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar a lista de empresas.",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Company[];
    }
  });
  
  const filteredCompanies = companies?.filter(company => {
    const searchLower = searchQuery.toLowerCase();
    return (
      company.name?.toLowerCase().includes(searchLower) ||
      company.corp_email?.toLowerCase().includes(searchLower) ||
      company.email?.toLowerCase().includes(searchLower) ||
      company.cnpj?.includes(searchQuery) ||
      company.legal_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;
    
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyToDelete.id);

      if (error) throw error;

      toast({
        title: "Empresa removida",
        description: `A empresa ${companyToDelete.name} foi removida com sucesso.`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['adminCompanies'] });
    } catch (error) {
      console.error("Error deleting company:", error);
      toast({
        title: "Erro ao remover empresa",
        description: "Não foi possível remover a empresa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Empresas | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-neutral-700">Empresas</h1>
            <p className="text-gray-500">Gerencie todas as empresas cadastradas no sistema</p>
          </div>

          <SearchBar
            placeholder="Buscar empresa por nome, email, CNPJ ou razão social..."
            value={searchQuery}
            onChange={setSearchQuery}
          />

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando empresas...</p>
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
                    <TableHead className="font-medium w-[200px]">Nome</TableHead>
                    <TableHead className="font-medium w-[250px]">Email</TableHead>
                    <TableHead className="font-medium w-[150px]">CNPJ</TableHead>
                    <TableHead className="font-medium w-[300px]">Razão Social</TableHead>
                    <TableHead className="font-medium w-[100px]">Status</TableHead>
                    <TableHead className="text-right font-medium w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies && filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium w-[200px]">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                            <span className="truncate">{company.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[250px]">
                          <span className="truncate block">{company.corp_email || company.email || '-'}</span>
                        </TableCell>
                        <TableCell className="w-[150px]">
                          <span className="font-mono text-sm">{company.cnpj || '-'}</span>
                        </TableCell>
                        <TableCell className="w-[300px]">
                          <span className="truncate block">{company.legal_name || '-'}</span>
                        </TableCell>
                        <TableCell className="w-[100px]">
                          <Badge 
                            className={company.status ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}
                          >
                            {company.status ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right w-[80px]">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(company)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
              Tem certeza que deseja excluir a empresa {companyToDelete?.name}? Esta ação não pode ser desfeita.
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

export default AdminCompanies;
