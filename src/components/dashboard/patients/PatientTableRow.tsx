
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PatientStatusBadge from './PatientStatusBadge';

interface Patient {
  id: number;
  nome: string;
  email: string;
  phone: string;
  status: string;
  last_session?: string;
  user_id?: number;
}

interface PatientTableRowProps {
  patient: Patient;
}

const PatientTableRow: React.FC<PatientTableRowProps> = ({ patient }) => {
  return (
    <TableRow key={patient.id}>
      <TableCell className="font-medium">{patient.nome}</TableCell>
      <TableCell>{patient.email}</TableCell>
      <TableCell>{patient.phone}</TableCell>
      <TableCell>
        <PatientStatusBadge status={patient.status} />
      </TableCell>
      <TableCell>{patient.last_session}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" title="Ver detalhes">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Agendar sessão">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default PatientTableRow;
