import React, { useState } from 'react';
import { SessionInsight } from '@/hooks/usePatientInsights';
import PatientInsightCard from './PatientInsightCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface PatientInsightsListProps {
  insights: SessionInsight[];
}

const PatientInsightsList: React.FC<PatientInsightsListProps> = ({ insights }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Extrair todos os tópicos únicos de todos os insights
  const allTopics = Array.from(
    new Set(
      insights.flatMap(insight => insight.topics || [])
    )
  );

  // Filtrar insights com base no termo de busca e tópico selecionado
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = 
      searchTerm === '' || 
      insight.ai_advice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.long_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (insight.topics || []).some(topic => 
        topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesTopic = 
      selectedTopic === 'all' || 
      (insight.topics || []).includes(selectedTopic);
    
    return matchesSearch && matchesTopic;
  });

  // Ordenar insights
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar nos insights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={selectedTopic}
            onValueChange={(value) => setSelectedTopic(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tópico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tópicos</SelectItem>
              {allTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as 'newest' | 'oldest')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {sortedInsights.length === 0 ? (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <p>Nenhum insight encontrado com os filtros atuais.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedInsights.map((insight) => (
            <PatientInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientInsightsList;
