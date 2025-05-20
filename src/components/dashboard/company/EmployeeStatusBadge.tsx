
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface EmployeeStatusBadgeProps {
  status: boolean;
}

const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({ status }) => {
  if (status) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3.5 h-3.5 mr-1" />
        Ativo
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <XCircle className="w-3.5 h-3.5 mr-1" />
        Pendente
      </Badge>
    );
  }
};

export default EmployeeStatusBadge;
