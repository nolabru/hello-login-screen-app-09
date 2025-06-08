import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  searchAvailablePsychologists, 
  associatePsychologistToCompany,
  fetchAllAvailablePsychologists,
  PsychologistSearchResult
} from '@/integrations/supabase/companyPsychologistsService';

interface PsychologistSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onPsychologistAdded: () => void;
}

const PsychologistSearchDialog: React.FC<PsychologistSearchDialogProps> = ({
  open,
  onOpenChange,
  companyId,
  onPsychologistAdded
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PsychologistSearchResult[]>([]);
  const [allPsychologists, setAllPsychologists] = useState<PsychologistSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // Carregar todos os psicólogos disponíveis quando o diálogo é aberto
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedPsychologist(null);
      setIsLoading(true);
      
      fetchAllAvailablePsychologists(companyId)
        .then(psychologists => {
          setAllPsychologists(psychologists);
          setSearchResults(psychologists);
        })
        .catch(error => {
          console.error('Erro ao carregar psicólogos:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar a lista de psicólogos.',
            variant: 'destructive'
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, companyId, toast]);

  // Efeito para filtrar psicólogos quando a consulta muda
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Se a busca estiver vazia, mostrar todos os psicólogos
      setSearchResults(allPsychologists);
      return;
    }

    setIsSearching(true);
    
    // Filtrar localmente para consultas curtas
    const query = searchQuery.toLowerCase();
    const filteredResults = allPsychologists.filter(
      psychologist => 
        psychologist.name.toLowerCase().includes(query) || 
        psychologist.email.toLowerCase().includes(query) || 
        (psychologist.crp && psychologist.crp.toLowerCase().includes(query)) ||
        (psychologist.specialization && psychologist.specialization.toLowerCase().includes(query))
    );
    
    // Para consultas mais específicas (3+ caracteres), buscar no servidor
    if (searchQuery.trim().length >= 1) {
      const fetchFromServer = async () => {
        try {
          const results = await searchAvailablePsychologists(searchQuery, companyId);
          // Combinar resultados locais com resultados do servidor, removendo duplicatas
          const combinedResults = [...filteredResults];
          results.forEach(serverResult => {
            if (!combinedResults.some(localResult => localResult.id === serverResult.id)) {
              combinedResults.push(serverResult);
            }
          });
          setSearchResults(combinedResults);
        } catch (error) {
          console.error('Erro ao buscar psicólogos:', error);
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
  }, [searchQuery, allPsychologists, companyId]);

  // Função para adicionar o psicólogo selecionado à empresa
  const handleAddPsychologist = async () => {
    if (!selectedPsychologist) return;

    setIsAdding(true);
    try {
      await associatePsychologistToCompany(companyId, selectedPsychologist);
      toast({
        title: 'Psicólogo adicionado',
        description: 'O psicólogo foi adicionado à empresa com sucesso.',
      });
      onPsychologistAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao adicionar psicólogo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o psicólogo. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsAdding(false);
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
          <DialogTitle className="text-neutral-700">cólogo</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por Nome, E-mail ou CRP..."
            className="pl-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando Psicólogos...</p>
            </div>
          ) : isSearching ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Buscando Psicólogos...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum Psicólogo Encontrado</p>
              <p className="text-sm text-gray-400 mt-1">Tente Novamente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.length > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  Mostrando {searchResults.length} {searchResults.length === 1 ? 'Psicólogo' : 'Psicólogos'}
                </p>
              )}
              {searchResults.map((psychologist) => (
                <div
                  key={psychologist.id}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedPsychologist === psychologist.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPsychologist(psychologist.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-portal-purple text-white">
                        {getInitials(psychologist.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{psychologist.name}</p>
                      <p className="text-sm text-gray-500">{psychologist.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {psychologist.crp && (
                          <Badge variant="outline" className="text-xs bg-portal-purple/10  text-portal-purple">
                            CRP: {psychologist.crp}
                          </Badge>
                        )}
                        {psychologist.specialization && (
                          <Badge variant="outline" className="text-xs bg-portal-purple/10 text-portal-purple">
                            {psychologist.specialization}
                          </Badge>
                        )}
                      </div>
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
            onClick={handleAddPsychologist}
            disabled={!selectedPsychologist || isAdding}
            className="bg-portal-purple hover:bg-portal-purple-dark"
          >
            {isAdding ? (
              'Adicionando...'
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar Psicólogo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PsychologistSearchDialog;
