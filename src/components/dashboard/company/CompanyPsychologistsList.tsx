import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserMinus, Mail, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { fetchCompanyPsychologists, disassociatePsychologistFromCompany, CompanyPsychologist } from '@/integrations/supabase/companyPsychologistsService';
import { supabase } from '@/integrations/supabase/client';
import PsychologistSearchDialog from './PsychologistSearchDialog';

interface CompanyPsychologistsListProps {
  onPsychologistsLoaded?: (count: number) => void;
}

const CompanyPsychologistsList: React.FC<CompanyPsychologistsListProps> = ({
  onPsychologistsLoaded
}) => {
  const [psychologists, setPsychologists] = useState<CompanyPsychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [profileImageUrls, setProfileImageUrls] = useState<Record<string, string>>({});
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      loadPsychologists();
    }
  }, [companyId]);

  const loadPsychologists = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const data = await fetchCompanyPsychologists(companyId);
      setPsychologists(data);
      
      // Atualizar o contador no dashboard
      if (onPsychologistsLoaded) {
        onPsychologistsLoaded(data.length);
      }
    
    } catch (error) {
      console.error('Erro ao carregar psicólogos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de psicólogos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para obter as iniciais do nome
  const getInitials = (name?: string) => {
    if (!name) return "??";
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleRemovePsychologist = async (psychologistId: string) => {
    if (!companyId) return;
    
    if (!confirm('Tem certeza que deseja remover este psicólogo da empresa?')) {
      return;
    }
    
    try {
      await disassociatePsychologistFromCompany(companyId, psychologistId);
      toast({
        title: 'Psicólogo removido',
        description: 'O psicólogo foi removido da empresa com sucesso.',
      });
      loadPsychologists();
    } catch (error) {
      console.error('Erro ao remover psicólogo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o psicólogo. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleAddPsychologist = () => {
    setIsSearchDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Carregando Psicólogos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center mb-6">
        <Button onClick={handleAddPsychologist} className="bg-portal-purple hover:bg-portal-purple-dark">
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar Psicólogo
        </Button>
      </div>

      {psychologists.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Nenhum Psicólogo Associado a esta Empresa</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">Nome</TableHead>
                  <TableHead className="font-medium">Especialidade</TableHead>
                  <TableHead className="font-medium">Contato</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="text-right font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {psychologists.map((psychologist) => (
                  <TableRow key={psychologist.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {profileImageUrls[psychologist.psychologist_id] ? (
                            <AvatarImage 
                              src={profileImageUrls[psychologist.psychologist_id]} 
                              alt={psychologist.psychologist_name}
                              style={{ objectFit: 'cover' }}
                              onError={(e) => {
                                console.log('Erro ao carregar imagem de perfil:', e);
                                // Converter e.target para HTMLImageElement
                                const imgElement = e.target as HTMLImageElement;
                                imgElement.style.display = 'none'; // Esconde a imagem com erro
                              }}
                            />
                          ) : (
                            <AvatarFallback className="bg-portal-purple text-white text-xs">
                              {getInitials(psychologist.psychologist_name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {psychologist.psychologist_name || 'Nome não disponível'}
                      </div>
                    </TableCell>
                    <TableCell>{psychologist.psychologist_specialization || 'Não informada'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{psychologist.psychologist_email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemovePsychologist(psychologist.psychologist_id)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {companyId && (
        <PsychologistSearchDialog
          open={isSearchDialogOpen}
          onOpenChange={setIsSearchDialogOpen}
          companyId={companyId}
          onPsychologistAdded={loadPsychologists}
        />
      )}
    </div>
  );
};

export default CompanyPsychologistsList;
