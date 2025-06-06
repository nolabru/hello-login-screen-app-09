
import React, { useEffect, useState } from 'react';
import { User, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import EmployeeStatusBadge from './EmployeeStatusBadge';

export type Employee = {
  id: number;
  nome: string;
  email: string;
  status: boolean;
  connection_status: string;
  phone?: string;
  company_name?: string;
  // Novos campos adicionados
  profile_photo?: string;
  gender?: string;
  age_range?: string;
  created_at?: string;
  license_status?: string;
  employee_status?: string; // Novo campo para rastrear o status do funcionário
};

interface EmployeesTableViewProps {
  employees: Employee[];
  onRemoveEmployee: (id: number) => void;
}

const EmployeesTableView: React.FC<EmployeesTableViewProps> = ({
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
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="font-medium">Nome</TableHead>
          <TableHead className="font-medium">Email</TableHead>
          <TableHead className="font-medium">Telefone</TableHead>
          <TableHead className="font-medium">Status</TableHead>
          <TableHead className="text-right font-medium">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
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
                    <AvatarFallback className="bg-portal-purple text-white text-xs">
                      {getInitials(employee.nome)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div>{employee.nome}</div>
                  {employee.gender && employee.age_range && (
                    <div className="text-xs text-gray-500">
                      {employee.gender} • {employee.age_range}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{employee.email}</TableCell>
            <TableCell>{employee.phone || 'Não informado'}</TableCell>
            <TableCell>
              <EmployeeStatusBadge status={employee.employee_status} />
            </TableCell>
            <TableCell className="text-right">
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onRemoveEmployee(employee.id)}
              >
                Desvincular
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default EmployeesTableView;
