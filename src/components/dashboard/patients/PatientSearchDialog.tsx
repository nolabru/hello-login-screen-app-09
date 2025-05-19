
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PatientSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: () => void;
}

interface Patient {
  id: number;
  nome: string;
  email: string;
  phone?: string;
}

const PatientSearchDialog: React.FC<PatientSearchDialogProps> = ({ isOpen, onClose, onPatientAdded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isConnecting, setIsConnecting] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        toast({
          title: "Erro na busca",
          description: "ID do psicólogo não encontrado",
          variant: "destructive"
        });
        return;
      }

      // Search for users by name or email
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, nome, email, phone')
        .or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);
        
      if (error) throw error;
      
      if (data) {
        // Get current associations to filter out already connected patients
        const { data: associations } = await supabase
          .from('user_psychologist_associations')
          .select('id_usuario')
          .eq('id_psicologo', parseInt(psychologistId));
          
        const connectedPatientIds = associations?.map(a => a.id_usuario) || [];
        
        // Filter out patients already connected
        const availablePatients = data.filter(patient => !connectedPatientIds.includes(patient.id));
        setSearchResults(availablePatients);
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar pacientes. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConnect = async (patient: Patient) => {
    setIsConnecting(prev => ({ ...prev, [patient.id]: true }));
    
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        toast({
          title: "Erro na conexão",
          description: "ID do psicólogo não encontrado",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_psychologist_associations')
        .insert({
          id_psicologo: parseInt(psychologistId),
          id_usuario: patient.id,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast({
        title: "Solicitação enviada",
        description: `Solicitação de conexão enviada para ${patient.nome} com sucesso.`
      });
      
      // Remove the connected patient from results
      setSearchResults(prev => prev.filter(p => p.id !== patient.id));
      
      // Refresh the patient list
      onPatientAdded();
    } catch (error) {
      console.error('Erro ao conectar com paciente:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível enviar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(prev => ({ ...prev, [patient.id]: false }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Procurar Paciente</DialogTitle>
          <DialogDescription>
            Busque por pacientes para solicitar uma conexão. Quando um paciente aceitar sua solicitação, 
            ele aparecerá na sua lista de pacientes ativos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 flex gap-2">
          <Input
            placeholder="Nome ou email do paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !searchTerm.trim()}
          >
            <Search className="h-4 w-4 mr-1" /> Buscar
          </Button>
        </div>
        
        {isSearching && (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-purple-500 rounded-full border-t-transparent"></div>
          </div>
        )}
        
        {!isSearching && searchResults.length > 0 && (
          <div className="overflow-y-auto max-h-96 border rounded-md">
            <ul className="divide-y">
              {searchResults.map((patient) => (
                <li key={patient.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{patient.nome}</p>
                    <p className="text-sm text-gray-500">{patient.email}</p>
                    {patient.phone && <p className="text-sm text-gray-500">{patient.phone}</p>}
                  </div>
                  <Button 
                    onClick={() => handleConnect(patient)} 
                    disabled={isConnecting[patient.id]}
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    {isConnecting[patient.id] ? 'Enviando...' : 'Conectar'}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {!isSearching && searchResults.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum paciente encontrado com os termos informados.</p>
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientSearchDialog;
