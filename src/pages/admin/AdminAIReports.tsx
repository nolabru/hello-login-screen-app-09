import React, { useState, useEffect } from 'react';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Eye, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';

type AIReport = Tables<'ai_content_reports'> & {
  user_profile?: any;
};

const AdminAIReports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<AIReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<AIReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    resolved: 0,
    dismissed: 0
  });

  const categoryLabels = {
    'offensive_content': 'Conteúdo Ofensivo',
    'incorrect_information': 'Informações Incorretas',
    'inappropriate_content': 'Conteúdo Inadequado',
    'dangerous_content': 'Conteúdo Perigoso',
    'strange_behavior': 'Comportamento Estranho',
    'other': 'Outros'
  };

  const statusLabels = {
    'pending': 'Pendente',
    'under_review': 'Em Análise',
    'resolved': 'Resolvido',
    'dismissed': 'Arquivado'
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'under_review': 'bg-blue-100 text-blue-800',
    'resolved': 'bg-green-100 text-green-800',
    'dismissed': 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, categoryFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_content_reports')
        .select(`
          *,
          user_profile:user_profiles!ai_content_reports_user_id_fkey(
            preferred_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReports(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching AI reports:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar denúncias',
        description: 'Não foi possível carregar as denúncias de IA.'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reportsData: AIReport[]) => {
    const newStats = {
      total: reportsData.length,
      pending: reportsData.filter(r => r.status === 'pending').length,
      under_review: reportsData.filter(r => r.status === 'under_review').length,
      resolved: reportsData.filter(r => r.status === 'resolved').length,
      dismissed: reportsData.filter(r => r.status === 'dismissed').length
    };
    setStats(newStats);
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.user_profile?.preferred_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }

    setFilteredReports(filtered);
  };

  const updateReportStatus = async (reportId: string, newStatus: string, notes?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus !== 'pending') {
        updateData.reviewed_by = (await supabase.auth.getUser()).data.user?.id;
        updateData.reviewed_at = new Date().toISOString();
      }

      if (notes) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from('ai_content_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Status atualizado',
        description: `Denúncia marcada como ${statusLabels[newStatus as keyof typeof statusLabels]}.`
      });

      fetchReports();
      setSelectedReport(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status da denúncia.'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-portal-purple"></div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Denúncias de Conteúdo IA</h1>
          <p className="text-gray-500 mt-2">Gerenciamento de conformidade e moderação de conteúdo</p>
        </header>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.under_review}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Arquivados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.dismissed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descrição ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="under_review">Em Análise</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="dismissed">Arquivado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="offensive_content">Conteúdo Ofensivo</SelectItem>
                  <SelectItem value="incorrect_information">Informações Incorretas</SelectItem>
                  <SelectItem value="inappropriate_content">Conteúdo Inadequado</SelectItem>
                  <SelectItem value="dangerous_content">Conteúdo Perigoso</SelectItem>
                  <SelectItem value="strange_behavior">Comportamento Estranho</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Denúncias */}
        <Card>
          <CardHeader>
            <CardTitle>Denúncias ({filteredReports.length})</CardTitle>
            <CardDescription>
              Lista de todas as denúncias de conteúdo gerado pela IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma denúncia encontrada com os filtros aplicados.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                            {statusLabels[report.status as keyof typeof statusLabels]}
                          </Badge>
                          <Badge variant="outline">
                            {categoryLabels[report.category as keyof typeof categoryLabels]}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(report.created_at)}
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">
                            <strong>Usuário:</strong> {report.user_profile?.preferred_name || 'Usuário desconhecido'} 
                            ({report.user_profile?.email || 'Email não disponível'})
                          </p>
                        </div>
                        
                        <p className="text-sm mb-2">
                          <strong>Descrição:</strong> {report.description}
                        </p>
                        
                        <p className="text-xs text-gray-500">
                          <strong>Incidente em:</strong> {formatDate(report.timestamp_of_incident)}
                        </p>
                        
                        {report.admin_notes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-blue-800">
                              <strong>Notas do Admin:</strong> {report.admin_notes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setAdminNotes(report.admin_notes || '');
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Analisar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Análise de Denúncia</DialogTitle>
                              <DialogDescription>
                                Revisar e tomar ação sobre a denúncia de conteúdo IA
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedReport && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Status Atual</label>
                                    <Badge className={statusColors[selectedReport.status as keyof typeof statusColors]}>
                                      {statusLabels[selectedReport.status as keyof typeof statusLabels]}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Categoria</label>
                                    <p className="text-sm">{categoryLabels[selectedReport.category as keyof typeof categoryLabels]}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Usuário</label>
                                  <p className="text-sm">{selectedReport.user_profile?.preferred_name} ({selectedReport.user_profile?.email})</p>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Descrição da Denúncia</label>
                                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedReport.description}</p>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Data do Incidente</label>
                                  <p className="text-sm">{formatDate(selectedReport.timestamp_of_incident)}</p>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Notas Administrativas</label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Adicione notas sobre a análise..."
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex gap-2 pt-4">
                                  {selectedReport.status === 'pending' && (
                                    <Button
                                      onClick={() => updateReportStatus(selectedReport.id, 'under_review', adminNotes)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Marcar em Análise
                                    </Button>
                                  )}
                                  
                                  {(selectedReport.status === 'pending' || selectedReport.status === 'under_review') && (
                                    <>
                                      <Button
                                        onClick={() => updateReportStatus(selectedReport.id, 'resolved', adminNotes)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Resolver
                                      </Button>
                                      
                                      <Button
                                        onClick={() => updateReportStatus(selectedReport.id, 'dismissed', adminNotes)}
                                        variant="outline"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Arquivar
                                      </Button>
                                    </>
                                  )}
                                  
                                  {adminNotes !== (selectedReport.admin_notes || '') && (
                                    <Button
                                      onClick={() => updateReportStatus(selectedReport.id, selectedReport.status, adminNotes)}
                                      variant="outline"
                                    >
                                      Salvar Notas
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminAIReports;
