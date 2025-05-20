
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { CompanyLicense, cancelLicense } from '@/services/licenseService';
import { useToast } from '@/components/ui/use-toast';

interface CompanyLicenseInfoProps {
  license: CompanyLicense;
  onLicenseUpdated?: () => void;
}

const CompanyLicenseInfo: React.FC<CompanyLicenseInfoProps> = ({ license, onLicenseUpdated }) => {
  const { toast } = useToast();
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

  return (
    <Card className="mb-6">
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
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleCancelLicense}
              >
                <XCircle size={16} />
                <span>Cancelar</span>
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Licenças utilizadas</span>
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
            <p className="text-sm text-gray-500">Status do pagamento</p>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyLicenseInfo;
