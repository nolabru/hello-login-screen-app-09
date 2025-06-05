import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
const PatientsList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();

  useEffect(() => {
    // Simular carregamento para manter a experiência do usuário
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  return <div className="w-full p-6">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-medium text-neutral-700">
          Seus Pacientes
        </h1>
        <p className="text-gray-500">
          Gerencie seus pacientes e visualize seus históricos de interação com a AIA
        </p>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="text-neutral-700">Pacientes Ativos</TabsTrigger>
          <TabsTrigger value="pending" className="text-neutral-700">Solicitações Pendentes</TabsTrigger>
          <TabsTrigger value="all" className="text-neutral-700">Todos</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-portal-purple"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Funcionalidade Indisponível</h3>
            <p className="text-gray-500 text-center max-w-md">
              A funcionalidade de associação entre psicólogos e pacientes foi removida do sistema.
              Entre em contato com o suporte para mais informações.
            </p>
          </div>
        )}
      </Tabs>
    </div>;
};
export default PatientsList;
