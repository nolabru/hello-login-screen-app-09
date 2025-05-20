
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Search } from 'lucide-react';
import { TableCell, TableRow, TableBody, TableHead, TableHeader, Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

type Company = {
  id: number;
  name: string;
  contact_email: string;
  status: boolean;
  connection_status: string;
};

const PsychologistCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const { toast } = useToast();

  // Buscar empresas associadas ao psicólogo
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) {
          throw new Error('Nenhum psicólogo logado');
        }

        const psychologistIdNumber = parseInt(psychologistId, 10);

        // Buscar associações do psicólogo com empresas
        const { data: associations, error: associationsError } = await supabase
          .from('company_psychologist_associations')
          .select('id_empresa, status')
          .eq('id_psicologo', psychologistIdNumber);

        if (associationsError) throw associationsError;

        if (associations && associations.length > 0) {
          // Extrair IDs das empresas associadas
          const companyIds = associations.map(assoc => assoc.id_empresa);

          // Buscar detalhes das empresas
          const { data: companiesData, error: companiesError } = await supabase
            .from('companies')
            .select('id, name, contact_email, status')
            .in('id', companyIds);

          if (companiesError) throw companiesError;

          // Mapear empresas com status de conexão
          const mappedCompanies = companiesData?.map(company => {
            const association = associations.find(a => a.id_empresa === company.id);
            return {
              ...company,
              connection_status: association?.status || 'pending'
            };
          }) || [];

          setCompanies(mappedCompanies);
          setFilteredCompanies(mappedCompanies);
        } else {
          setCompanies([]);
          setFilteredCompanies([]);
        }
      } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        toast({
          title: "Erro ao carregar empresas",
          description: "Não foi possível carregar a lista de empresas associadas.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [toast]);

  // Filtrar empresas com base na busca
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = companies.filter(company => 
      company.name.toLowerCase().includes(lowercaseQuery) || 
      company.contact_email.toLowerCase().includes(lowercaseQuery)
    );

    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  return (
    <>
      <Helmet>
        <title>Empresas - Portal do Psicólogo</title>
      </Helmet>
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-medium">Empresas</h1>
              <p className="text-gray-500">Gerencie suas conexões com empresas</p>
            </div>
            <Button className="bg-indigo-900 hover:bg-indigo-800">
              <UserPlus size={16} className="mr-2" />
              Solicitar Conexão
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Search className="text-gray-400" size={20} />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Carregando empresas...</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Nenhuma empresa conectada.</p>
                  <p className="text-sm text-gray-400 mt-2">Use o botão "Solicitar Conexão" para iniciar uma parceria com uma empresa.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-medium">Nome</TableHead>
                      <TableHead className="font-medium">Email</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="text-right font-medium">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.contact_email}</TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              company.connection_status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {company.connection_status === 'active' ? 'Conectada' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            Ver detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default PsychologistCompanies;
