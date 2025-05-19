
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

const PatientsList: React.FC = () => {
  // Sample empty state since there are no patients yet
  const hasPatients = false;

  return (
    <Card>
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
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">Nenhum paciente encontrado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientsList;
