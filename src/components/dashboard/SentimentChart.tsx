
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const sentimentData = [
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
  },
  {
    name: 'Abr',
    feliz: 35,
    triste: 6,
    irritado: 4,
    ansioso: 10,
    neutro: 20
  },
  {
    name: 'Mai',
    feliz: 40,
    triste: 5,
    irritado: 3,
    ansioso: 8,
    neutro: 18
  },
  {
    name: 'Jun',
    feliz: 38,
    triste: 7,
    irritado: 5,
    ansioso: 12,
    neutro: 22
  }
];

const SentimentChart: React.FC = () => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-6 text-neutral-700">Análise de Sentimentos</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sentimentData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="feliz" stackId="a" fill="#E8F5E8" stroke="#22c55e" strokeWidth={1} name="Feliz" />
              <Bar dataKey="triste" stackId="a" fill="#E3F2FD" stroke="#3b82f6" strokeWidth={1} name="Triste" />
              <Bar dataKey="ansioso" stackId="a" fill="#FFF3E0" stroke="#f97316" strokeWidth={1} name="Ansioso" />
              <Bar dataKey="neutro" stackId="a" fill="#FFF5D3" stroke="#eab308" strokeWidth={1} name="Neutro" />
              <Bar dataKey="irritado" stackId="a" fill="#FFEBEE" stroke="#ef4444" strokeWidth={1} name="Irritado" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentChart;
