
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const PatientsList: React.FC = () => {
  // Sample empty state since there are no patients yet
  const hasPatients = false;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-serif">Seus Pacientes</h1>
      
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input 
          type="text" 
          placeholder="Buscar pacientes..." 
          className="pl-10 py-6 text-lg border rounded-lg bg-white"
        />
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          {hasPatients ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Sessão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* We'll add patient data here in the future */}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-32">
              <p className="text-gray-500 text-2xl font-serif">Nenhum paciente encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsList;
