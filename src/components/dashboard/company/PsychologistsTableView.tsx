
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX } from 'lucide-react';

export type Psychologist = {
  id: number;
  nome: string;
  email: string;
  crp: string;
  especialidade?: string;
  status: string;
};

interface PsychologistsTableViewProps {
  psychologists: Psychologist[];
  onApprovePsychologist?: (id: number) => void;
  onRejectPsychologist?: (id: number) => void;
  onDisconnectPsychologist?: (id: number) => void;
  showActions?: boolean;
  sectionType: 'pending' | 'active' | 'invites';
}

const PsychologistsTableView: React.FC<PsychologistsTableViewProps> = ({
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
        <div className="space-x-2">
          <Button 
            variant="default" 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onApprovePsychologist?.(psychologist.id)}
          >
            <UserCheck size={16} className="mr-1" />
            Aprovar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500 border-red-300 hover:bg-red-50"
            onClick={() => onRejectPsychologist?.(psychologist.id)}
          >
            <UserX size={16} className="mr-1" />
            Rejeitar
          </Button>
        </div>
      );
    }

    if (sectionType === 'invites') {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-500 border-red-300 hover:bg-red-50"
          onClick={() => onDisconnectPsychologist?.(psychologist.id)}
        >
          <UserX size={16} className="mr-1" />
          Cancelar
        </Button>
      );
    }

    if (sectionType === 'active') {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-500 border-red-300 hover:bg-red-50"
          onClick={() => onDisconnectPsychologist?.(psychologist.id)}
        >
          <UserX size={16} className="mr-1" />
          Desconectar
        </Button>
      );
    }

    return null;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="font-medium">Nome</TableHead>
          <TableHead className="font-medium">Email</TableHead>
          <TableHead className="font-medium">CRP</TableHead>
          <TableHead className="font-medium">Especialidade</TableHead>
          {sectionType !== 'active' && (
            <TableHead className="font-medium">Status</TableHead>
          )}
          {showActions && (
            <TableHead className="text-right font-medium">Ações</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {psychologists.map((psychologist) => (
          <TableRow key={psychologist.id}>
            <TableCell className="font-medium">{psychologist.nome}</TableCell>
            <TableCell>{psychologist.email}</TableCell>
            <TableCell>{psychologist.crp}</TableCell>
            <TableCell>{psychologist.especialidade || 'Não especificada'}</TableCell>
            {sectionType !== 'active' && (
              <TableCell>{renderStatusBadge(psychologist.status)}</TableCell>
            )}
            {showActions && (
              <TableCell className="text-right">
                {renderActions(psychologist)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PsychologistsTableView;
