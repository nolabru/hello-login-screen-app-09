import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, Calendar, Clock, MoreVertical, Unlink, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { 
  disassociatePatientFromPsychologist,
  cancelPendingInvite
} from '@/integrations/supabase/psychologistPatientsService';

interface PatientProps {
  patient: {
    id: string | number;
    [key: string]: any;
  };
  isPending?: boolean;
}

const PatientCard: React.FC<PatientProps> = ({ patient, isPending = false }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // Estado para armazenar a URL da imagem
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // Estados para controlar os diálogos de confirmação
  const [showDisassociateDialog, setShowDisassociateDialog] = useState(false);
  const [showCancelInviteDialog, setShowCancelInviteDialog] = useState(false);
  
  // Log para depuração
  console.log('Dados do paciente:', patient);
  console.log('Nome do arquivo da foto:', patient.profile_photo);
  console.log('Tipo do profile_photo:', typeof patient.profile_photo);
  
  // Função para obter a URL pública da imagem usando a API do Supabase
  useEffect(() => {
    const getProfilePhotoUrl = async () => {
      if (!patient.profile_photo) return;
      
      try {
        // Se o valor já for uma URL completa
        if (typeof patient.profile_photo === 'string' && patient.profile_photo.startsWith('http')) {
          console.log('profile_photo já é uma URL completa');
          setImageUrl(patient.profile_photo);
          return;
        }
        
        // Se for um objeto com uma propriedade path ou url
        if (typeof patient.profile_photo === 'object' && patient.profile_photo !== null) {
          const path = patient.profile_photo.path || patient.profile_photo.url;
          if (path) {
            console.log('profile_photo é um objeto com path/url:', path);
            setImageUrl(path);
            return;
          }
        }
        
        // Usar a API oficial do Supabase para obter a URL pública
        console.log('Tentando obter URL pública via API Supabase');
        const { data } = supabase.storage.from('profiles').getPublicUrl(patient.profile_photo);
        console.log('URL pública obtida via API:', data?.publicUrl);
        
        if (data?.publicUrl) {
          setImageUrl(data.publicUrl);
        } else {
          // Tentar construir a URL manualmente como fallback
          const supabaseUrl = "https://ygafwrebafehwaomibmm.supabase.co";
          const fallbackUrl = `${supabaseUrl}/storage/v1/object/public/profiles/${patient.profile_photo}`;
          console.log('Fallback URL:', fallbackUrl);
          setImageUrl(fallbackUrl);
        }
      } catch (error) {
        console.error('Erro ao obter URL da imagem:', error);
        setImageUrl(null);
      }
    };
    
    getProfilePhotoUrl();
  }, [patient.profile_photo]);
  
  // Função para obter as iniciais do nome
  const getInitials = () => {
    const nameToUse = patient.full_name || patient.preferred_name;
    
    if (!nameToUse) return "??"; // Retornar um valor padrão se o nome não existir
    
    return nameToUse
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Função para cancelar o convite pendente
  const handleCancelInvite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Impedir que o card seja clicado
    
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('ID do psicólogo não encontrado');
      }
      
      // Usar connection_id para cancelar o convite
      if (!patient.connection_id) {
        throw new Error('ID da conexão não encontrado');
      }
      
      console.log('Dados do convite para cancelamento:', {
        connection_id: patient.connection_id,
        psychologistId
      });
      
      await cancelPendingInvite(patient.connection_id, psychologistId);
      
      toast({
        title: 'Convite Cancelado',
        description: 'O convite para o paciente foi cancelado com sucesso.',
      });
      
      // Disparar evento para atualizar a lista de pacientes
      window.dispatchEvent(new CustomEvent('patientConnectionUpdated'));
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o convite. Tente novamente.',
        variant: 'destructive'
      });
    }
    
    setShowCancelInviteDialog(false);
  };
  
  // Função para desvincular o paciente
  const handleDisassociatePatient = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Impedir que o card seja clicado
    
    try {
      const psychologistId = localStorage.getItem('psychologistId');
      if (!psychologistId) {
        throw new Error('ID do psicólogo não encontrado');
      }
      
      // Usar user_id se disponível, caso contrário usar id
      const patientId = patient.user_id ? String(patient.user_id) : String(patient.id);
      
      console.log('Dados do paciente para desvinculação:', {
        id: patient.id,
        user_id: patient.user_id,
        idUsado: patientId,
        psychologistId
      });
      
      await disassociatePatientFromPsychologist(patientId, psychologistId);
      
      toast({
        title: 'Paciente Desvinculado',
        description: 'O paciente foi desvinculado com sucesso.',
      });
      
      // Disparar evento para atualizar a lista de pacientes
      window.dispatchEvent(new CustomEvent('patientConnectionUpdated'));
    } catch (error) {
      console.error('Erro ao desvincular paciente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desvincular o paciente. Tente novamente.',
        variant: 'destructive'
      });
    }
    
    setShowDisassociateDialog(false);
  };
  
  // Função para navegar para a página de detalhes do paciente
  const handleCardClick = (e: React.MouseEvent) => {
    // Se o clique foi no menu ou no diálogo, não navegar
    if ((e.target as HTMLElement).closest('.dropdown-menu-container')) {
      return;
    }
    
    // Usar user_id em vez de id para a navegação
    // Isso garante compatibilidade com o hook usePatientDetails que busca pelo campo user_id
    if (patient.user_id) {
      console.log('Navegando para detalhes do paciente usando user_id:', patient.user_id);
      navigate(`/patients/${patient.user_id}`);
    } else {
      console.log('user_id não encontrado, usando id como fallback:', patient.id);
      navigate(`/patients/${patient.id}`);
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" 
      onClick={handleCardClick}
    >
      <CardContent className="p-0 relative">
        <div className="bg-portal-purple/10 p-4 flex items-center gap-4 relative">
          {/* Menu de contexto */}
          <div className="absolute top-2 right-2 z-10 dropdown-menu-container" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-full hover:bg-gray-200 focus:outline-none">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isPending ? (
                  <DropdownMenuItem onClick={() => setShowCancelInviteDialog(true)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar Convite
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setShowDisassociateDialog(true)}>
                    <Unlink className="h-4 w-4 mr-2" />
                    Desvincular Paciente
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Avatar className="h-16 w-16 border-2 border-white">
            {imageUrl ? (
              <AvatarImage 
                src={imageUrl} 
                alt={patient.full_name || patient.preferred_name}
                style={{
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  console.log('Erro ao carregar imagem de perfil:', e);
                  console.log('URL da imagem que falhou:', imageUrl);
                  // Converter e.target para HTMLImageElement
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.style.display = 'none'; // Esconde a imagem com erro
                }} 
              />
            ) : (
              <AvatarFallback className="bg-portal-purple text-white text-lg">
                {getInitials()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="font-medium text-lg text-neutral-800">
              {patient.full_name || 'Nome não disponível'}
            </h3>
            <p className="text-sm text-gray-500">
              {patient.gender ? `${patient.gender} • ` : ''}
              {patient.age_range || ''}
            </p>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          
          {patient.phone_number && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-portal-purple" />
              <span className="text-sm text-gray-700">{patient.phone_number}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-portal-purple" />
            <span className="text-sm text-gray-700">
              {patient.created_at 
                ? isPending 
                  ? `Convite Enviado em ${new Date(patient.created_at).toLocaleDateString('pt-BR')}`
                  : `Vinculado desde ${new Date(patient.created_at).toLocaleDateString('pt-BR')}`
                : 'Data não disponível'
              }
            </span>
          </div>
          
          {isPending && patient.patient_email && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-portal-purple" />
              <span className="text-sm text-gray-700">{patient.patient_email}</span>
            </div>
          )}
          
          {/* Indicador de pendente no canto inferior direito */}
          {isPending && (
            <div className="absolute bottom-2 right-2 w-7 h-7 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          )}
          
        </div>
      </CardContent>
      
      {/* Diálogo de confirmação para desvincular paciente */}
      <AlertDialog open={showDisassociateDialog} onOpenChange={setShowDisassociateDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desvincular este paciente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDisassociatePatient} 
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo de confirmação para cancelar convite */}
      <AlertDialog open={showCancelInviteDialog} onOpenChange={setShowCancelInviteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Convite</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o convite enviado para {patient.patient_email}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Não</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelInvite} 
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default PatientCard;
