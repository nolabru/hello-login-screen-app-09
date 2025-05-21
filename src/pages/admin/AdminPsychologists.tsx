
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2 } from 'lucide-react';
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

interface Psychologist {
  id: number;
  nome: string;
  email: string;
  crp: string;
  especialidade: string | null;
  status: boolean;
  phone: string | null;
}

const AdminPsychologists: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [psychologistToDelete, setPsychologistToDelete] = useState<Psychologist | null>(null);

  const { data: psychologists, isLoading, error } = useQuery({
    queryKey: ['adminPsychologists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('psychologists')
        .select('*')
        .order('nome', { ascending: true });
        
      if (error) {
        console.error("Error fetching psychologists:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar a lista de psicólogos.",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Psychologist[];
    }
  });
  
  const filteredPsychologists = psychologists?.filter(psychologist => {
    const searchLower = searchQuery.toLowerCase();
    return (
      psychologist.nome?.toLowerCase().includes(searchLower) ||
      psychologist.email?.toLowerCase().includes(searchLower) ||
      psychologist.crp?.toLowerCase().includes(searchLower) ||
      psychologist.especialidade?.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteClick = (psychologist: Psychologist) => {
    setPsychologistToDelete(psychologist);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!psychologistToDelete) return;
    
    try {
      const { error } = await supabase
        .from('psychologists')
        .delete()
        .eq('id', psychologistToDelete.id);

      if (error) throw error;

      toast({
        title: "Psicólogo removido",
        description: `O psicólogo ${psychologistToDelete.nome} foi removido com sucesso.`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['adminPsychologists'] });
    } catch (error) {
      console.error("Error deleting psychologist:", error);
      toast({
        title: "Erro ao remover psicólogo",
        description: "Não foi possível remover o psicólogo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setPsychologistToDelete(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Psicólogos | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-medium mb-2">Psicólogos</h1>
            <p className="text-gray-500">Gerencie todos os psicólogos cadastrados no sistema</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Search className="text-gray-400" size={20} />
                <Input
                  placeholder="Buscar psicólogo por nome, email ou CRP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando psicólogos...</p>
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
                  <TableHead className="font-medium">Email</TableHead>
                  <TableHead className="font-medium">CRP</TableHead>
                  <TableHead className="font-medium">Especialidade</TableHead>
                  <TableHead className="font-medium">Telefone</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="text-right font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPsychologists && filteredPsychologists.length > 0 ? (
                  filteredPsychologists.map((psychologist) => (
                    <TableRow key={psychologist.id}>
                      <TableCell className="font-medium">{psychologist.nome}</TableCell>
                      <TableCell>{psychologist.email}</TableCell>
                      <TableCell>{psychologist.crp}</TableCell>
                      <TableCell>{psychologist.especialidade || '-'}</TableCell>
                      <TableCell>{psychologist.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          className={psychologist.status ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}
                        >
                          {psychologist.status ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(psychologist)}
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
                        ? 'Nenhum psicólogo encontrado para essa busca.' 
                        : 'Nenhum psicólogo cadastrado no sistema.'}
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
              Tem certeza que deseja excluir o psicólogo {psychologistToDelete?.nome}? Esta ação não pode ser desfeita.
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

export default AdminPsychologists;
