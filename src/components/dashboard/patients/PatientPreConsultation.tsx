import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getSentimentBackgroundClass, 
  getSentimentTextClass,
  getSentimentEmoji
} from '@/lib/sentimentColors';
import { usePatientPreConsultation } from '@/hooks/usePatientPreConsultation';

interface PatientPreConsultationProps {
  patient: any;
}

const PatientPreConsultation: React.FC<PatientPreConsultationProps> = ({ patient }) => {
  // Usar full_name ou preferred_name
  const patientName = patient.full_name || patient.preferred_name || "Paciente";
  
  // Buscar dados reais do banco (últimas 2 semanas)
  const {
    conversationCount,
    predominantMood,
    topTopics,
    moodDistribution,
    consultationSummary,
    loading,
    error
  } = usePatientPreConsultation(patient.user_id);

  // Se estiver carregando, mostrar skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Skeleton className="w-12 h-12 rounded-full mr-4" />
          <Skeleton className="h-6 w-80" />
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Se houver erro, mostrar mensagem
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar pré-consulta</h3>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // Dados reais do banco (últimas 2 semanas)
  const preConsultationData = {
    predominantMood: predominantMood || 'neutro',
    conversationCount,
    topTopics: topTopics.length > 0 ? topTopics : ['Nenhum tema recente'],
    moodDistribution,
    consultationSummary: consultationSummary || 'Dados insuficientes para gerar resumo de pré-consulta.'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        {/* Emoji do sentimento */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${getSentimentBackgroundClass(preConsultationData.predominantMood)}`}>
          <span className={`text-lg font-bold ${getSentimentTextClass(preConsultationData.predominantMood)}`}>
            {getSentimentEmoji(preConsultationData.predominantMood)}
          </span>
        </div>
        
        {/* Título */}
        <h2 className="text-xl font-semibold">
          Preparação para Consulta com {patientName}
        </h2>
      </div>
      
      {/* Conteúdo da pré-consulta */}
      <div className="space-y-6">
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Conversas Recentes</div>
              <div className="text-2xl font-bold text-portal-purple">{preConsultationData.conversationCount}</div>
              <div className="text-xs text-gray-500">Interações Registradas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Estado Emocional Atual</div>
              <div className="text-2xl font-bold text-portal-purple capitalize">{preConsultationData.predominantMood}</div>
              <div className="text-xs text-gray-500">Em {preConsultationData.moodDistribution[preConsultationData.predominantMood as keyof typeof preConsultationData.moodDistribution]}% das Interações</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Temas para Abordar</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {preConsultationData.topTopics.map((topic, index) => (
                  <span key={index} className="text-xs bg-portal-purple/10 text-portal-purple px-2 py-1 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Resumo textual */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Resumo para Consulta</h3>
            <p className="text-gray-700 text-sm whitespace-pre-line">
              {preConsultationData.consultationSummary}
            </p>
          </CardContent>
        </Card>
        
        {/* Distribuição de humor */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Distribuição de Humor Recente</h3>
            <div className="space-y-3">
              {Object.entries(preConsultationData.moodDistribution).map(([mood, percentage]) => (
                <div key={mood} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm capitalize">{mood}</span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getSentimentBackgroundClass(mood)}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientPreConsultation;
