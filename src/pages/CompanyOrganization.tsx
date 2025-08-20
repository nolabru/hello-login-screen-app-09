import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';
import CompanyEmployeesList from '@/components/dashboard/company/CompanyEmployeesList';
import CompanyPsychologistsList from '@/components/dashboard/company/CompanyPsychologistsList';
import CompanyLicensesManagement from '@/components/dashboard/company/CompanyLicensesManagement';
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
import { 
  Users, 
  Building2, 
  Plus, 
  Edit2, 
  Trash2,
  Search,
  Filter,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Trophy,
  PieChart as PieChartIcon,
  Brain,
  CreditCard,
  UserCheck,
  Menu,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { useCompanySentimentData } from '@/hooks/useCompanySentimentData';

type Department = Tables<'company_departments'>;

const CompanyOrganization: React.FC = () => {
  const { toast } = useToast();
  const { wellBeingIndex } = useCompanySentimentData('week');
  
  // Estados gerais
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [activeTab, setActiveTab] = useState('funcionarios');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para setores
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});
  
  // Estados para análise de setores
  const [sectorAnalysisData, setSectorAnalysisData] = useState<any[]>([]);
  
  // Dialog states para setores
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form states para setores
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  // Dados mockados para gráficos
  const mockRiskDistribution = [
    { name: 'Baixo Risco', value: 65, color: '#059669' },
    { name: 'Risco Moderado', value: 28, color: '#D97706' },
    { name: 'Alto Risco', value: 7, color: '#DC2626' },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      const storedCompanyId = localStorage.getItem('companyId');
      const storedCompanyName = localStorage.getItem('companyName');
      
      if (storedCompanyId) {
        setCompanyId(storedCompanyId);
        setCompanyName(storedCompanyName || '');
        await fetchOrganizationData(storedCompanyId);
      }
    };

    fetchInitialData();
  }, []);

  const fetchOrganizationData = async (companyIdStr: string) => {
    setLoading(true);
    try {
      // Buscar setores
      const { data: depts, error } = await supabase
        .from('company_departments')
        .select('*')
        .eq('company_id', companyIdStr)
        .order('name');

      if (error) throw error;
      setDepartments(depts || []);

      // Buscar funcionários por setor
      const counts: Record<string, number> = {};
      const mockSectorData: any[] = [];

      if (depts && depts.length > 0) {
        for (const dept of depts) {
          const { count } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyIdStr)
            .eq('department_id', dept.id);
          
          const employeeCount = count || 0;
          counts[dept.id] = employeeCount;
          
          // Gerar dados mockados para análise
          const mockScore = 6.5 + (Math.random() * 2);
          const mockEngagement = Math.max(60, 70 + (Math.random() * 30));
          const mockAlerts = Math.floor(employeeCount * (0.02 + Math.random() * 0.08));
          
          mockSectorData.push({
            sector: dept.name,
            wellBeing: Number(mockScore.toFixed(1)),
            engagement: Math.round(mockEngagement),
            employees: employeeCount,
            alerts: mockAlerts,
            color: ['#645CBB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][depts.indexOf(dept) % 5]
          });
        }
      }

      setEmployeeCounts(counts);
      setSectorAnalysisData(mockSectorData);
    } catch (error) {
      console.error('Erro ao buscar dados da organização:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados da organização.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções para gestão de setores (reutilizadas)
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
      fetchOrganizationData(companyId);
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
        .update({ name: editingDepartment.name.trim() })
        .eq('id', editingDepartment.id);

      if (error) throw error;

      toast({
        title: 'Setor atualizado',
        description: 'O nome do setor foi atualizado com sucesso.'
      });

      setEditingDepartment(null);
      setIsEditDialogOpen(false);
      if (companyId) fetchOrganizationData(companyId);
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
      const employeeCount = employeeCounts[deletingDepartment.id] || 0;
      
      if (employeeCount > 0) {
        toast({
          variant: 'destructive',
          title: 'Não é possível excluir',
          description: `Este setor possui ${employeeCount} funcionário(s) vinculado(s).`
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
      if (companyId) fetchOrganizationData(companyId);
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir setor',
        description: 'Não foi possível excluir o setor.'
      });
    }
  };

  if (loading) {
    return (
      <CompanyDashboardLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando dados da organização...</p>
        </div>
      </CompanyDashboardLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Organização | {companyName}</title>
      </Helmet>
      <CompanyDashboardLayout>
        <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
          {/* Header Inteligente */}
          <Tabs 
            defaultValue="funcionarios" 
            className="w-full"
            onValueChange={setActiveTab}
          >
            {/* ⚡ HEADER INTELIGENTE - Ultra Compacto */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 lg:p-4">
                
                {/* 🎯 SEÇÃO ESQUERDA: Menu + Navegação Inteligente */}
                <div className="flex items-center gap-4 lg:gap-6">
                  {/* Menu Dropdown com Navegação */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="lg"
                        className="flex items-center gap-3 hover:bg-gray-50 transition-all duration-200"
                      >
                        <Menu className="h-5 w-5 text-gray-600" />
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-lg">Organização</span>
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 p-2">
                      <DropdownMenuItem 
                        onClick={() => setActiveTab('funcionarios')}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                          activeTab === 'funcionarios' 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          activeTab === 'funcionarios' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Users className={`h-4 w-4 ${
                            activeTab === 'funcionarios' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium">Funcionários</div>
                          <div className="text-xs text-gray-500">Equipe organizacional</div>
                        </div>
                        {activeTab === 'funcionarios' && (
                          <ChevronRight className="h-4 w-4 ml-auto text-blue-600" />
                        )}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => setActiveTab('psicologos')}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                          activeTab === 'psicologos' 
                            ? 'bg-purple-50 text-purple-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          activeTab === 'psicologos' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          <Brain className={`h-4 w-4 ${
                            activeTab === 'psicologos' ? 'text-purple-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium">Psicólogos</div>
                          <div className="text-xs text-gray-500">Rede especializada</div>
                        </div>
                        {activeTab === 'psicologos' && (
                          <ChevronRight className="h-4 w-4 ml-auto text-purple-600" />
                        )}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => setActiveTab('setores')}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                          activeTab === 'setores' 
                            ? 'bg-emerald-50 text-emerald-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          activeTab === 'setores' ? 'bg-emerald-100' : 'bg-gray-100'
                        }`}>
                          <Building2 className={`h-4 w-4 ${
                            activeTab === 'setores' ? 'text-emerald-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium">Setores</div>
                          <div className="text-xs text-gray-500">Estrutura organizacional</div>
                        </div>
                        {activeTab === 'setores' && (
                          <ChevronRight className="h-4 w-4 ml-auto text-emerald-600" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Aba Ativa Visual */}
                  <div className="hidden sm:flex items-center">
                    {activeTab === 'funcionarios' && (
                      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-xl border border-blue-200/50">
                        <div className="p-1.5 bg-blue-500 rounded-lg">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-blue-900 text-sm">Funcionários</div>
                          <div className="text-xs text-blue-600">Equipe ativa</div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'psicologos' && (
                      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-2 rounded-xl border border-purple-200/50">
                        <div className="p-1.5 bg-purple-500 rounded-lg">
                          <Brain className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-purple-900 text-sm">Psicólogos</div>
                          <div className="text-xs text-purple-600">Especialistas</div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'setores' && (
                      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-2 rounded-xl border border-emerald-200/50">
                        <div className="p-1.5 bg-emerald-500 rounded-lg">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-emerald-900 text-sm">Setores</div>
                          <div className="text-xs text-emerald-600">Estrutura</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 📊 SEÇÃO CENTRAL: Stats Contextuais Compactas */}
                <div className="hidden lg:flex items-center gap-6">
                  {activeTab === 'funcionarios' && (
                    <>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">
                          {Object.values(employeeCounts).reduce((sum, count) => sum + count, 0)} Total
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">
                          {Math.floor(Object.values(employeeCounts).reduce((sum, count) => sum + count, 0) * 0.85)} Ativos
                        </span>
                      </div>
                    </>
                  )}
                  
                  {activeTab === 'psicologos' && (
                    <>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">8 Ativos</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">42 Consultas</span>
                      </div>
                    </>
                  )}
                  
                  {activeTab === 'setores' && (
                    <>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">{departments.length} Setores</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">
                          {Object.values(employeeCounts).reduce((sum, count) => sum + count, 0)} Pessoas
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* 🚀 SEÇÃO DIREITA: Ações Compactas */}
                <div className="flex items-center gap-3">
                  {/* Busca Compacta */}
                  <div className="relative hidden sm:block">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-2 w-40 lg:w-48 text-sm border-gray-200 rounded-lg"
                    />
                  </div>
                  
                  {/* Filtro Compacto */}
                  <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="hidden lg:inline">Filtros</span>
                  </Button>
                  
                  {/* Botão Principal Contextual */}
                  {activeTab === 'funcionarios' && (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-sm font-medium"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Novo</span>
                      <span className="sm:hidden">+</span>
                    </Button>
                  )}
                  
                  {activeTab === 'psicologos' && (
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-sm font-medium"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Convidar</span>
                      <span className="sm:hidden">+</span>
                    </Button>
                  )}
                  
                  {activeTab === 'setores' && (
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-sm font-medium"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Novo</span>
                      <span className="sm:hidden">+</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* TAB 1: Setores */}
            <TabsContent value="setores" className="space-y-6">
              <Card className="shadow-sm border-gray-200">
                <CardContent className="p-6">
                  {departments.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">Nenhum setor cadastrado</p>
                      <p className="text-sm text-gray-400">
                        Use o botão "Novo Setor" no header para começar
                      </p>
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
                                className={dept.status === 'active' ? 'bg-emerald-600 text-white' : ''}
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
            </TabsContent>

            {/* TAB 2: Funcionários */}
            <TabsContent value="funcionarios" className="space-y-6">
              {/* Card Principal de Funcionários */}
              <Card className="shadow-sm border-gray-200">
                <CardContent className="p-6">
                  <CompanyEmployeesList />
                </CardContent>
              </Card>
              
              {/* Card de Licenças */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">Licenças</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Controle de licenças e acessos
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats de Licenças */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">12</div>
                        <div className="text-xs text-gray-500">Ativas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">3</div>
                        <div className="text-xs text-gray-500">Expirando</div>
                      </div>
                      <Button variant="outline" className="text-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Licença
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {companyId && <CompanyLicensesManagement companyId={companyId} />}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: Psicólogos */}
            <TabsContent value="psicologos" className="space-y-6">
              <Card className="shadow-sm border-gray-200">
                <CardContent className="p-6">
                  <CompanyPsychologistsList />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CompanyDashboardLayout>

      {/* Dialogs para Setores */}
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
              className="bg-calma hover:bg-calma-dark"
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
              className="bg-calma hover:bg-calma-dark"
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

export default CompanyOrganization;
