
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Eye, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PatientStatusBadge from './PatientStatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
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

  return (
    <>
      <TableRow 
        key={patient.id} 
        className="cursor-pointer hover:bg-purple-50/50 transition-colors"
        onClick={() => setIsChatHistoryOpen(true)}
      >
        <TableCell className="font-medium">{patient.nome}</TableCell>
        <TableCell>{patient.email}</TableCell>
        <TableCell>{patient.phone}</TableCell>
        <TableCell>
          <PatientStatusBadge status={patient.status} />
        </TableCell>
        <TableCell>{patient.last_session}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="icon" 
              title="Ver detalhes"
              onClick={(e) => {
                e.stopPropagation();
                setIsChatHistoryOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              title="Agendar sessão"
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              title="Remover vínculo" 
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Delete Confirmation Dialog */}
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

      {/* Chat History Dialog */}
      <Dialog open={isChatHistoryOpen} onOpenChange={setIsChatHistoryOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Interações - {patient.nome}</DialogTitle>
            <DialogDescription>
              Histórico completo de interações do paciente com a AIA
            </DialogDescription>
          </DialogHeader>
          <PatientChatHistory patientId={patient.id} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PatientTableRow;
