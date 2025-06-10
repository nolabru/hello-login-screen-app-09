import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { useCompanySentimentData } from "@/hooks/useCompanySentimentData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Cores para cada sentimento (fundo)
const SENTIMENT_COLORS = {
  feliz: "#A5D6A7",    // Verde mais escuro
  triste: "#90CAF9",   // Azul mais escuro
  ansioso: "#FFCC80",  // Laranja mais escuro
  neutro: "#FFD54F",   // Amarelo mais escuro
  irritado: "#EF9A9A", // Vermelho mais escuro
};

// Cores para texto (mais escuras para contraste)
const SENTIMENT_TEXT_COLORS = {
  feliz: "#388E3C",    // Verde escuro
  triste: "#1976D2",   // Azul escuro
  ansioso: "#FF933B",  // Laranja escuro
  neutro: "#F5CC00",   // Cinza escuro
  irritado: "#D32F2F", // Vermelho escuro
};

// Função para obter a cor de texto baseada no sentimento
const getTextColor = (sentiment: string): string => {
  return SENTIMENT_TEXT_COLORS[sentiment as keyof typeof SENTIMENT_TEXT_COLORS] || "#333333";
};

// Dados de fallback para quando não há dados reais
const fallbackData = [
  {
    name: "Sem 1 Jan",
    feliz: 1,
    triste: 0,
    irritado: 0,
    ansioso: 3,
    neutro: 0,
  },
  {
    name: "Sem 2 Jan",
    feliz: 3,
    triste: 1,
    irritado: 0,
    ansioso: 4,
    neutro: 0,
  },
  {
    name: "Sem 3 Jan",
    feliz: 4,
    triste: 3,
    irritado: 1,
    ansioso: 5,
    neutro: 0,
  },
  {
    name: "Sem 4 Jan",
    feliz: 5,
    triste: 4,
    irritado: 3,
    ansioso: 5,
    neutro: 1,
  },
];

// Tooltip personalizado com cores e percentuais
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Calcular o total para este período
    const total = payload.reduce(
      (sum: number, entry: any) => sum + (entry.value || 0),
      0
    );

    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-gray-900 font-medium mb-3 capitalize">{`Período: ${label}`}</p>

        {payload.map((entry: any, index: number) => {
          const sentiment = entry.dataKey as keyof typeof SENTIMENT_COLORS;
          const percentage =
            total > 0 ? Math.round((entry.value / total) * 100) : 0;

          return (
            <div key={index} className="flex items-center mb-2 last:mb-0">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor: SENTIMENT_COLORS[sentiment] || entry.fill,
                }}
              />
              <span className="text-neutral-600 font-medium mr-2">
                {entry.name}:
              </span>
              <span className="text-neutral-600">{entry.value}</span>
              <span className="text-neutral-500 ml-2">({percentage}%)</span>
            </div>
          );
        })}

        <div className="mt-2 pt-2 border-t border-gray-200">
          <span className="font-medium text-neutral-600">
            Interações com a AIA:
          </span>{" "}
          {total}
        </div>
      </div>
    );
  }
  return null;
};

const CompanySentimentChart: React.FC = () => {
  const [period, setPeriod] = useState<"month" | "week">("week");
  const { sentimentData, loading, error } = useCompanySentimentData(period);

  // Determinar quais dados exibir
  const displayData = sentimentData.length > 0 ? sentimentData : fallbackData;
  const usingFallback = sentimentData.length === 0 && !loading && !error;

  // Determinar quais sentimentos estão sendo usados (têm pelo menos um valor > 0)
  const usedSentiments = useMemo(() => {
    const sentiments = {
      feliz: false,
      triste: false,
      irritado: false,
      ansioso: false,
      neutro: false,
    };

    displayData.forEach((item) => {
      if (item.feliz > 0) sentiments.feliz = true;
      if (item.triste > 0) sentiments.triste = true;
      if (item.irritado > 0) sentiments.irritado = true;
      if (item.ansioso > 0) sentiments.ansioso = true;
      if (item.neutro > 0) sentiments.neutro = true;
    });

    return sentiments;
  }, [displayData]);

  // Encontrar o sentimento predominante
  const predominantSentiment = useMemo(() => {
    if (displayData.length === 0) return null;

    // Somar todos os sentimentos de todos os períodos
    const totals = {
      feliz: 0,
      triste: 0,
      irritado: 0,
      ansioso: 0,
      neutro: 0,
    };

    displayData.forEach((item) => {
      totals.feliz += item.feliz || 0;
      totals.triste += item.triste || 0;
      totals.irritado += item.irritado || 0;
      totals.ansioso += item.ansioso || 0;
      totals.neutro += item.neutro || 0;
    });

    // Encontrar o sentimento com maior valor
    let maxSentiment = "neutro";
    let maxValue = 0;

    Object.entries(totals).forEach(([sentiment, value]) => {
      if (value > maxValue) {
        maxValue = value;
        maxSentiment = sentiment;
      }
    });

    return {
      name: maxSentiment.charAt(0).toUpperCase() + maxSentiment.slice(1),
      value: maxValue,
      color: SENTIMENT_COLORS[maxSentiment as keyof typeof SENTIMENT_COLORS],
    };
  }, [displayData]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h3 className="text-lg font-medium text-neutral-700">
              Análise de Sentimentos dos Funcionários
            </h3>
            {usingFallback && (
              <p className="text-sm text-amber-500 flex items-center gap-1 mt-1">
                <AlertCircle size={14} />
                Exibindo Dados de Exemplo (Nenhum funcionário interagiu com a AIA)
              </p>
            )}

            {predominantSentiment && (
              <div className="mt-1 flex items-center">
                <Badge
                  className="font-medium"
                  style={{ 
                    backgroundColor: predominantSentiment.color,
                    color: getTextColor(predominantSentiment.name.toLowerCase())
                  }}
                >
                  Sentimento Predominante: {predominantSentiment.name}
                </Badge>
              </div>
            )}
          </div>

          <div>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as "month" | "week")}
            >
              <SelectTrigger className="w-[130px]">
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={displayData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis tickCount={6} domain={[0, 'dataMax']} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  height={36}
                  iconSize={0}
                  formatter={(value, entry) => (
                    <span className="flex items-center">
                      <svg width="8" height="8" className="mr-1">
                        <circle cx="4" cy="4" r="3" fill={(entry as any).color} />
                      </svg>
                      <span 
                        className="text-neutral-600"
                        style={{ color: getTextColor(value.toLowerCase()) }}
                      >
                        {value}
                      </span>
                    </span>
                  )}
                />
                
                {/* Renderizar linhas apenas para sentimentos utilizados, mas manter a legenda para todos */}
                <Line
                  type="monotone"
                  dataKey="feliz"
                  stroke={SENTIMENT_COLORS.feliz}
                  name="Feliz"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={800}
                  hide={!usedSentiments.feliz}
                />
                <Line
                  type="monotone"
                  dataKey="triste"
                  stroke={SENTIMENT_COLORS.triste}
                  name="Triste"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={800}
                  hide={!usedSentiments.triste}
                />
                <Line
                  type="monotone"
                  dataKey="ansioso"
                  stroke={SENTIMENT_COLORS.ansioso}
                  name="Ansioso"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={800}
                  hide={!usedSentiments.ansioso}
                />
                <Line
                  type="monotone"
                  dataKey="neutro"
                  stroke={SENTIMENT_COLORS.neutro}
                  name="Neutro"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={800}
                  hide={!usedSentiments.neutro}
                />
                <Line
                  type="monotone"
                  dataKey="irritado"
                  stroke={SENTIMENT_COLORS.irritado}
                  name="Irritado"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={800}
                  hide={!usedSentiments.irritado}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanySentimentChart;
