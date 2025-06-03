
import React from 'react';
import { User, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Psychologist } from './PsychologistsTableView';

interface PsychologistsCardViewProps {
  psychologists: Psychologist[];
  onApprovePsychologist?: (id: number) => void;
  onRejectPsychologist?: (id: number) => void;
  onDisconnectPsychologist?: (id: number) => void;
  showActions?: boolean;
  sectionType: 'pending' | 'active' | 'invites';
}

const PsychologistsCardView: React.FC<PsychologistsCardViewProps> = ({
  psychologists,
  onApprovePsychologist,
  onRejectPsychologist,
  onDisconnectPsychologist,
  showActions = true,
  sectionType
}) => {
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Solicitação Enviada</Badge>;
      case 'requested':
        return <Badge className="bg-blue-500">Solicitou Conexão</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconhecido</Badge>;
    }
  };

  const renderActions = (psychologist: Psychologist) => {
    if (!showActions) return null;

    if (sectionType === 'pending') {
      return (
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 flex-1"
            onClick={() => onApprovePsychologist?.(psychologist.id)}
          >
            <UserCheck size={16} className="mr-1" />
            Aprovar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500 border-red-300 hover:bg-red-50 flex-1"
            onClick={() => onRejectPsychologist?.(psychologist.id)}
          >
            <UserX size={16} className="mr-1" />
            Rejeitar
          </Button>
        </div>
      );
    }

    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="text-red-500 border-red-300 hover:bg-red-50 w-full"
        onClick={() => onDisconnectPsychologist?.(psychologist.id)}
      >
        <UserX size={16} className="mr-1" />
        {sectionType === 'invites' ? 'Cancelar' : 'Desconectar'}
      </Button>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {psychologists.map((psychologist) => (
        <Card key={psychologist.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-indigo-500" />
                <h3 className="font-medium">{psychologist.nome}</h3>
              </div>
              
              <div className="text-sm text-gray-600">{psychologist.email}</div>
              <div className="text-sm text-gray-600">CRP: {psychologist.crp}</div>
              
              {psychologist.especialidade && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Especialidade:</span> {psychologist.especialidade}
                </div>
              )}
              
              {sectionType !== 'active' && (
                <div className="py-1">
                  {renderStatusBadge(psychologist.status)}
                </div>
              )}
              
              {showActions && (
                <div className="pt-2">
                  {renderActions(psychologist)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PsychologistsCardView;
