
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PatientTableRow from './PatientTableRow';

interface Patient {
  id: number;
  nome: string;
  email: string;
  phone: string;
  status: string;
  last_session?: string;
  user_id?: number;
}

interface PatientsTableProps {
  patients: Patient[];
  loading: boolean;
}

const PatientsTable: React.FC<PatientsTableProps> = ({ patients, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 text-2xl font-serif">Nenhum paciente encontrado.</p>
      </div>
    );
  }

  return (
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
        {patients.map((patient) => (
          <PatientTableRow key={patient.id} patient={patient} />
        ))}
      </TableBody>
    </Table>
  );
};

export default PatientsTable;
