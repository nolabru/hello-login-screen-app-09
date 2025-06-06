
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSentimentData } from '@/hooks/useSentimentData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

// Dados de fallback para quando não há dados reais
const fallbackData = [
  {
    name: 'Jan',
    feliz: 25,
    triste: 8,
    irritado: 5,
    ansioso: 12,
    neutro: 15
  },
  {
    name: 'Fev',
    feliz: 30,
    triste: 10,
    irritado: 7,
    ansioso: 15,
    neutro: 18
  },
  {
    name: 'Mar',
    feliz: 20,
    triste: 15,
    irritado: 10,
    ansioso: 20,
    neutro: 12
  }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-gray-900 font-medium mb-2">{`Período: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-gray-800 text-sm">
            <span className="font-medium">{entry.name}:</span> {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SentimentChart: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'week'>('month');
  const { sentimentData, loading, error } = useSentimentData(period);
  
  // Determinar quais dados exibir
  const displayData = sentimentData.length > 0 ? sentimentData : fallbackData;
  const usingFallback = sentimentData.length === 0 && !loading && !error;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-medium text-neutral-700">Análise de Sentimentos</h3>
            {usingFallback && (
              <p className="text-sm text-amber-500 flex items-center gap-1 mt-1">
                <AlertCircle size={14} />
                Exibindo dados de exemplo (nenhum dado real encontrado)
              </p>
            )}
          </div>
          
          <Select value={period} onValueChange={(value) => setPeriod(value as 'month' | 'week')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mensal</SelectItem>
              <SelectItem value="week">Semanal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <div className="w-full h-80 flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : error ? (
          <div className="w-full h-80 flex items-center justify-center text-red-500 text-center p-6">
            <div>
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p className="font-medium">Erro ao carregar dados</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="feliz" stackId="a" fill="#4CAF50" name="Feliz" />
                <Bar dataKey="triste" stackId="a" fill="#2196F3" name="Triste" />
                <Bar dataKey="ansioso" stackId="a" fill="#FF9800" name="Ansioso" />
                <Bar dataKey="neutro" stackId="a" fill="#FFEB3B" name="Neutro" />
                <Bar dataKey="irritado" stackId="a" fill="#F44336" name="Irritado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentChart;
