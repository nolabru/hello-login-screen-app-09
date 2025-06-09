import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { invitePatient } from '@/integrations/supabase/psychologistPatientsService';

interface PatientSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientInvited: () => void;
}

const PatientSearchDialog: React.FC<PatientSearchDialogProps> = ({
  open,
  onOpenChange,
  onPatientInvited
}) => {
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();
  
  const handleInvitePatient = async () => {
    if (!email.trim()) return;
    
    setIsInviting(true);
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      
      if (!psychologistId) {
        throw new Error('ID do psicólogo não encontrado');
      }
      
      await invitePatient(psychologistId, email.trim());
      
      toast({
        title: 'Convite enviado',
        description: `Um convite foi enviado para ${email}`,
      });
      
      onPatientInvited();
      onOpenChange(false);
      setEmail('');
    } catch (error) {
      console.error('Erro ao convidar paciente:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível convidar o paciente. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsInviting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Convidar Paciente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500">
            Digite o email do paciente que você deseja convidar. O paciente receberá uma notificação no aplicativo.
          </p>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Email do Paciente"
              className="pl-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isInviting && email.trim()) {
                  handleInvitePatient();
                }
              }}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleInvitePatient}
            disabled={!email.trim() || isInviting}
            className="bg-portal-purple hover:bg-portal-purple-dark"
          >
            {isInviting ? (
              'Enviando...'
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar Paciente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientSearchDialog;
