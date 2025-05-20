
import React from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmployeesEmptyStateProps {
  onAddEmployee: () => void;
}

const EmployeesEmptyState: React.FC<EmployeesEmptyStateProps> = ({ onAddEmployee }) => {
  return (
    <div className="py-8 text-center">
      <p className="text-gray-500">Nenhum funcionário encontrado.</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onAddEmployee}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Adicionar Funcionário
      </Button>
    </div>
  );
};

export default EmployeesEmptyState;
