import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, Calendar } from 'lucide-react';

interface PatientProps {
  patient: {
    id: number;
    [key: string]: any;
  };
}

const PatientCard: React.FC<PatientProps> = ({ patient }) => {
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
            {patient.profile_photo ? (
              <AvatarImage 
                src={patient.profile_photo} 
                alt={patient.full_name || patient.preferred_name}
                onError={(e) => {
                  console.log('Erro ao carregar imagem de perfil:', e);
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
