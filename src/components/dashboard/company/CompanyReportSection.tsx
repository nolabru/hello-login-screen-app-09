import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ReportData } from '@/hooks/useReportData';
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
  if (!section) return null;
  return <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium  text-neutral-700">{title}</CardTitle>
        <CardDescription>
          Preencha as informações deste tópico do relatório
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(section.fields).map(([fieldKey, field]) => <div key={fieldKey} className="space-y-2">
            <Label htmlFor={`${sectionKey}-${fieldKey}`} className="font-medium">
              {field.label}
            </Label>
            {field.multiline ? <Textarea id={`${sectionKey}-${fieldKey}`} placeholder={`Informe ${field.label.toLowerCase()}`} value={field.value || ''} onChange={e => updateReportField(sectionKey, fieldKey, e.target.value)} rows={5} className="resize-none" /> : <Input id={`${sectionKey}-${fieldKey}`} placeholder={`Informe ${field.label.toLowerCase()}`} value={field.value || ''} onChange={e => updateReportField(sectionKey, fieldKey, e.target.value)} />}
          </div>)}
      </CardContent>
    </Card>;
};
export default CompanyReportSection;