
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface PatientSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: () => void;
}

const PatientSearchDialog: React.FC<PatientSearchDialogProps> = ({ isOpen, onClose }) => {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Funcionalidade Indisponível</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Funcionalidade Removida</h3>
          <p className="text-gray-500 text-center max-w-md mb-4">
            A funcionalidade de associação entre psicólogos e pacientes foi removida do sistema.
            Entre em contato com o suporte para mais informações.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientSearchDialog;
