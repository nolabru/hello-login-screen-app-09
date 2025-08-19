import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SearchBar } from '@/components/ui/search-bar';
import { 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Clock, 
  User, 
  MessageSquare,
  Shield,
  Zap,
  Brain,
  Flag,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';

type AIReport = Tables<'ai_content_reports'> & {
  user_profile?: any;
  admin_name?: string;
};

const AdminAIReports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<AIReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<AIReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [adminName, setAdminName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    resolved: 0,
    dismissed: 0,
    high_priority: 0,
    avg_resolution_time: 0
  });

  // Mapeamento dos valores do banco (português) para chaves internas (inglês)
  const categoryMapping = {
    // Versões com acento (do app mobile)
    'Conteúdo Ofensivo': 'offensive_content',
    'Informações Incorretas': 'incorrect_information',
    'Conteúdo Inadequado': 'inappropriate_content',
    'Conteúdo Perigoso': 'dangerous_content',
    'Comportamento Estranho': 'strange_behavior',
    'Outros': 'other',
    
    // Versões sem acento (compatibilidade)
    'Conteudo Ofensivo': 'offensive_content',
    'Informacoes Incorretas': 'incorrect_information',
    'Conteudo Inadequado': 'inappropriate_content',
    'Conteudo Perigoso': 'dangerous_content'
  };

  const categoryLabels = {
    'offensive_content': 'Conteúdo Ofensivo',
    'incorrect_information': 'Informações Incorretas',
    'inappropriate_content': 'Conteúdo Inadequado',
    'dangerous_content': 'Conteúdo Perigoso',
    'strange_behavior': 'Comportamento Estranho',
    'other': 'Outros'
  };

  const categoryIcons = {
    'offensive_content': Shield,
    'incorrect_information': AlertTriangle,
    'inappropriate_content': Flag,
    'dangerous_content': Zap,
    'strange_behavior': Brain,
    'other': MessageSquare
  };

  const categoryColors = {
    'offensive_content': 'bg-red-100 text-red-800 border-red-200',
    'incorrect_information': 'bg-orange-100 text-orange-800 border-orange-200',
    'inappropriate_content': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'dangerous_content': 'bg-red-100 text-red-800 border-red-200',
    'strange_behavior': 'bg-purple-100 text-purple-800 border-purple-200',
    'other': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const statusLabels = {
    'pending': 'Pendente',
    'under_review': 'Em Análise',
    'resolved': 'Resolvido',
    'dismissed': 'Arquivado'
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    'under_review': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    'resolved': 'bg-green-100 text-green-800 hover:bg-green-100',
    'dismissed': 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  };

  // Função para normalizar categoria do banco para chave interna
  const normalizeCategory = (dbCategory: string) => {
    return categoryMapping[dbCategory as keyof typeof categoryMapping] || 'other';
  };

  const getPriorityLevel = (category: string, description: string) => {
    const normalizedCategory = normalizeCategory(category);
    const highPriorityCategories = ['dangerous_content', 'offensive_content'];
    const urgentKeywords = ['urgente', 'grave', 'sério', 'perigoso', 'imediato'];
    
    if (highPriorityCategories.includes(normalizedCategory)) return 'high';
    if (urgentKeywords.some(keyword => description.toLowerCase().includes(keyword))) return 'high';
    if (normalizedCategory === 'inappropriate_content') return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  useEffect(() => {
    fetchReports();
    // Carregar nome do admin salvo
    const savedAdminName = localStorage.getItem('adminName');
    if (savedAdminName) {
      setAdminName(savedAdminName);
    }
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_content_reports')
        .select(`
          *,
          user_profile:user_profiles!ai_content_reports_user_id_fkey(
            preferred_name,
            email,
            profile_photo
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
    const highPriorityCount = reportsData.filter(r => 
      getPriorityLevel(r.category, r.description) === 'high'
    ).length;

    const resolvedReports = reportsData.filter(r => r.status === 'resolved');
    const avgResolutionTime = resolvedReports.length > 0 
      ? resolvedReports.reduce((acc, report) => {
          if (report.reviewed_at) {
            const created = new Date(report.created_at);
            const resolved = new Date(report.reviewed_at);
            return acc + (resolved.getTime() - created.getTime());
          }
          return acc;
        }, 0) / resolvedReports.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    const newStats = {
      total: reportsData.length,
      pending: reportsData.filter(r => r.status === 'pending').length,
      under_review: reportsData.filter(r => r.status === 'under_review').length,
      resolved: reportsData.filter(r => r.status === 'resolved').length,
      dismissed: reportsData.filter(r => r.status === 'dismissed').length,
      high_priority: highPriorityCount,
      avg_resolution_time: Math.round(avgResolutionTime)
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

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(report => 
        getPriorityLevel(report.category, report.description) === priorityFilter
      );
    }

    setFilteredReports(filtered);
  };

  const updateReportStatus = async (reportId: string, newStatus: string, notes?: string) => {
    // Validar nome do admin para ações que não sejam apenas salvar notas
    if (newStatus !== 'pending' && !adminName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nome obrigatório',
        description: 'Digite seu nome para que o usuário saiba quem respondeu à denúncia.'
      });
      return;
    }

    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus !== 'pending') {
        updateData.reviewed_by = (await supabase.auth.getUser()).data.user?.id;
        updateData.reviewed_at = new Date().toISOString();
        
        // Salvar nome do admin
        if (adminName.trim()) {
          updateData.admin_name = adminName.trim();
          // Salvar no localStorage para próximas vezes
          localStorage.setItem('adminName', adminName.trim());
        }
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
    <>
      <Helmet>
        <title>Denúncias | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h1 className="text-2xl font-medium text-neutral-700">Central de Denúncias</h1>
                <p className="text-gray-500">Moderação inteligente de conteúdo gerado pela IA</p>
              </div>
            </div>
          </header>

          {/* Estatísticas Aprimoradas */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-500">denúncias</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-gray-500">aguardando</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Em Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.under_review}</div>
                <p className="text-xs text-gray-500">analisando</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Resolvidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <p className="text-xs text-gray-500">concluídos</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-gray-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Arquivados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.dismissed}</div>
                <p className="text-xs text-gray-500">arquivados</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alta Prioridade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.high_priority}</div>
                <p className="text-xs text-gray-500">urgentes</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tempo Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.avg_resolution_time}h</div>
                <p className="text-xs text-gray-500">resolução</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros Aprimorados */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neutral-700 text-md">
                <Filter className="h-5 w-5" />
                Filtros Avançados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SearchBar
                  placeholder="Buscar por descrição ou usuário..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
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
                    <SelectValue placeholder="Categoria" />
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

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    <SelectItem value="high">Alta Prioridade</SelectItem>
                    <SelectItem value="medium">Média Prioridade</SelectItem>
                    <SelectItem value="low">Baixa Prioridade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Denúncias Redesenhada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-2xl font-medium text-neutral-700">
                <span>Denúncias Recentes ({filteredReports.length})</span>
                <Badge variant="outline" className="text-xs">
                  Atualizado em Tempo Real
                </Badge>
              </CardTitle>
              <CardDescription>
                Gerencie e modere denúncias de conteúdo gerado pela IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma Denúncia Encontrada</h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                      ? 'Tente ajustar os filtros para ver mais resultados.'
                      : 'Não há denúncias no momento.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => {
                    const priority = getPriorityLevel(report.category, report.description);
                    const normalizedCategory = normalizeCategory(report.category);
                    const CategoryIcon = categoryIcons[normalizedCategory as keyof typeof categoryIcons] || MessageSquare;
                    
                    return (
                      <div 
                        key={report.id} 
                        className="relative border rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-white"
                      >
                        {/* Indicador de Prioridade */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${getPriorityColor(priority)}`} />
                        
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Header da Denúncia */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-2 rounded-lg ${categoryColors[normalizedCategory as keyof typeof categoryColors]}`}>
                                <CategoryIcon className="h-4 w-4" />
                              </div>
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                                  {statusLabels[report.status as keyof typeof statusLabels]}
                                </Badge>
                                
                                <Badge variant="outline" className={categoryColors[normalizedCategory as keyof typeof categoryColors]}>
                                  {categoryLabels[normalizedCategory as keyof typeof categoryLabels]}
                                </Badge>
                                
                                {priority === 'high' && (
                                  <Badge className="bg-red-100 text-red-800 border-red-200">
                                    🔥 Alta Prioridade
                                  </Badge>
                                )}
                                
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getTimeAgo(report.created_at)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Informações do Usuário */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span className="font-medium">
                                  {report.user_profile?.preferred_name || 'Usuário desconhecido'}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span>{report.user_profile?.email || 'Email não disponível'}</span>
                              </div>
                            </div>
                            
                            {/* Descrição */}
                            <div className="mb-3">
                              <p className="text-sm text-gray-800 leading-relaxed">
                                <span className="font-medium">Descrição:</span> {report.description}
                              </p>
                            </div>
                            
                            {/* Metadados */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Incidente: {formatDate(report.timestamp_of_incident)}
                              </span>
                              {report.reviewed_at && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Revisado: {formatDate(report.reviewed_at)}
                                </span>
                              )}
                              {report.admin_name && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Respondido por: {report.admin_name}
                                </span>
                              )}
                            </div>
                            
                            {/* Notas do Admin */}
                            {report.admin_notes && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <span className="font-medium">Notas do Admin:</span> {report.admin_notes}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Ações */}
                          <div className="flex gap-2 ml-6">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-blue-50 hover:border-blue-300"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setAdminNotes(report.admin_notes || '');
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Analisar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Análise Detalhada da Denúncia
                                  </DialogTitle>
                                  <DialogDescription>
                                    Revisar e tomar ação sobre a denúncia de conteúdo IA
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedReport && (
                                  <div className="space-y-6">
                                    {/* Status e Categoria */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Status Atual</label>
                                        <div className="mt-1">
                                          <Badge className={statusColors[selectedReport.status as keyof typeof statusColors]}>
                                            {statusLabels[selectedReport.status as keyof typeof statusLabels]}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Categoria</label>
                                        <div className="mt-1">
                                          <Badge variant="outline" className={categoryColors[normalizeCategory(selectedReport.category) as keyof typeof categoryColors]}>
                                            {categoryLabels[normalizeCategory(selectedReport.category) as keyof typeof categoryLabels]}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Informações do Usuário */}
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Usuário Denunciante</label>
                                      <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm">
                                          <span className="font-medium">{selectedReport.user_profile?.preferred_name}</span>
                                          <span className="text-gray-500"> • {selectedReport.user_profile?.email}</span>
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Descrição da Denúncia */}
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Descrição da Denúncia</label>
                                      <div className="mt-1 p-4 bg-gray-50 border rounded-lg">
                                        <p className="text-sm leading-relaxed">{selectedReport.description}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Metadados */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Data do Incidente</label>
                                        <p className="text-sm text-gray-600 mt-1">{formatDate(selectedReport.timestamp_of_incident)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Data da Denúncia</label>
                                        <p className="text-sm text-gray-600 mt-1">{formatDate(selectedReport.created_at)}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Notas Administrativas */}
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Notas Administrativas</label>
                                      <Textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Adicione suas observações sobre esta denúncia..."
                                        rows={4}
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    {/* Nome do Administrador */}
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">
                                        Seu Nome (será exibido para o usuário) *
                                      </label>
                                      <Input
                                        value={adminName}
                                        onChange={(e) => setAdminName(e.target.value)}
                                        placeholder="Ex: Maria Santos, João Silva..."
                                        className="mt-1"
                                        required
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Este nome aparecerá para o usuário no app mobile
                                      </p>
                                    </div>
                                    
                                    {/* Ações */}
                                    <div className="flex gap-2 pt-4 border-t">
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
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    </>
  );
};

export default AdminAIReports;
