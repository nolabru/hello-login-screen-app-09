
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserProfile } from '@/types/user';
import { Company } from '@/types/company';
import { CompanyLicense } from '@/types/license';
import { checkLicenseAvailability } from '@/services/licenseService';

interface AssignCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToAssign: UserProfile | null;
  companies: Company[] | undefined;
  companiesLoading: boolean;
  onConfirmAssign: () => Promise<void>;
  selectedCompanyId: string;
  onSelectedCompanyIdChange: (value: string) => void;
  licenseInfo: CompanyLicense | null;
  isLoading: boolean;
}

const AssignCompanyDialog: React.FC<AssignCompanyDialogProps> = ({
  open,
  onOpenChange,
  userToAssign,
  companies,
  companiesLoading,
  onConfirmAssign,
  selectedCompanyId,
  onSelectedCompanyIdChange,
  licenseInfo,
  isLoading
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir Empresa</DialogTitle>
          <DialogDescription>
            Selecione a empresa para o usuário {userToAssign?.nome}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="company" className="text-sm font-medium">
              Empresa
            </label>
            {companiesLoading ? (
              <div>Carregando empresas...</div>
            ) : (
              <Select value={selectedCompanyId} onValueChange={onSelectedCompanyIdChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Nenhuma empresa</SelectItem>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* License information section */}
          {selectedCompanyId && selectedCompanyId !== 'null' && (
            <div className="mt-2 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium mb-2">Informações de Licença</h3>
              {licenseInfo ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-medium">{licenseInfo.total}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Em uso</p>
                      <p className="font-medium">{licenseInfo.used}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Disponíveis</p>
                      <p className={`font-medium ${licenseInfo.available <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {licenseInfo.available}
                      </p>
                    </div>
                  </div>
                  
                  {licenseInfo.available <= 0 && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      Não há licenças disponíveis para esta empresa. É necessário adquirir mais licenças.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-center py-2">
                  <p className="text-sm text-gray-500">Carregando informações de licença...</p>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={onConfirmAssign} 
            disabled={isLoading || (selectedCompanyId && selectedCompanyId !== 'null' && (!licenseInfo || licenseInfo.available <= 0))}
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignCompanyDialog;
