import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit2, Trash2, Users, Building2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Department = Tables<'company_departments'>;

const CompanyDepartments: React.FC = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form states
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  
  // Employee count for each department
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
      fetchDepartments(storedCompanyId);
    }
  }, []);

  const fetchDepartments = async (companyId: string) => {
    setLoading(true);
    try {
      // Fetch departments
      const { data: depts, error } = await supabase
        .from('company_departments')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) throw error;

      setDepartments(depts || []);

      // Fetch employee counts for each department
      if (depts && depts.length > 0) {
        const counts: Record<string, number> = {};
        
        for (const dept of depts) {
          const { count } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('department_id', dept.id);
          
          counts[dept.id] = count || 0;
        }
        
        setEmployeeCounts(counts);
      }
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar setores',
        description: 'Não foi possível carregar a lista de setores.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!companyId || !newDepartmentName.trim()) return;

    try {
      const { error } = await supabase
        .from('company_departments')
        .insert({
          company_id: companyId,
          name: newDepartmentName.trim(),
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: 'Setor criado',
        description: `O setor "${newDepartmentName}" foi criado com sucesso.`
      });

      setNewDepartmentName('');
      setIsAddDialogOpen(false);
      fetchDepartments(companyId);
    } catch (error) {
      console.error('Erro ao criar setor:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar setor',
        description: 'Não foi possível criar o setor. Tente novamente.'
      });
    }
  };

  const handleEditDepartment = async () => {
    if (!editingDepartment || !editingDepartment.name.trim()) return;

    try {
      const { error } = await supabase
        .from('company_departments')
        .update({
          name: editingDepartment.name.trim()
        })
        .eq('id', editingDepartment.id);

      if (error) throw error;

      toast({
        title: 'Setor atualizado',
        description: 'O nome do setor foi atualizado com sucesso.'
      });

      setEditingDepartment(null);
      setIsEditDialogOpen(false);
      if (companyId) fetchDepartments(companyId);
    } catch (error) {
      console.error('Erro ao atualizar setor:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar setor',
        description: 'Não foi possível atualizar o setor. Tente novamente.'
      });
    }
  };

  const handleDeleteDepartment = async () => {
    if (!deletingDepartment) return;

    try {
      // Check if department has employees
      const employeeCount = employeeCounts[deletingDepartment.id] || 0;
      
      if (employeeCount > 0) {
        toast({
          variant: 'destructive',
          title: 'Não é possível excluir',
          description: `Este setor possui ${employeeCount} funcionário(s) vinculado(s). Transfira os funcionários antes de excluir o setor.`
        });
        setIsDeleteDialogOpen(false);
        return;
      }

      const { error } = await supabase
        .from('company_departments')
        .delete()
        .eq('id', deletingDepartment.id);

      if (error) throw error;

      toast({
        title: 'Setor excluído',
        description: 'O setor foi excluído com sucesso.'
      });

      setDeletingDepartment(null);
      setIsDeleteDialogOpen(false);
      if (companyId) fetchDepartments(companyId);
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir setor',
        description: 'Não foi possível excluir o setor. Tente novamente.'
      });
    }
  };

  if (loading) {
    return (
      <CompanyDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando setores...</p>
        </div>
      </CompanyDashboardLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Setores | Área da Empresa</title>
      </Helmet>
      <CompanyDashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-medium text-neutral-700">Gerenciar Setores</h1>
              <p className="text-gray-500">Organize seus funcionários por departamentos</p>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-portal-purple hover:bg-portal-purple-dark"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Setor
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-portal-purple" />
                  <div>
                    <p className="text-sm text-gray-500">Total de Setores</p>
                    <p className="text-2xl font-bold">{departments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Funcionários Alocados</p>
                    <p className="text-2xl font-bold">
                      {Object.values(employeeCounts).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Setores Ativos</p>
                    <p className="text-2xl font-bold">
                      {departments.filter(d => d.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Departments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Setores</CardTitle>
            </CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Nenhum setor cadastrado</p>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Setor
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Setor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Funcionários</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={dept.status === 'active' ? 'default' : 'secondary'}
                          >
                            {dept.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{employeeCounts[dept.id] || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(dept.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingDepartment(dept);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                setDeletingDepartment(dept);
                                setIsDeleteDialogOpen(true);
                              }}
                              disabled={dept.name === 'Geral'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </CompanyDashboardLayout>

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Setor</DialogTitle>
            <DialogDescription>
              Crie um novo setor para organizar seus funcionários.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Setor</Label>
              <Input
                id="name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="Ex: Recursos Humanos, TI, Vendas..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddDepartment}
              disabled={!newDepartmentName.trim()}
              className="bg-portal-purple hover:bg-portal-purple-dark"
            >
              Criar Setor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Setor</DialogTitle>
            <DialogDescription>
              Altere o nome do setor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome do Setor</Label>
              <Input
                id="edit-name"
                value={editingDepartment?.name || ''}
                onChange={(e) => setEditingDepartment(prev => 
                  prev ? { ...prev, name: e.target.value } : null
                )}
                placeholder="Nome do setor"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditDepartment}
              disabled={!editingDepartment?.name.trim()}
              className="bg-portal-purple hover:bg-portal-purple-dark"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Setor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o setor "{deletingDepartment?.name}"?
              {employeeCounts[deletingDepartment?.id || ''] > 0 && (
                <span className="block mt-2 text-red-600">
                  Este setor possui {employeeCounts[deletingDepartment?.id || '']} funcionário(s) vinculado(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDepartment}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CompanyDepartments;
