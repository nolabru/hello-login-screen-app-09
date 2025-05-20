
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { fetchLicensePlans, acquireLicense, LicensePlan } from '@/services/licenseService';
import { addMonths } from 'date-fns';

interface AcquireLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  onLicenseAcquired: () => void;
}

const AcquireLicenseDialog: React.FC<AcquireLicenseDialogProps> = ({
  open,
  onOpenChange,
  companyId,
  onLicenseAcquired
}) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<LicensePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [licenseCount, setLicenseCount] = useState(1);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const loadPlans = async () => {
        try {
          const availablePlans = await fetchLicensePlans();
          setPlans(availablePlans);
          if (availablePlans.length > 0) {
            setSelectedPlan(availablePlans[0].id);
          }
        } catch (error) {
          console.error('Erro ao carregar planos de licença:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar os planos de licença',
            variant: 'destructive',
          });
        }
      };

      loadPlans();
    }
  }, [open, toast]);

  const handleSubmit = async () => {
    if (!selectedPlan) {
      toast({
        title: 'Erro',
        description: 'Selecione um plano de licença',
        variant: 'destructive',
      });
      return;
    }

    if (licenseCount < 1) {
      toast({
        title: 'Erro',
        description: 'O número de licenças deve ser pelo menos 1',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const startDate = new Date();
      // Data de expiração (1 ano se for plano anual, 1 mês se for plano mensal)
      const expiryDate = billingCycle === 'yearly' ? addMonths(startDate, 12) : addMonths(startDate, 1);

      await acquireLicense(companyId, selectedPlan, licenseCount, startDate, expiryDate);
      
      toast({
        title: 'Sucesso',
        description: 'Licenças adquiridas com sucesso',
      });
      
      onLicenseAcquired();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao adquirir licenças:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adquirir as licenças',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPlanDetails = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return null;
    
    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const total = price * licenseCount;
    
    return {
      price,
      total
    };
  };
  
  const selectedPlanDetails = getSelectedPlanDetails();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Adquirir Licenças</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="font-medium mb-4">Selecione um plano</h3>
          
          <RadioGroup value={selectedPlan?.toString()} onValueChange={(value) => setSelectedPlan(parseInt(value))}>
            <div className="space-y-4">
              {plans.map(plan => (
                <div key={plan.id} className="flex items-center">
                  <RadioGroupItem id={`plan-${plan.id}`} value={plan.id.toString()} />
                  <Label htmlFor={`plan-${plan.id}`} className="ml-2 flex-1">
                    <Card className={`cursor-pointer p-3 ${selectedPlan === plan.id ? 'border-purple-500' : ''}`}>
                      <CardContent className="p-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold">{plan.name}</h4>
                            <p className="text-sm text-gray-500">{plan.description}</p>
                            <p className="text-xs text-gray-400">Até {plan.max_users} usuários</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              R$ {billingCycle === 'yearly' ? plan.price_yearly.toFixed(2) : plan.price_monthly.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {billingCycle === 'yearly' ? 'por ano' : 'por mês'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          
          <div className="mt-6">
            <h3 className="font-medium mb-4">Ciclo de cobrança</h3>
            <div className="flex space-x-4">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                onClick={() => setBillingCycle('monthly')}
              >
                Mensal
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                onClick={() => setBillingCycle('yearly')}
              >
                Anual (10% de desconto)
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-4">Quantidade de licenças</h3>
            <Input
              type="number"
              value={licenseCount}
              onChange={(e) => setLicenseCount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
          </div>
          
          {selectedPlanDetails && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Valor por licença:</span>
                <span>R$ {selectedPlanDetails.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold mt-2">
                <span>Valor total:</span>
                <span>R$ {selectedPlanDetails.total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {billingCycle === 'yearly' ? 'Cobrado anualmente' : 'Cobrado mensalmente'}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Processando...' : 'Adquirir Licenças'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AcquireLicenseDialog;
