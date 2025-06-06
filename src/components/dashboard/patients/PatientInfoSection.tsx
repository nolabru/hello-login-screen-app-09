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
        
        <div className="space-y-1 pt-4">
          <h3 className="text-sm font-medium text-gray-900">Informações do Sistema</h3>
          <Separator />
          
          {renderInfoField("ID do Usuário", patient.user_id)}
          {renderInfoField("ID do Perfil", patient.id)}
          {renderInfoField("Data de Criação", patient.created_at ? new Date(patient.created_at).toLocaleString('pt-BR') : null)}
          {renderInfoField("Última Atualização", patient.updated_at ? new Date(patient.updated_at).toLocaleString('pt-BR') : null)}
        </div>
        
        {/* Renderizar todos os outros campos que não foram explicitamente incluídos acima */}
        <div className="space-y-1 pt-4">
          <h3 className="text-sm font-medium text-gray-900">Dados Adicionais</h3>
          <Separator />
          
          {Object.entries(patient).map(([key, value]) => {
            // Ignorar campos que já foram renderizados acima
            const ignoredFields = [
              'id', 'user_id', 'full_name', 'preferred_name', 'email', 'phone_number',
              'gender', 'age_range', 'mental_health_experience', 'aia_objectives',
              'created_at', 'updated_at', 'profile_photo'
            ];
            
            if (ignoredFields.includes(key)) return null;
            
            // Renderizar campos de array
            if (Array.isArray(value)) {
              return renderArrayField(key, value as string[]);
            }
            
            // Renderizar campos de objeto
            if (typeof value === 'object' && value !== null) {
              return (
                <div key={key} className="py-2">
                  <span className="text-sm font-medium text-gray-500">{key}</span>
                  <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              );
            }
            
            // Renderizar campos simples
            return renderInfoField(key, value);
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoSection;
