
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CompanyLicense } from '@/services/licenseService';

interface CompanyLicenseInfoProps {
  license: CompanyLicense;
}

const CompanyLicenseInfo: React.FC<CompanyLicenseInfoProps> = ({ license }) => {
  const usagePercentage = Math.min(100, Math.round((license.used_licenses / license.total_licenses) * 100));
  
  // Determinar cor baseado no percentual de uso
  let progressColor = "bg-green-500";
  if (usagePercentage > 90) {
    progressColor = "bg-red-500";
  } else if (usagePercentage > 70) {
    progressColor = "bg-yellow-500";
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">{license.plan?.name || 'Plano'}</h3>
            <p className="text-sm text-gray-500">{license.plan?.description}</p>
          </div>
          <Badge variant={license.status === 'active' ? 'default' : 'destructive'}>
            {license.status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
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
              license.payment_status === 'completed' ? 'outline' : 
              license.payment_status === 'pending' ? 'secondary' : 'destructive'
            }>
              {license.payment_status === 'completed' ? 'Pago' : 
               license.payment_status === 'pending' ? 'Pendente' : 'Falha'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyLicenseInfo;
