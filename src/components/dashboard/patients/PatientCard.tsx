import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PatientProps {
  patient: {
    id: number;
    [key: string]: any;
  };
}

const PatientCard: React.FC<PatientProps> = ({ patient }) => {
  // Estado para armazenar a URL da imagem
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
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

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="bg-portal-purple/10 p-4 flex items-center gap-4">
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
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{patient.phone_number}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {patient.created_at 
                ? `Vinculado desde ${new Date(patient.created_at).toLocaleDateString('pt-BR')}`
                : 'Data de vinculação não disponível'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
