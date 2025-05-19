
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';

interface PatientChatHistoryProps {
  patientId: number;
}

interface ChatInteraction {
  id: number;
  created_at: string;
  content?: string;
  type?: string;
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
          content: 'Interação com a AIA',
          type: 'message'
        })) || [];

        setInteractions(chatInteractions);
      } catch (error) {
        console.error('Erro ao buscar histórico de chat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-portal-purple rounded-full border-t-transparent"></div>
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

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => (
        <div 
          key={interaction.id} 
          className="p-4 bg-gradient-to-r from-purple-50 to-white border border-gray-100 rounded-lg shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="font-medium text-portal-purple">Interação com AIA</p>
              <p className="text-gray-700">{interaction.content}</p>
            </div>
            <span className="text-xs text-gray-400">
              {interaction.created_at 
                ? format(new Date(interaction.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) 
                : 'Data desconhecida'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientChatHistory;
