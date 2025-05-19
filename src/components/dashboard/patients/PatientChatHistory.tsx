
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Loader2, CalendarClock, Bot } from 'lucide-react';

interface PatientChatHistoryProps {
  patientId: number;
}

interface ChatInteraction {
  id: number;
  created_at: string;
  content?: string;
  type?: string;
  sentiment?: string;
}

const PatientChatHistory: React.FC<PatientChatHistoryProps> = ({ patientId }) => {
  const [interactions, setInteractions] = useState<ChatInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        // Fetch associations to get interaction data
        // In a real application, you'd fetch the actual chat data from your database
        const { data: associationData, error: associationError } = await supabase
          .from('user_psychologist_associations')
          .select('id_relacao, atualizado_em')
          .eq('id_usuario', patientId)
          .order('atualizado_em', { ascending: false });

        if (associationError) throw associationError;

        // Transform the association data to simulate chat interactions
        // In a real application, replace this with actual chat data
        const chatInteractions = associationData?.map((assoc, index) => ({
          id: assoc.id_relacao || index,
          created_at: assoc.atualizado_em || new Date().toISOString(),
          content: 'Conversa com a AIA sobre ansiedade e técnicas de relaxamento',
          type: 'message',
          sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)]
        })) || [];

        // Add some more simulated interactions for demo purposes
        if (chatInteractions.length > 0) {
          const dates = [
            new Date(new Date().setDate(new Date().getDate() - 2)),
            new Date(new Date().setDate(new Date().getDate() - 5)),
            new Date(new Date().setDate(new Date().getDate() - 7))
          ];
          
          const topics = [
            'Discussão sobre gerenciamento de stress no ambiente de trabalho',
            'Conversas sobre técnicas de mindfulness e meditação',
            'Diálogo sobre relacionamentos interpessoais e comunicação assertiva'
          ];
          
          const additionalInteractions = dates.map((date, idx) => ({
            id: 1000 + idx,
            created_at: date.toISOString(),
            content: topics[idx],
            type: 'message',
            sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)]
          }));
          
          chatInteractions.push(...additionalInteractions);
        }

        setInteractions(chatInteractions);
      } catch (error) {
        console.error('Erro ao buscar histórico de chat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [patientId]);

  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return 'bg-gray-100';
    
    switch(sentiment) {
      case 'positive':
        return 'bg-green-100 border-green-200';
      case 'negative':
        return 'bg-red-100 border-red-200';
      case 'neutral':
      default:
        return 'bg-blue-100 border-blue-200';
    }
  };

  const getSentimentText = (sentiment?: string) => {
    if (!sentiment) return '';
    
    switch(sentiment) {
      case 'positive':
        return 'Positivo';
      case 'negative':
        return 'Negativo';
      case 'neutral':
      default:
        return 'Neutro';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 text-portal-purple animate-spin" />
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">Nenhuma interação encontrada para este paciente</p>
      </div>
    );
  }

  // Group interactions by date
  const groupedInteractions: { [date: string]: ChatInteraction[] } = {};
  
  interactions.forEach(interaction => {
    const date = new Date(interaction.created_at).toLocaleDateString('pt-BR');
    if (!groupedInteractions[date]) {
      groupedInteractions[date] = [];
    }
    groupedInteractions[date].push(interaction);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedInteractions).map(([date, dateInteractions]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock className="h-4 w-4 text-portal-purple" />
            <h3 className="text-sm font-medium text-portal-purple">{date}</h3>
          </div>
          
          {dateInteractions.map((interaction) => (
            <div 
              key={interaction.id} 
              className={`p-4 border rounded-lg shadow-sm ${getSentimentColor(interaction.sentiment)}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-portal-purple" />
                    <p className="font-medium text-portal-purple">Interação com AIA</p>
                    {interaction.sentiment && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        interaction.sentiment === 'positive' ? 'bg-green-200 text-green-800' :
                        interaction.sentiment === 'negative' ? 'bg-red-200 text-red-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {getSentimentText(interaction.sentiment)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{interaction.content}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {format(new Date(interaction.created_at), "HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PatientChatHistory;
