import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SessionInsight } from '@/hooks/usePatientInsights';

interface PatientInsightCardProps {
  insight: SessionInsight;
}

const PatientInsightCard: React.FC<PatientInsightCardProps> = ({ insight }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Formatar a data
  const formattedDate = new Date(insight.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Formatar a hora
  const formattedTime = new Date(insight.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg">
          <span>Sessão de {formattedDate}</span>
          <span className="text-sm text-gray-500">{formattedTime}</span>
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {insight.topics && insight.topics.map((topic, index) => (
            <Badge key={index} variant="outline" className="bg-portal-purple/10 text-portal-purple">
              {topic}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2 text-neutral-700">Recomendação da IA</h4>
          <p className="text-gray-700 text-sm">{insight.ai_advice}</p>
        </div>
        
        {expanded && (
          <div>
            <h4 className="font-medium mb-2 text-neutral-700">Resumo Detalhado</h4>
            <p className="text-gray-700 text-sm whitespace-pre-line">{insight.long_summary}</p>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpanded}
          className="w-full flex items-center justify-center text-portal-purple hover:text-portal-purple/80 hover:bg-portal-purple/10"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              <span>Ver menos</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              <span>Ver mais</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PatientInsightCard;
