
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, 
  CartesianGrid, Cell, LabelList, Pie, PieChart
} from 'recharts';
import { useSentimentData } from '@/hooks/useSentimentData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BarChart2, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';

// Cores para cada sentimento
const SENTIMENT_COLORS = {
  feliz: '#E8F5E8',    // Verde 
  triste: '#E3F2FD',   // Azul 
  ansioso: '#FFF3E0',  // Laranja 
  neutro: '#FFF5D3',   // Amarelo
  irritado: '#FFEBEE'  // Vermelho 
};

// Emojis para cada sentimento
const SENTIMENT_EMOJIS = {
  feliz: '😊',
  triste: '😢',
  ansioso: '😰',
  neutro: '😐',
  irritado: '😠'
};

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

// Tooltip personalizado com cores e percentuais
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Calcular o total para este período
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-gray-900 font-medium mb-3">{`Período: ${label}`}</p>
        
        {payload.map((entry: any, index: number) => {
          const sentiment = entry.dataKey as keyof typeof SENTIMENT_COLORS;
          const percentage = total > 0 ? Math.round((entry.value / total) * 100) : 0;
          
          return (
            <div key={index} className="flex items-center mb-2 last:mb-0">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: SENTIMENT_COLORS[sentiment] || entry.fill }}
              />
              <span className="font-medium mr-2">{entry.name}:</span>
              <span>{entry.value}</span>
              <span className="text-gray-500 ml-2">({percentage}%)</span>
              <span className="ml-2">{SENTIMENT_EMOJIS[sentiment]}</span>
            </div>
          );
        })}
        
        <div className="mt-2 pt-2 border-t border-gray-200">
          <span className="font-medium">Total:</span> {total}
        </div>
      </div>
    );
  }
  return null;
};

// Tipo de visualização do gráfico
type ChartType = 'bar' | 'pie';

const SentimentChart: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'week'>('month');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const { sentimentData, loading, error } = useSentimentData(period);
  
  // Determinar quais dados exibir
  const displayData = sentimentData.length > 0 ? sentimentData : fallbackData;
  const usingFallback = sentimentData.length === 0 && !loading && !error;
  
  // Calcular dados agregados para o gráfico de pizza
  const pieData = useMemo(() => {
    if (!displayData || displayData.length === 0) return [];
    
    // Somar todos os sentimentos de todos os períodos
    const totals = {
      feliz: 0,
      triste: 0,
      irritado: 0,
      ansioso: 0,
      neutro: 0
    };
    
    displayData.forEach(item => {
      totals.feliz += item.feliz || 0;
      totals.triste += item.triste || 0;
      totals.irritado += item.irritado || 0;
      totals.ansioso += item.ansioso || 0;
      totals.neutro += item.neutro || 0;
    });
    
    // Converter para o formato esperado pelo PieChart
    return Object.entries(totals).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalizar
      value,
      color: SENTIMENT_COLORS[key as keyof typeof SENTIMENT_COLORS]
    }));
  }, [displayData]);
  
  // Encontrar o sentimento predominante
  const predominantSentiment = useMemo(() => {
    if (pieData.length === 0) return null;
    
    return pieData.reduce((max, item) => 
      item.value > max.value ? item : max, pieData[0]);
  }, [pieData]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h3 className="text-lg font-medium text-neutral-700">Análise de Sentimentos</h3>
            {usingFallback && (
              <p className="text-sm text-amber-500 flex items-center gap-1 mt-1">
                <AlertCircle size={14} />
                Exibindo dados de exemplo (nenhum dado real encontrado)
              </p>
            )}
            
            {predominantSentiment && (
              <div className="mt-1 flex items-center">
                <Badge 
                  className="text-neutral-600" 
                  style={{ backgroundColor: predominantSentiment.color }}
                >
                  {SENTIMENT_EMOJIS[predominantSentiment.name.toLowerCase() as keyof typeof SENTIMENT_EMOJIS]} 
                  Sentimento Predominante: {predominantSentiment.name}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value as ChartType)}>
              <ToggleGroupItem value="bar" aria-label="Gráfico de Barras" title="Gráfico de Barras">
                <BarChart2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="pie" aria-label="Gráfico de Pizza" title="Gráfico de Pizza">
                <PieChartIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            
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
          <div className="w-full h-96 md:h-[400px]">
            {chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20
                  }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    dataKey="feliz" 
                    stackId="a" 
                    fill={SENTIMENT_COLORS.feliz} 
                    name="Feliz" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                  <Bar 
                    dataKey="triste" 
                    stackId="a" 
                    fill={SENTIMENT_COLORS.triste} 
                    name="Triste" 
                    radius={[0, 0, 0, 0]}
                    animationDuration={800}
                  />
                  <Bar 
                    dataKey="ansioso" 
                    stackId="a" 
                    fill={SENTIMENT_COLORS.ansioso} 
                    name="Ansioso" 
                    radius={[0, 0, 0, 0]}
                    animationDuration={800}
                  />
                  <Bar 
                    dataKey="neutro" 
                    stackId="a" 
                    fill={SENTIMENT_COLORS.neutro} 
                    name="Neutro" 
                    radius={[0, 0, 0, 0]}
                    animationDuration={800}
                  />
                  <Bar 
                    dataKey="irritado" 
                    stackId="a" 
                    fill={SENTIMENT_COLORS.irritado} 
                    name="Irritado" 
                    radius={[0, 0, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={130}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    animationDuration={800}
                    animationBegin={0}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    itemStyle={{ color: '#333' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color as string }}>
                        {SENTIMENT_EMOJIS[value.toLowerCase() as keyof typeof SENTIMENT_EMOJIS]} {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentChart;
