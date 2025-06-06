import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Tipo para representar um funcionário nos resultados da busca
export interface EmployeeSearchResult {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  profile_photo?: string;
}

interface EmployeeSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onEmployeeLinked: () => void;
}

const EmployeeSearchDialog: React.FC<EmployeeSearchDialogProps> = ({
  open,
  onOpenChange,
  companyId,
  onEmployeeLinked
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EmployeeSearchResult[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();

  // Carregar todos os funcionários disponíveis quando o diálogo é aberto
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedEmployee(null);
      setIsLoading(true);
      
      fetchAllAvailableEmployees()
        .then(employees => {
          setAllEmployees(employees);
          setSearchResults(employees);
        })
        .catch(error => {
          console.error('Erro ao carregar funcionários:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar a lista de funcionários.',
            variant: 'destructive'
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, toast]);

  // Efeito para filtrar funcionários quando a consulta muda
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Se a busca estiver vazia, mostrar todos os funcionários
      setSearchResults(allEmployees);
      return;
    }

    setIsSearching(true);
    
    // Filtrar localmente
    const query = searchQuery.toLowerCase();
    const filteredResults = allEmployees.filter(
      employee => 
        employee.name.toLowerCase().includes(query) || 
        employee.email.toLowerCase().includes(query) || 
        (employee.cpf && employee.cpf.toLowerCase().includes(query))
    );
    
    // Para consultas mais específicas (3+ caracteres), buscar no servidor
    if (searchQuery.trim().length >= 3) {
      const fetchFromServer = async () => {
        try {
          const results = await searchAvailableEmployees(searchQuery);
          // Combinar resultados locais com resultados do servidor, removendo duplicatas
          const combinedResults = [...filteredResults];
          results.forEach(serverResult => {
            if (!combinedResults.some(localResult => localResult.id === serverResult.id)) {
              combinedResults.push(serverResult);
            }
          });
          setSearchResults(combinedResults);
        } catch (error) {
          console.error('Erro ao buscar funcionários:', error);
          // Em caso de erro, usar apenas os resultados filtrados localmente
          setSearchResults(filteredResults);
        } finally {
          setIsSearching(false);
        }
      };
      
      // Debounce para evitar muitas requisições
      const timeoutId = setTimeout(fetchFromServer, 300);
      return () => clearTimeout(timeoutId);
    } else {
      // Para consultas curtas, usar apenas os resultados filtrados localmente
      setSearchResults(filteredResults);
      setIsSearching(false);
    }
  }, [searchQuery, allEmployees]);

  // Função para buscar todos os funcionários disponíveis
  const fetchAllAvailableEmployees = async (): Promise<EmployeeSearchResult[]> => {
    try {
      // Buscar todos os usuários sem empresa vinculada
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .is('company_id', null)
        .limit(50);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Mapear os dados para o formato esperado
      return data.map(employee => {
        // Usar uma abordagem segura para acessar os campos
        const employeeData = employee as any; // Usar any para evitar erros de tipo
        
        return {
          id: employeeData.id,
          name: employeeData.full_name || employeeData.preferred_name || employeeData.name || 'Nome não disponível',
          email: employeeData.email || '',
          cpf: employeeData.cpf,
          profile_photo: undefined // Não temos esse campo
        };
      });
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      throw error;
    }
  };

  // Função para buscar funcionários por termo de busca
  const searchAvailableEmployees = async (query: string): Promise<EmployeeSearchResult[]> => {
    try {
      // Buscar usuários que correspondem à pesquisa
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`full_name.ilike.%${query}%,preferred_name.ilike.%${query}%,name.ilike.%${query}%,email.ilike.%${query}%,cpf.ilike.%${query}%`)
        .is('company_id', null)
        .limit(10);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Mapear os dados para o formato esperado
      return data.map(employee => {
        // Usar uma abordagem segura para acessar os campos
        const employeeData = employee as any; // Usar any para evitar erros de tipo
        
        return {
          id: employeeData.id,
          name: employeeData.full_name || employeeData.preferred_name || employeeData.name || 'Nome não disponível',
          email: employeeData.email || '',
          cpf: employeeData.cpf,
          profile_photo: undefined // Não temos esse campo
        };
      });
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      throw error;
    }
  };

  // Função para vincular o funcionário selecionado à empresa
  const handleLinkEmployee = async () => {
    if (!selectedEmployee) return;

    setIsLinking(true);
    try {
      // Verificar licenças disponíveis
      const { available } = await checkLicenseAvailability(companyId);
      if (available <= 0) {
        toast({
          title: "Sem licenças disponíveis",
          description: "Você não possui licenças disponíveis para adicionar funcionários. Adquira mais licenças na aba de Licenças.",
          variant: "destructive"
        });
        onOpenChange(false);
        return;
      }

      // Vincular usuário à empresa
      const { error } = await supabase
        .from('user_profiles')
        .update({
          company_id: companyId,
          license_status: 'active' // Definir como active para consumir uma licença
        })
        .eq('id', selectedEmployee);

      if (error) throw error;

      toast({
        title: 'Funcionário vinculado',
        description: 'O funcionário foi vinculado à sua empresa com sucesso.'
      });
      onEmployeeLinked();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao vincular funcionário:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível vincular o funcionário: ${error.message || error}`,
        variant: 'destructive'
      });
    } finally {
      setIsLinking(false);
    }
  };

  // Função para verificar disponibilidade de licenças
  const checkLicenseAvailability = async (companyId: string) => {
    try {
      // Importar dinamicamente para evitar problemas de dependência circular
      const { checkLicenseAvailability } = await import('@/services/licenseService');
      return await checkLicenseAvailability(companyId);
    } catch (error) {
      console.error('Erro ao verificar licenças disponíveis:', error);
      return { available: 0, total: 0, used: 0, pending: 0 };
    }
  };

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-neutral-700">Vincular Funcionário Existente</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por Nome, E-mail ou CPF..."
            className="pl-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando Usuários...</p>
            </div>
          ) : isSearching ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Buscando Usuários...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum Usuário Encontrado</p>
              <p className="text-sm text-gray-400 mt-1">Tente Novamente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.length > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  Mostrando {searchResults.length} {searchResults.length === 1 ? 'Usuário' : 'Usuários'}
                </p>
              )}
              {searchResults.map((employee) => (
                <div
                  key={employee.id}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedEmployee === employee.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedEmployee(employee.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {employee.profile_photo ? (
                        <AvatarImage src={employee.profile_photo} alt={employee.name} />
                      ) : (
                        <AvatarFallback className="bg-portal-purple text-white">
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                      {employee.cpf && (
                        <Badge variant="outline" className="text-xs mt-1">
                          CPF: {employee.cpf}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleLinkEmployee}
            disabled={!selectedEmployee || isLinking}
            className="bg-portal-purple hover:bg-portal-purple-dark"
          >
            {isLinking ? (
              'Vinculando...'
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Vincular Usuário
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeSearchDialog;
