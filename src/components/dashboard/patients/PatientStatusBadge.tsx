
import React from 'react';

interface PatientStatusBadgeProps {
  status: string;
}

const PatientStatusBadge: React.FC<PatientStatusBadgeProps> = ({ status }) => {
  let badgeClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  switch (status.toLowerCase()) {
    case 'active':
      badgeClasses += ' bg-green-100 text-green-800 border border-green-200';
      return <span className={badgeClasses}>Ativo</span>;
    case 'pending':
      badgeClasses += ' bg-yellow-100 text-yellow-800 border border-yellow-200';
      return <span className={badgeClasses}>Pendente</span>;
    case 'inactive':
      badgeClasses += ' bg-gray-100 text-gray-800 border border-gray-200';
      return <span className={badgeClasses}>Inativo</span>;
    case 'blocked':
      badgeClasses += ' bg-red-100 text-red-800 border border-red-200';
      return <span className={badgeClasses}>Bloqueado</span>;
    default:
      badgeClasses += ' bg-blue-100 text-blue-800 border border-blue-200';
      return <span className={badgeClasses}>{status}</span>;
  }
};

export default PatientStatusBadge;
