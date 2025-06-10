import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { usePsychologistDailyInteractions } from "@/hooks/usePsychologistDailyInteractions";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Cores para cada sentimento (fundo mais claro)
const SENTIMENT_COLORS = {
  feliz: "#E8F5E9",    // Verde claro
  triste: "#E3F2FD",   // Azul claro
  ansioso: "#FFF8E1",  // Laranja claro
  neutro: "#FFFDE7",   // Amarelo claro
  irritado: "#FFEBEE", // Vermelho claro
};

// Cores para texto (mais escuras para contraste)
const SENTIMENT_TEXT_COLORS = {
  feliz: "#1B5E20",    // Verde muito escuro
  triste: "#0D47A1",   // Azul muito escuro
  ansioso: "#E65100",  // Laranja muito escuro
  neutro: "#F57F17",   // Amarelo muito escuro
  irritado: "#B71C1C", // Vermelho muito escuro
};

// Função para obter a cor de texto baseada no sentimento
const getTextColor = (sentiment: string): string => {
  return SENTIMENT_TEXT_COLORS[sentiment as keyof typeof SENTIMENT_TEXT_COLORS] || "#333333";
};

// Função para obter as iniciais do nome
const getInitials = (fullName: string | null, preferredName: string | null): string => {
  const name = fullName || preferredName;
  if (!name) return "??";
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Função para obter o nome de exibição
const getDisplayName = (fullName: string | null, preferredName: string | null): string => {
  return fullName || preferredName || "Paciente";
};

// Função para formatar a data
const formatDate = (date: Date): string => {
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  // Garantir que o nome do mês comece com letra maiúscula
  return formattedDate.replace(/(?:^|\s)([a-z])/g, function(m, p1) {
    return m.replace(p1, p1.toUpperCase());
  });
};

const PsychologistDailyInteractionsCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { interactionData, loading, error, daysWithInteractions } = usePsychologistDailyInteractions(selectedDate);

  // Função para destacar dias com interações no calendário
  const modifiers = {
    hasInteraction: (date: Date) => {
      return daysWithInteractions.includes(date.getDate()) && 
             date.getMonth() === new Date().getMonth() &&
             date.getFullYear() === new Date().getFullYear();
    }
  };

  // Estilos para os dias com interações
  const modifiersStyles = {
    hasInteraction: {
      backgroundColor: "#f3f4f6",
      borderRadius: "100%",
      color: "#4f46e5",
      fontWeight: "bold"
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4 text-neutral-700">
          Calendário de Interações
        </h3>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex justify-center">
            <Calendar 
              mode="single" 
              selected={selectedDate} 
              onSelect={setSelectedDate} 
              className="rounded-md border shadow p-3 pointer-events-auto"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
            />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium mb-3 text-neutral-700">
              Interações AIA - Pacientes em {selectedDate ? formatDate(selectedDate) : ""}
            </h4>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-md animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-36 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 border rounded-md">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-500 font-medium mb-2">Erro ao carregar dados</p>
                <p className="text-gray-500">{error}</p>
              </div>
            ) : interactionData.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <p className="text-amber-500 font-medium mb-2">Nenhuma Interação Encontrada</p>
                <p className="text-gray-500">Não há registros de interações para esta data.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {interactionData.map((patient) => (
                  <div key={patient.user_id} className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarFallback className="bg-portal-purple/10 text-portal-purple">
                        {getInitials(patient.full_name, patient.preferred_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-700">
                        {getDisplayName(patient.full_name, patient.preferred_name)}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-500">
                          {patient.interactionCount} {patient.interactionCount === 1 ? "Interação" : "Interações"}
                        </span>
                        <Badge
                          className="font-medium text-xs"
                          style={{ 
                            backgroundColor: SENTIMENT_COLORS[patient.predominantMood as keyof typeof SENTIMENT_COLORS] || SENTIMENT_COLORS.neutro,
                            color: getTextColor(patient.predominantMood)
                          }}
                        >
                          {patient.predominantMood.charAt(0).toUpperCase() + patient.predominantMood.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PsychologistDailyInteractionsCalendar;
