
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Building2, Trash2 } from 'lucide-react';
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
  contact_email: string;
  email: string;
  cnpj: string;
  status: boolean;
  razao_social: string;
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
      company.contact_email?.toLowerCase().includes(searchLower) ||
      company.email?.toLowerCase().includes(searchLower) ||
      company.cnpj?.includes(searchQuery) ||
      company.razao_social?.toLowerCase().includes(searchLower)
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
            <h1 className="text-3xl font-medium mb-2">Empresas</h1>
            <p className="text-gray-500">Gerencie todas as empresas cadastradas no sistema</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Search className="text-gray-400" size={20} />
                <Input
                  placeholder="Buscar empresa por nome, email ou CNPJ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando empresas...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Erro ao carregar dados. Por favor, tente novamente.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">Nome</TableHead>
                  <TableHead className="font-medium">Email de Contato</TableHead>
                  <TableHead className="font-medium">Email</TableHead>
                  <TableHead className="font-medium">CNPJ</TableHead>
                  <TableHead className="font-medium">Razão Social</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="text-right font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies && filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium flex items-center">
                        <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                        {company.name}
                      </TableCell>
                      <TableCell>{company.contact_email}</TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>{company.cnpj}</TableCell>
                      <TableCell>{company.razao_social}</TableCell>
                      <TableCell>
                        <Badge 
                          className={company.status ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}
                        >
                          {company.status ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchQuery 
                        ? 'Nenhuma empresa encontrada para essa busca.' 
                        : 'Nenhuma empresa cadastrada no sistema.'}
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
