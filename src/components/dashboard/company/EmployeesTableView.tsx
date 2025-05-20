
import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import EmployeeStatusBadge from './EmployeeStatusBadge';

export type Employee = {
  id: number;
  nome: string;
  email: string;
  status: boolean;
  connection_status: string;
  phone?: string;
};

interface EmployeesTableViewProps {
  employees: Employee[];
  onRemoveEmployee: (id: number) => void;
}

const EmployeesTableView: React.FC<EmployeesTableViewProps> = ({
  employees,
  onRemoveEmployee
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="font-medium">Nome</TableHead>
          <TableHead className="font-medium">Email</TableHead>
          <TableHead className="font-medium">Status</TableHead>
          <TableHead className="text-right font-medium">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium flex items-center">
              <User className="h-4 w-4 text-gray-500 mr-2" />
              {employee.nome}
            </TableCell>
            <TableCell>{employee.email}</TableCell>
            <TableCell>
              <EmployeeStatusBadge status={employee.status} />
            </TableCell>
            <TableCell className="text-right">
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onRemoveEmployee(employee.id)}
              >
                Desvincular
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default EmployeesTableView;
