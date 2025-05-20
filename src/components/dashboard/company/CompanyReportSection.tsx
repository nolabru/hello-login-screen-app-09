
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ReportData } from '@/hooks/useReportData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface CompanyReportSectionProps {
  title: string;
  sectionKey: string;
  reportData: ReportData;
  updateReportField: (sectionKey: string, fieldKey: string, value: string) => void;
}

const CompanyReportSection: React.FC<CompanyReportSectionProps> = ({ 
  title, 
  sectionKey,
  reportData,
  updateReportField
}) => {
  const section = reportData[sectionKey];
  const { toast } = useToast();
  
  useEffect(() => {
    // Only fetch data for company info section
    if (sectionKey === 'companyInfo') {
      const fetchCompanyData = async () => {
        try {
          // Get current company ID from localStorage (this should be set during login)
          const companyId = localStorage.getItem('companyId');
          
          if (!companyId) {
            console.log('Company ID not found in localStorage');
            return;
          }
          
          const { data, error } = await supabase
            .from('companies')
            .select('name, razao_social, cnpj')
            .eq('id', companyId)
            .single();
          
          if (error) {
            console.error('Error fetching company data:', error);
            return;
          }
          
          if (data) {
            // Pre-fill company information fields with data from Supabase
            if (data.razao_social && !reportData.companyInfo.fields.companyName.value) {
              updateReportField('companyInfo', 'companyName', data.razao_social);
            }
            
            if (data.cnpj && !reportData.companyInfo.fields.cnpj.value) {
              updateReportField('companyInfo', 'cnpj', data.cnpj);
            }
            
            toast({
              title: "Dados da empresa carregados",
              description: "Informações básicas da empresa foram preenchidas automaticamente."
            });
          }
        } catch (error) {
          console.error('Error in fetchCompanyData:', error);
        }
      };
      
      fetchCompanyData();
    }
  }, [sectionKey, updateReportField]);
  
  if (!section) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Preencha as informações deste tópico do relatório
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(section.fields).map(([fieldKey, field]) => (
          <div key={fieldKey} className="space-y-2">
            <Label htmlFor={`${sectionKey}-${fieldKey}`} className="font-medium">
              {field.label}
            </Label>
            {field.multiline ? (
              <Textarea 
                id={`${sectionKey}-${fieldKey}`}
                placeholder={`Informe ${field.label.toLowerCase()}`}
                value={field.value || ''}
                onChange={(e) => updateReportField(sectionKey, fieldKey, e.target.value)}
                rows={5}
                className="resize-none"
              />
            ) : (
              <Input 
                id={`${sectionKey}-${fieldKey}`}
                placeholder={`Informe ${field.label.toLowerCase()}`}
                value={field.value || ''}
                onChange={(e) => updateReportField(sectionKey, fieldKey, e.target.value)}
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CompanyReportSection;
