import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PatientTableRow from './PatientTableRow';
import { Loader2 } from 'lucide-react';
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
  onPatientRemoved: () => void;
}
const PatientsTable: React.FC<PatientsTableProps> = ({
  patients,
  loading,
  onPatientRemoved
}) => {
  if (loading) {
    return <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-portal-purple animate-spin" />
      </div>;
  }
  if (patients.length === 0) {
    return <div className="text-center py-16">
        <p className="text-gray-500 text-xl ">Nenhum paciente encontrado.</p>
        <p className="text-gray-400 mt-2">Adicione pacientes para começar a acompanhá-los.</p>
      </div>;
  }
  return <div className="rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-purple-50/50">
            <TableHead className="font-medium">Nome</TableHead>
            <TableHead className="font-medium">Email</TableHead>
            <TableHead className="font-medium">Telefone</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Última Interação</TableHead>
            <TableHead className="text-right font-medium">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map(patient => <PatientTableRow key={patient.id} patient={patient} onPatientRemoved={onPatientRemoved} />)}
        </TableBody>
      </Table>
    </div>;
};
export default PatientsTable;