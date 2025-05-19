
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Eye, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type Patient = {
  id: number;
  nome: string;
  email: string;
  phone: string;
  status: string;
  last_session?: string;
  user_id?: number;
};

const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPacientes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const fetchPacientes = async () => {
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) return;
      
      const psychologistIdNumber = parseInt(psychologistId, 10);
      
      // Buscando associações de pacientes
      const { data: associations, error: associationsError } = await supabase
        .from('user_psychologist_associations')
        .select(`
          id_relacao,
          status,
          id_usuario,
          atualizado_em
        `)
        .eq('id_psicologo', psychologistIdNumber);
      
      if (associationsError) throw associationsError;
      
      if (!associations || associations.length === 0) {
        setLoading(false);
        setPatients([]);
        return;
      }
      
      // Extrair os IDs dos usuários
      const userIds = associations.map(assoc => assoc.id_usuario);
      
      // Buscar os dados dos pacientes
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, nome, email, phone')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Mapear e combinar os dados
      const patientsList = userProfiles?.map(profile => {
        const association = associations.find(assoc => assoc.id_usuario === profile.id);
        return {
          id: profile.id,
          nome: profile.nome,
          email: profile.email,
          phone: profile.phone || 'Não informado',
          status: association?.status || 'pending',
          last_session: association?.atualizado_em ? 
            format(new Date(association.atualizado_em), 'dd/MM/yyyy', {locale: ptBR}) : 
            'Sem sessões',
          user_id: profile.id
        };
      }) || [];
      
      setPatients(patientsList);
      setFilteredPatients(patientsList);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast({
        title: "Erro ao carregar pacientes",
        description: "Não foi possível carregar a lista de pacientes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-500">Pendente</Badge>;
      case 'inactive':
        return <Badge variant="default" className="bg-gray-500">Inativo</Badge>;
      default:
        return <Badge variant="default" className="bg-gray-400">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-serif">Seus Pacientes</h1>
      
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input 
          type="text" 
          placeholder="Buscar pacientes..." 
          className="pl-10 py-6 text-lg border rounded-lg bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
            </div>
          ) : filteredPatients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Sessão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.nome}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{getStatusBadge(patient.status)}</TableCell>
                    <TableCell>{patient.last_session}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" title="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" title="Agendar sessão">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-32">
              <p className="text-gray-500 text-2xl font-serif">Nenhum paciente encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsList;
