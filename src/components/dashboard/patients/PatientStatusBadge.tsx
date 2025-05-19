
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PatientStatusBadgeProps {
  status: string;
}

const PatientStatusBadge: React.FC<PatientStatusBadgeProps> = ({ status }) => {
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

export default PatientStatusBadge;
