import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PatientDetailsHeaderProps {
  patient: any;
}

const PatientDetailsHeader: React.FC<PatientDetailsHeaderProps> = ({ patient }) => {
  const navigate = useNavigate();

  // Função para obter as iniciais do nome
  const getInitials = () => {
    const nameToUse = patient.full_name || patient.preferred_name;
    
    if (!nameToUse) return "??";
    
    return nameToUse
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Função para obter a URL da imagem de perfil
  const getProfilePhotoUrl = (fileName: string) => {
    if (!fileName) return null;
    
    const supabaseUrl = "https://ygafwrebafehwaomibmm.supabase.co";
    return `${supabaseUrl}/storage/v1/object/public/profiles/${fileName}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Detalhes do Paciente</h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar className="h-24 w-24 border-2 border-white">
          {patient.profile_photo ? (
            <AvatarImage 
              src={getProfilePhotoUrl(patient.profile_photo)} 
              alt={patient.full_name || patient.preferred_name}
              className="object-cover w-full h-full"
              onError={(e) => {
                console.log('Erro ao carregar imagem de perfil:', e);
                const imgElement = e.target as HTMLImageElement;
                imgElement.style.display = 'none';
              }} 
            />
          ) : (
            <AvatarFallback className="bg-portal-purple text-white text-2xl">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            {patient.full_name || patient.preferred_name || 'Nome não disponível'}
          </h2>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600">
            {patient.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-portal-purple" />
                <span>{patient.email}</span>
              </div>
            )}
            
            {patient.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-portal-purple" />
                <span>{patient.phone_number}</span>
              </div>
            )}
            
            {patient.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-portal-purple" />
                <span>
                  Vinculado desde {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsHeader;
