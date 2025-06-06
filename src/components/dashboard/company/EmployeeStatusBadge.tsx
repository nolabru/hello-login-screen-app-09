
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface EmployeeStatusBadgeProps {
  status?: string; // Agora aceita uma string em vez de booleano
}

const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3.5 h-3.5 mr-1" />
          Ativo
        </Badge>
      );
    case 'inactive':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="w-3.5 h-3.5 mr-1" />
          Inativo
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <XCircle className="w-3.5 h-3.5 mr-1" />
          Pendente
        </Badge>
      );
    case 'suspended':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <AlertCircle className="w-3.5 h-3.5 mr-1" />
          Suspenso
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          <XCircle className="w-3.5 h-3.5 mr-1" />
          Desconhecido
        </Badge>
      );
  }
};

export default EmployeeStatusBadge;
