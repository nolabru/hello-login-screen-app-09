import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getSentimentBackgroundClass, 
  getSentimentTextClass,
  getSentimentEmoji
} from '@/lib/sentimentColors';
import { usePatientGeneralSummary } from '@/hooks/usePatientGeneralSummary';

interface PatientGeneralSummaryProps {
  patient: any;
}

const PatientGeneralSummary: React.FC<PatientGeneralSummaryProps> = ({ patient }) => {
  // Usar full_name ou preferred_name
  const patientName = patient.full_name || patient.preferred_name || "Paciente";
  
  // Buscar dados reais do banco
  const {
    totalConversations,
    predominantMood,
    daysActive,
    topTopics,
    moodDistribution,
    generalSummary,
    loading,
    error
  } = usePatientGeneralSummary(patient.user_id);

  // Se estiver carregando, mostrar skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Skeleton className="w-12 h-12 rounded-full mr-4" />
          <Skeleton className="h-6 w-64" />
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
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
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
          <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar resumo</h3>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // Dados reais do banco
  const generalData = {
    predominantMood: predominantMood || 'neutro',
    totalConversations,
    daysActive,
    topTopics: topTopics.length > 0 ? topTopics : ['Nenhum tema identificado'],
    moodDistribution,
    generalSummary: generalSummary || 'Dados insuficientes para gerar resumo.'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        {/* Emoji do sentimento */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${getSentimentBackgroundClass(generalData.predominantMood)}`}>
          <span className={`text-lg font-bold ${getSentimentTextClass(generalData.predominantMood)}`}>
            {getSentimentEmoji(generalData.predominantMood)}
          </span>
        </div>
        
        {/* Título */}
        <h2 className="text-xl font-semibold">
          Panorama Geral de {patientName}
        </h2>
      </div>
      
      {/* Conteúdo do resumo geral */}
      <div className="space-y-6">
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Total de Conversas</div>
              <div className="text-2xl font-bold text-portal-purple">{generalData.totalConversations}</div>
              <div className="text-xs text-gray-500">Desde o Início</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Humor Predominante</div>
              <div className="text-2xl font-bold text-portal-purple capitalize">{generalData.predominantMood}</div>
              <div className="text-xs text-gray-500">Em {generalData.moodDistribution[generalData.predominantMood as keyof typeof generalData.moodDistribution]}% das Interações</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Dias Ativos</div>
              <div className="text-2xl font-bold text-portal-purple">{generalData.daysActive}</div>
              <div className="text-xs text-gray-500">Usando o App</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Temas principais */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Temas Principais</h3>
            <div className="flex flex-wrap gap-2">
              {generalData.topTopics.map((topic, index) => (
                <span key={index} className="text-sm bg-portal-purple/10 text-portal-purple px-3 py-1 rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Resumo textual */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Resumo Geral</h3>
            <p className="text-gray-700 text-sm whitespace-pre-line">
              {generalData.generalSummary}
            </p>
          </CardContent>
        </Card>
        
        {/* Distribuição de humor */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Distribuição de Humor Geral</h3>
            <div className="space-y-3">
              {Object.entries(generalData.moodDistribution).map(([mood, percentage]) => (
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

export default PatientGeneralSummary;
