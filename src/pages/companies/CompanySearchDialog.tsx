
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableCell, TableRow, TableBody, TableHead, TableHeader, Table } from '@/components/ui/table';
import { Search, UserPlus } from 'lucide-react';
import { CompanySearchResult } from './types';

interface CompanySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  searchResults: CompanySearchResult[];
  onRequestConnection: (companyId: number) => void;
}

const CompanySearchDialog: React.FC<CompanySearchDialogProps> = ({
  open,
  onOpenChange,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  isSearching,
  searchResults,
  onRequestConnection
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar com Empresas</DialogTitle>
          <DialogDescription>
            Busque empresas para solicitar uma conexão.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por nome ou email da empresa..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {isSearching ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Buscando empresas...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.contact_email}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm"
                          onClick={() => onRequestConnection(company.id)}
                        >
                          <UserPlus size={16} className="mr-1" />
                          Conectar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : searchQuery.trim() && !isSearching ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Nenhuma empresa encontrada com este termo.</p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanySearchDialog;
