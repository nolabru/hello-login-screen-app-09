
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XCircle, Users, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { CompanyLicense, cancelLicense, activateLicense } from '@/services/licenseService';
import { useToast } from '@/components/ui/use-toast';
import LicenseUsersDialog from './LicenseUsersDialog';

interface CompanyLicenseInfoProps {
  license: CompanyLicense;
  onLicenseUpdated?: () => void;
  companyId: string;
}

const CompanyLicenseInfo: React.FC<CompanyLicenseInfoProps> = ({ license, onLicenseUpdated, companyId }) => {
  const { toast } = useToast();
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const usagePercentage = Math.min(100, Math.round((license.used_licenses / license.total_licenses) * 100));
  
  // Determinar cor baseado no percentual de uso
  let progressColor = "bg-green-500";
  if (usagePercentage > 90) {
    progressColor = "bg-red-500";
  } else if (usagePercentage > 70) {
    progressColor = "bg-yellow-500";
  }

  // Verificar se o status do pagamento é positivo (active ou completed são considerados como pagos)
  const isPaymentPositive = license.payment_status === 'completed' || license.payment_status === 'active';
  const isPending = license.payment_status === 'pending';
  
  // Verificar se a licença está ativa
  const isLicenseActive = license.status === 'active';

  const handleCancelLicense = async () => {
    try {
      await cancelLicense(license.id);
      toast({
        title: "Licença cancelada",
        description: "A licença pendente foi cancelada com sucesso.",
        variant: "default",
      });
      if (onLicenseUpdated) {
        onLicenseUpdated();
      }
    } catch (error) {
      console.error('Erro ao cancelar licença:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a licença. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleActivateLicense = async () => {
    try {
      await activateLicense(license.id);
      toast({
        title: "Licença ativada",
        description: "A licença foi ativada com sucesso.",
        variant: "default",
      });
      if (onLicenseUpdated) {
        onLicenseUpdated();
      }
    } catch (error) {
      console.error('Erro ao ativar licença:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar a licença. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = () => {
    if (license.used_licenses > 0) {
      setShowUsersDialog(true);
    } else {
      toast({
        title: "Nenhum usuário encontrado",
        description: "Não há usuários utilizando este plano de licença no momento.",
      });
    }
  };

  return (
    <>
      <Card 
        className={`mb-6 ${license.used_licenses > 0 ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        onClick={license.used_licenses > 0 ? handleCardClick : undefined}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium">{license.plan?.name || 'Plano'}</h3>
              <p className="text-sm text-gray-500">{license.plan?.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isLicenseActive ? 'default' : 'destructive'}>
                {isLicenseActive ? 'Ativo' : 'Inativo'}
              </Badge>
              
              {isPending && (
                <div className="flex space-x-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click event
                      handleActivateLicense();
                    }}
                  >
                    <CheckCircle size={16} />
                    <span>Ativar</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click event
                      handleCancelLicense();
                    }}
                  >
                    <XCircle size={16} />
                    <span>Cancelar</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Licenças Utilizadas</span>
                <span className="text-sm font-medium">{license.used_licenses} / {license.total_licenses}</span>
              </div>
              <Progress
                value={usagePercentage}
                className={`h-2 ${progressColor}`}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Data de início</p>
                <p className="font-medium">{format(new Date(license.start_date), 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de expiração</p>
                <p className="font-medium">{format(new Date(license.expiry_date), 'dd/MM/yyyy')}</p>
              </div>
            </div>
            
            <div className="mt-2 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Status do Pagamento</p>
                  <Badge variant={
                    isPaymentPositive ? 'outline' : 
                    license.payment_status === 'pending' ? 'secondary' : 
                    license.payment_status === 'canceled' ? 'outline' : 'destructive'
                  }>
                    {isPaymentPositive ? 'Pago' : 
                    license.payment_status === 'pending' ? 'Pendente' : 
                    license.payment_status === 'canceled' ? 'Cancelado' : 'Falha'}
                  </Badge>
                </div>
                {license.used_licenses > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click event
                      setShowUsersDialog(true);
                    }}
                  >
                    <Users size={16} />
                    <span>Ver Usuários</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <LicenseUsersDialog 
        open={showUsersDialog}
        onOpenChange={setShowUsersDialog}
        companyId={companyId}
        licenseId={license.id}
        planName={license.plan?.name || 'Plano'}
      />
    </>
  );
};

export default CompanyLicenseInfo;
