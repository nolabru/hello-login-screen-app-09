
import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmployeeStatusBadge from './EmployeeStatusBadge';
import type { Employee } from './EmployeesTableView';

interface EmployeesCardViewProps {
  employees: Employee[];
  onRemoveEmployee: (id: number) => void;
}

const EmployeesCardView: React.FC<EmployeesCardViewProps> = ({
  employees,
  onRemoveEmployee
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map((employee) => (
        <Card key={employee.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-indigo-500" />
                <h3 className="font-medium">{employee.nome}</h3>
              </div>
              
              <div className="text-sm text-gray-500">{employee.email}</div>
              
              {employee.company_name && (
                <div className="py-1">
                  <Badge 
                    variant="indigo"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1.5 flex flex-col items-center justify-center w-full"
                  >
                    {employee.company_name}
                  </Badge>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <EmployeeStatusBadge status={employee.status} />
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onRemoveEmployee(employee.id)}
                >
                  Desvincular
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmployeesCardView;
