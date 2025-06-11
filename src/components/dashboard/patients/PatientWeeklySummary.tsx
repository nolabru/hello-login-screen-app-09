import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PatientWeeklySummaryProps {
  patient: any;
}

const PatientWeeklySummary: React.FC<PatientWeeklySummaryProps> = ({ patient }) => {
  // Lógica para determinar o sentimento predominante (hardcoded por enquanto)
  const predominantMood = "Triste";
  
  // Usar full_name ou preferred_name
  const patientName = patient.full_name || patient.preferred_name || "Paciente";
  
  // Mapeamento de moods para emojis minimalistas
  const moodEmojis: Record<string, string> = {
    feliz: ":)",
    triste: ":(",
    neutro: ":|",
    ansioso: ":S",
    irritado: ">:("
  };

  // Mapeamento de moods para cores de fundo
  const moodBackgroundColors: Record<string, string> = {
    feliz: "bg-green-100",
    triste: "bg-blue-100",
    neutro: "bg-gray-100",
    ansioso: "bg-yellow-100",
    irritado: "bg-red-100"
  };

  // Mapeamento de moods para cores de texto
  const moodTextColors: Record<string, string> = {
    feliz: "text-green-600",
    triste: "text-blue-600",
    neutro: "text-gray-600",
    ansioso: "text-yellow-600",
    irritado: "text-red-600"
  };

  // Função para obter o emoji baseado no mood
  const getMoodEmoji = (mood: string) => {
    return moodEmojis[mood.toLowerCase() as keyof typeof moodEmojis] || moodEmojis.neutro;
  };

  // Função para obter a classe de cor de fundo
  const getMoodBackgroundColor = (mood: string) => {
    return moodBackgroundColors[mood.toLowerCase() as keyof typeof moodBackgroundColors] || moodBackgroundColors.neutro;
  };

  // Função para obter a classe de cor de texto
  const getMoodTextColor = (mood: string) => {
    return moodTextColors[mood.toLowerCase() as keyof typeof moodTextColors] || moodTextColors.neutro;
  };

  // Dados hardcoded para o resumo semanal
  const weeklyData = {
    predominantMood: predominantMood.toLowerCase(),
    conversationCount: 12,
    topTopics: ["Ansiedade", "Trabalho", "Relacionamentos"],
    moodDistribution: {
      feliz: 20,
      triste: 45,
      neutro: 15,
      ansioso: 15,
      irritado: 5
    },
    weekSummary: `Durante esta semana, ${patientName} demonstrou predominantemente sentimentos de tristeza em suas interações com a AIA. As conversas frequentemente giraram em torno de preocupações com trabalho e relacionamentos, com menções recorrentes de ansiedade. Houve momentos de melhora no humor durante discussões sobre hobbies e atividades ao ar livre, mas o tom geral permaneceu melancólico. ${patientName} expressou interesse em desenvolver estratégias de enfrentamento para lidar com situações estressantes no trabalho e está aberto(a) a explorar técnicas de mindfulness nas próximas sessões.`
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        {/* Emoji do sentimento */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${getMoodBackgroundColor(weeklyData.predominantMood)}`}>
          <span className={`text-lg font-bold ${getMoodTextColor(weeklyData.predominantMood)}`}>
            {getMoodEmoji(weeklyData.predominantMood)}
          </span>
        </div>
        
        {/* Título */}
        <h2 className="text-xl font-semibold">
          Essa Semana {patientName} se Sentiu {predominantMood}
        </h2>
      </div>
      
      {/* Conteúdo do resumo semanal */}
      <div className="space-y-6">
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Conversas</div>
              <div className="text-2xl font-bold text-portal-purple">{weeklyData.conversationCount}</div>
              <div className="text-xs text-gray-500">Interações Esta Semana</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Humor Predominante</div>
              <div className="text-2xl font-bold text-portal-purple capitalize">{weeklyData.predominantMood}</div>
              <div className="text-xs text-gray-500">Em {weeklyData.moodDistribution[weeklyData.predominantMood as keyof typeof weeklyData.moodDistribution]}% das Interações</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Temas Principais</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {weeklyData.topTopics.map((topic, index) => (
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
            <h3 className="text-sm font-medium text-gray-900 mb-2">Resumo da Semana</h3>
            <p className="text-gray-700 text-sm whitespace-pre-line">
              {weeklyData.weekSummary}
            </p>
          </CardContent>
        </Card>
        
        {/* Distribuição de humor */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Distribuição de Humor</h3>
            <div className="space-y-3">
              {Object.entries(weeklyData.moodDistribution).map(([mood, percentage]) => (
                <div key={mood} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm capitalize">{mood}</span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getMoodBackgroundColor(mood)}`} 
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

export default PatientWeeklySummary;
