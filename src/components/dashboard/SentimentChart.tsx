
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const sentimentData = [
  { name: 'Jan', positivo: 40, neutro: 24, negativo: 10 },
  { name: 'Fev', positivo: 30, neutro: 25, negativo: 15 },
  { name: 'Mar', positivo: 20, neutro: 30, negativo: 20 },
  { name: 'Abr', positivo: 45, neutro: 20, negativo: 10 },
  { name: 'Mai', positivo: 50, neutro: 15, negativo: 5 },
  { name: 'Jun', positivo: 45, neutro: 20, negativo: 10 },
];

const SentimentChart: React.FC = () => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-6">Análise de Sentimentos</h3>
        <div className="h-80">
          <ChartContainer
            config={{
              positivo: { color: '#9b87f5' },
              neutro: { color: '#e5deff' },
              negativo: { color: '#ffdee2' },
            }}
          >
            <BarChart data={sentimentData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="positivo" stackId="a" fill="var(--color-positivo)" name="Positivo" />
              <Bar dataKey="neutro" stackId="a" fill="var(--color-neutro)" name="Neutro" />
              <Bar dataKey="negativo" stackId="a" fill="var(--color-negativo)" name="Negativo" />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentChart;
