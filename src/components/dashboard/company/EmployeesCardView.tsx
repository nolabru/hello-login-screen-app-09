
import React, { useEffect, useState } from 'react';
import { Phone, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import type { Employee } from './EmployeesTableView';

interface EmployeesCardViewProps {
  employees: Employee[];
  onRemoveEmployee: (id: number) => void;
}

const EmployeesCardView: React.FC<EmployeesCardViewProps> = ({
  employees,
  onRemoveEmployee
}) => {
  // Estado para armazenar as URLs das imagens de perfil
  const [profileImageUrls, setProfileImageUrls] = useState<Record<string, string>>({});
  
  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return "??";
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Função para obter a URL pública da imagem usando a API do Supabase
  useEffect(() => {
    const getProfilePhotoUrls = async () => {
      const urls: Record<string, string> = {};
      
      for (const employee of employees) {
        if (employee.profile_photo) {
          try {
            // Usar a API oficial do Supabase para obter a URL pública
            const { data } = supabase.storage.from('profiles').getPublicUrl(employee.profile_photo);
            
            if (data?.publicUrl) {
              urls[employee.id] = data.publicUrl;
            } else {
              // Tentar construir a URL manualmente como fallback
              const supabaseUrl = "https://ygafwrebafehwaomibmm.supabase.co";
              urls[employee.id] = `${supabaseUrl}/storage/v1/object/public/profiles/${employee.profile_photo}`;
            }
          } catch (error) {
            console.error('Erro ao obter URL da imagem:', error);
          }
        }
      }
      
      setProfileImageUrls(urls);
    };
    
    if (employees.length > 0) {
      getProfilePhotoUrls();
    }
  }, [employees]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map((employee) => (
        <Card key={employee.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="bg-portal-purple/10 p-4 flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                {profileImageUrls[employee.id] ? (
                  <AvatarImage 
                    src={profileImageUrls[employee.id]} 
                    alt={employee.nome}
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      console.log('Erro ao carregar imagem de perfil:', e);
                      // Converter e.target para HTMLImageElement
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.style.display = 'none'; // Esconde a imagem com erro
                    }}
                  />
                ) : (
                  <AvatarFallback className="bg-portal-purple text-white text-lg">
                    {getInitials(employee.nome)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-medium text-lg text-neutral-800">
                  {employee.nome || 'Nome não disponível'}
                </h3>
                <p className="text-sm text-gray-500">
                  {employee.gender ? `${employee.gender} • ` : ''}
                  {employee.age_range || ''}
                </p>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {employee.email && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-portal-purple" />
                  <span className="text-sm text-gray-700">{employee.email}</span>
                </div>
              )}
              
              {employee.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-portal-purple" />
                  <span className="text-sm text-gray-700">{employee.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-portal-purple" />
                <span className="text-sm text-gray-700">
                  {employee.created_at 
                    ? `Funcionário desde ${new Date(employee.created_at).toLocaleDateString('pt-BR')}`
                    : 'Data de vinculação não disponível'
                  }
                </span>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onRemoveEmployee(employee.id)}
                >
                  Desvincular
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmployeesCardView;
