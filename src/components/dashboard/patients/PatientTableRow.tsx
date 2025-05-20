
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PatientStatusBadge from './PatientStatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import PatientChatHistory from './PatientChatHistory';

interface Patient {
  id: number;
  nome: string;
  email: string;
  phone: string;
  status: string;
  last_session?: string;
  user_id?: number;
  company_name?: string;
}

interface PatientTableRowProps {
  patient: Patient;
  onPatientRemoved: () => void;
}

const PatientTableRow: React.FC<PatientTableRowProps> = ({ patient, onPatientRemoved }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const { toast } = useToast();

  // Normalize status for consistent comparison
  const normalizedStatus = patient.status.toLowerCase();
  
  const handleDeleteAssociation = async () => {
    setIsDeleting(true);
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) throw new Error('ID do psicólogo não encontrado');

      // Delete the association between the psychologist and the patient
      const { error } = await supabase
        .from('user_psychologist_associations')
        .delete()
        .eq('id_psicologo', parseInt(psychologistId))
        .eq('id_usuario', patient.id);

      if (error) throw error;

      toast({
        title: "Vínculo removido com sucesso",
        description: `O paciente ${patient.nome} foi desvinculado da sua lista.`,
      });

      onPatientRemoved(); // Refresh the patient list
    } catch (error) {
      console.error('Erro ao remover vínculo:', error);
      toast({
        title: "Erro ao remover vínculo",
        description: "Não foi possível desvincular este paciente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const isCompanyPatient = Boolean(patient.company_name);

  return (
    <>
      <TableRow 
        key={patient.id} 
        className={`${normalizedStatus === 'active' ? 'cursor-pointer hover:bg-purple-50/50' : ''} transition-colors`}
        onClick={(e) => {
          // Only allow clicking the row to open chat history if status is active
          if (normalizedStatus === 'active') {
            setIsChatHistoryOpen(true);
          }
        }}
      >
        <TableCell>
          <div className="flex items-center">
            <span className="font-medium">{patient.nome}</span>
          </div>
        </TableCell>
        <TableCell>{patient.email}</TableCell>
        <TableCell>{patient.phone}</TableCell>
        <TableCell>
          <PatientStatusBadge status={patient.status} />
        </TableCell>
        <TableCell>{patient.last_session}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Only show "Ver Mais" button when status is active */}
            {normalizedStatus === 'active' && (
              <Button 
                variant="outline" 
                size="sm"
                title="Ver detalhes"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChatHistoryOpen(true);
                }}
              >
                Ver Mais
              </Button>
            )}
            
            {/* Show company badge for company patients or remove button for direct patients */}
            {isCompanyPatient ? (
              <Badge 
                variant="outline" 
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 min-w-24 px-3 flex justify-center items-center text-center"
              >
                {patient.company_name}
              </Badge>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                title="Remover vínculo" 
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
              >
                Remover
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Delete Confirmation Dialog - Only for non-company patients */}
      {!isCompanyPatient && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar exclusão de vínculo</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja remover o vínculo com o paciente <span className="font-medium">{patient.nome}</span>?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAssociation}
                disabled={isDeleting}
              >
                {isDeleting ? 'Removendo...' : 'Remover vínculo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Chat History Dialog - only shows up if patient status is active */}
      {normalizedStatus === 'active' && (
        <Dialog open={isChatHistoryOpen} onOpenChange={setIsChatHistoryOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Histórico de Interações - {patient.nome}
              </DialogTitle>
              <DialogDescription>
                Histórico completo de interações do paciente com a AIA
              </DialogDescription>
            </DialogHeader>
            <PatientChatHistory patientId={patient.id} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PatientTableRow;
