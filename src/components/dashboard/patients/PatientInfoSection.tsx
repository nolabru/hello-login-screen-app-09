import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PatientInfoSectionProps {
  patient: any;
}

const PatientInfoSection: React.FC<PatientInfoSectionProps> = ({ patient }) => {
  // Função para renderizar um campo de informação
  const renderInfoField = (label: string, value: any) => {
    if (value === undefined || value === null || value === '') return null;
    
    return (
      <div className="py-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-500">{label}</span>
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      </div>
    );
  };

  // Função para renderizar um array como lista
  const renderArrayField = (label: string, values: string[] | null | undefined) => {
    if (!values || values.length === 0) return null;
    
    return (
      <div className="py-2">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <ul className="mt-1 list-disc list-inside">
          {values.map((value, index) => (
            <li key={index} className="text-sm text-gray-900">{value}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-900">Dados Pessoais</h3>
          <Separator />
          
          {renderInfoField("Nome Completo", patient.full_name)}
          {renderInfoField("Nome Preferido", patient.preferred_name)}
          {renderInfoField("E-mail", patient.email)}
          {renderInfoField("Telefone", patient.phone_number)}
          {renderInfoField("Gênero", patient.gender)}
          {renderInfoField("Faixa Etária", patient.age_range)}
        </div>
        
        <div className="space-y-1 pt-4">
          <h3 className="text-sm font-medium text-gray-900">Informações de Saúde Mental</h3>
          <Separator />
          
          {renderInfoField("Experiência com Saúde Mental", patient.mental_health_experience)}
          {renderArrayField("Objetivos com a AIA", patient.aia_objectives)}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoSection;
