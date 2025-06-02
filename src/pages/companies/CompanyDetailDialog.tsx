import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Clock, Calendar, Users } from 'lucide-react';
import { CompanyDetail } from './types';
import { formatDate } from './utils';
interface CompanyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyDetail | null;
}
const CompanyDetailDialog: React.FC<CompanyDetailDialogProps> = ({
  open,
  onOpenChange,
  company
}) => {
  if (!company) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Conexão</DialogTitle>
          <DialogDescription>
            Informações sobre sua conexão com esta empresa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="">
          <div className="space-y-2">
            <h3 className="font-medium">Empresa</h3>
            <p>{company.name}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Email de contato</h3>
            <p>{company.contact_email}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Status da conexão</h3>
            <p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${company.connection_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {company.connection_status === 'active' ? 'Conectada' : 'Pendente'}
              </span>
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-500" />
              <h3 className="font-medium">Funcionários</h3>
            </div>
            <p>{company.employee_count || 0} funcionário(s)</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <h3 className="font-medium">Data da solicitação</h3>
            </div>
            <p>{formatDate(company.created_at)}</p>
          </div>
          
          {company.updated_at && company.created_at !== company.updated_at && <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                <h3 className="font-medium">Última atualização</h3>
              </div>
              <p>{formatDate(company.updated_at)}</p>
            </div>}
        </div>
      </DialogContent>
    </Dialog>;
};
export default CompanyDetailDialog;