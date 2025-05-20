
import React, { useState, useEffect } from 'react';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, User, Building2 } from 'lucide-react';

interface Connection {
  id: number;
  status: string;
  psychologist?: {
    id: number;
    nome: string;
    email: string;
  };
  company?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

const AdminConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      // Fetch connections between psychologists and companies
      const { data: companyPsychologistAssociations, error } = await supabase
        .from('company_psychologist_associations')
        .select(`
          id,
          status,
          created_at,
          psychologist:id_psicologo(id, nome, email),
          company:id_empresa(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setConnections(companyPsychologistAssociations || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar conexões',
        description: 'Não foi possível carregar as conexões. Tente novamente mais tarde.'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConnectionStatus = async (connectionId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('company_psychologist_associations')
        .update({ status: newStatus })
        .eq('id', connectionId);

      if (error) {
        throw error;
      }

      // Update the local state
      setConnections(prevConnections => 
        prevConnections.map(conn => 
          conn.id === connectionId ? { ...conn, status: newStatus } : conn
        )
      );

      toast({
        title: 'Status atualizado',
        description: `A conexão foi ${newStatus === 'approved' ? 'aprovada' : newStatus === 'rejected' ? 'rejeitada' : 'atualizada'} com sucesso.`
      });
    } catch (error) {
      console.error('Error updating connection status:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status da conexão.'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Aprovado</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">Rejeitado</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">Pendente</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{status}</span>;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Gerenciamento de Conexões</h1>
          <p className="text-gray-500 mt-2">Administre conexões entre psicólogos e empresas</p>
        </header>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Conexões Psicólogo-Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-portal-purple"></div>
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma conexão encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Psicólogo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {connections.map((connection) => (
                      <tr key={connection.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {connection.psychologist?.nome || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {connection.psychologist?.email || 'Sem email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {connection.company?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {connection.company?.email || 'Sem email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(connection.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(connection.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {connection.status !== 'approved' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center text-green-600 hover:text-green-700"
                                onClick={() => updateConnectionStatus(connection.id, 'approved')}
                              >
                                <Check className="h-4 w-4 mr-1" /> Aprovar
                              </Button>
                            )}
                            {connection.status !== 'rejected' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center text-red-600 hover:text-red-700"
                                onClick={() => updateConnectionStatus(connection.id, 'rejected')}
                              >
                                <X className="h-4 w-4 mr-1" /> Rejeitar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminConnections;
