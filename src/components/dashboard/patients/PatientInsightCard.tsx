import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, Tag, Lightbulb, FileText } from 'lucide-react';
import { SessionInsight } from '@/hooks/usePatientInsights';

interface PatientInsightCardProps {
  insight: SessionInsight;
}

const PatientInsightCard: React.FC<PatientInsightCardProps> = ({ insight }) => {
  const [expanded, setExpanded] = useState(false);

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
  const getMoodEmoji = (mood: string | undefined) => {
    if (!mood) return moodEmojis.neutro;
    return moodEmojis[mood.toLowerCase() as keyof typeof moodEmojis] || moodEmojis.neutro;
  };

  // Função para obter a classe de cor de fundo
  const getMoodBackgroundColor = (mood: string | undefined) => {
    if (!mood) return moodBackgroundColors.neutro;
    return moodBackgroundColors[mood.toLowerCase() as keyof typeof moodBackgroundColors] || moodBackgroundColors.neutro;
  };

  // Função para obter a classe de cor de texto
  const getMoodTextColor = (mood: string | undefined) => {
    if (!mood) return moodTextColors.neutro;
    return moodTextColors[mood.toLowerCase() as keyof typeof moodTextColors] || moodTextColors.neutro;
  };

  // Função para capitalizar a primeira letra de cada palavra
  const capitalizeWords = (string: string) => {
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Função para formatar data e hora
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const today = new Date();
    
    // Verificar se é hoje
    const isToday = date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear();
    
    // Formatar hora
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (isToday) {
      return `Hoje, ${hours}:${minutes}`;
    } else {
      // Formatar data
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}, ${hours}:${minutes}`;
    }
  };

  return (
    <Card 
      className="mb-4 overflow-hidden cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        <div className="flex">
          {/* Emoji minimalista baseado no mood com cor de fundo correspondente */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${getMoodBackgroundColor(insight.mood)}`}>
            <span className={`text-lg font-bold ${getMoodTextColor(insight.mood)}`}>
              {getMoodEmoji(insight.mood)}
            </span>
          </div>
          
          {/* Conteúdo principal */}
          <div className="flex-1">
            {/* Summary da sessão */}
            <p className="text-gray-800 font-medium">{insight.summary || "Sem resumo disponível"}</p>
            
            {/* Data e hora */}
            <div className="flex items-center mt-2 text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {formatDateTime(insight.started_at || insight.created_at)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Conteúdo expandido */}
        {expanded && (
          <div className="mt-4 pt-4 border-t">
            <div className="mb-4 bg-white rounded-xl p-4">
              <h4 className="font-medium mb-2 text-neutral-700 flex items-center">
                <Tag className="h-4 w-4 mr-2 text-portal-purple" />
                Temas da Conversa
              </h4>
              <div className="flex flex-wrap gap-2">
                {insight.topics && insight.topics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="bg-portal-purple/10 text-portal-purple">
                    {capitalizeWords(topic)}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="mb-4 bg-white rounded-xl p-4">
              <h4 className="font-medium mb-2 text-neutral-700 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-portal-purple" />
                Reflexão Detalhada
              </h4>
              <p className="text-gray-700 text-sm">{insight.ai_advice}</p>
            </div>
            
            <div className="bg-white rounded-xl p-4">
              <h4 className="font-medium mb-2 text-neutral-700 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-portal-purple" />
                Resumo da Conversa
              </h4>
              <p className="text-gray-700 text-sm whitespace-pre-line">{insight.long_summary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientInsightCard;
