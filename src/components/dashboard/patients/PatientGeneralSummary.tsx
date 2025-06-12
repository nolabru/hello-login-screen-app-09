import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  getSentimentBackgroundClass, 
  getSentimentTextClass,
  getSentimentEmoji
} from '@/lib/sentimentColors';

interface PatientGeneralSummaryProps {
  patient: any;
}

const PatientGeneralSummary: React.FC<PatientGeneralSummaryProps> = ({ patient }) => {
  // Lógica para determinar o sentimento predominante (hardcoded por enquanto)
  const predominantMood = "Neutro";
  
  // Usar full_name ou preferred_name
  const patientName = patient.full_name || patient.preferred_name || "Paciente";
  

  // Número de dias ativos (hardcoded por enquanto)
  const daysActive = 45;
  
  // Dados hardcoded para o resumo geral
  const generalData = {
    predominantMood: predominantMood.toLowerCase(),
    totalConversations: 87,
    daysActive: daysActive,
    topTopics: ["Ansiedade", "Trabalho", "Relacionamentos", "Saúde", "Família"],
    moodDistribution: {
      feliz: 25,
      triste: 30,
      neutro: 20,
      ansioso: 15,
      irritado: 10
    },
    generalSummary: `Desde que começou a usar o app há ${daysActive} dias, ${patientName} tem demonstrado uma tendência variada de humor, com períodos de tristeza e ansiedade intercalados com momentos de neutralidade e felicidade. No geral, o humor predominante tem sido neutro, com flutuações significativas durante períodos de estresse no trabalho e em relacionamentos pessoais.

As conversas frequentemente abordam temas como ansiedade, desafios no ambiente de trabalho e dinâmicas de relacionamentos, com ênfase particular em estratégias de enfrentamento para situações estressantes. Questões relacionadas à saúde e família também aparecem com regularidade.

Ao longo do tempo, observa-se um padrão de maior abertura para discutir emoções difíceis e uma evolução gradual na capacidade de identificar gatilhos de ansiedade. ${patientName} tem demonstrado interesse consistente em técnicas de mindfulness e regulação emocional, com alguns sinais de progresso na implementação dessas estratégias no dia a dia.`
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
              <div className="text-xs text-gray-500">Desde o início</div>
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
