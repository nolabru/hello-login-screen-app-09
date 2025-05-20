
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableCell, TableRow, TableBody, TableHead, TableHeader, Table } from '@/components/ui/table';
import { Company } from './types';

interface CompanyListProps {
  companies: Company[];
  isLoading: boolean;
  onViewDetails: (company: Company) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({ companies, isLoading, onViewDetails }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="p-8 text-center">
            <p className="text-gray-500">Carregando empresas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="p-8 text-center">
            <p className="text-gray-500">Nenhuma empresa conectada.</p>
            <p className="text-sm text-gray-400 mt-2">Use o botão "Solicitar Conexão" para iniciar uma parceria com uma empresa.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium">Nome</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="text-right font-medium">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.contact_email}</TableCell>
                <TableCell>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      company.connection_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {company.connection_status === 'active' ? 'Conectada' : 'Pendente'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewDetails(company)}
                  >
                    Ver detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CompanyList;
