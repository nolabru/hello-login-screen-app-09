import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SentimentData {
  name: string; // Período (mês)
  feliz: number;
  triste: number;
  irritado: number;
  ansioso: number;
  neutro: number;
}

export function useSentimentData(period: 'month' | 'week' = 'month') {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSentimentData() {
      try {
        setLoading(true);
        
        // Obter o ID do psicólogo logado
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) {
          throw new Error('ID do psicólogo não encontrado');
        }
        
        console.log('Buscando dados de sentimentos para o psicólogo:', psychologistId);
        
        // 1. Buscar pacientes vinculados ao psicólogo usando o cliente Supabase
        const { data: patients, error: patientsError } = await supabase
          .from('user_profiles')
          .select('id, user_id, preferred_name, full_name')
          .eq('psychologist_id', psychologistId);
        
        if (patientsError) {
          throw new Error(`Erro ao buscar pacientes: ${patientsError.message}`);
        }
        console.log('Pacientes encontrados:', patients);
        
        if (!patients || patients.length === 0) {
          console.log('Nenhum paciente encontrado para o psicólogo');
          setSentimentData([]);
          setLoading(false);
          return;
        }
        
        // 2. Extrair IDs dos pacientes e filtrar valores nulos/indefinidos
        const patientUserIds = patients
          .map((patient: any) => patient.user_id)
          .filter(Boolean); // Remove valores nulos/undefined/vazios
        
        console.log('IDs dos pacientes:', patientUserIds);
        
        if (patientUserIds.length === 0) {
          console.log('Nenhum ID de usuário válido encontrado para os pacientes');
          setSentimentData([]);
          setLoading(false);
          return;
        }
        
        // 3. Buscar sessões desses pacientes com mood usando o cliente Supabase
        const { data: sessions, error: sessionsError } = await supabase
          .from('call_sessions')
          .select('id, user_id, mood, started_at')
          .in('user_id', patientUserIds);
        
        if (sessionsError) {
          throw new Error(`Erro ao buscar sessões: ${sessionsError.message}`);
        }
        console.log('Sessões encontradas:', sessions);
        
        if (!sessions || sessions.length === 0) {
          console.log('Nenhuma sessão encontrada para os pacientes');
          setSentimentData([]);
          setLoading(false);
          return;
        }
        console.log('Sessões encontradas:', sessions);
        
        // 4. Processar e agregar os dados por período
        const aggregatedData = aggregateByPeriod(sessions, period);
        console.log('Dados agregados:', aggregatedData);
        
        setSentimentData(aggregatedData);
      } catch (error: any) {
        console.error('Erro ao buscar dados de sentimentos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSentimentData();
  }, [period]);
  
  return { sentimentData, loading, error };
}

// Função auxiliar para agregar dados por período
function aggregateByPeriod(sessions: any[], period: 'month' | 'week'): SentimentData[] {
  // Objeto para armazenar contagens por período
  const periodCounts: Record<string, Record<string, number>> = {};
  
  // Processar cada sessão
  sessions.forEach(session => {
    if (!session.mood) return; // Ignorar sessões sem mood
    
    // Determinar o período (mês ou semana)
    const date = new Date(session.started_at);
    let periodKey;
    
    if (period === 'month') {
      // Formato: "Jan 2025"
      periodKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    } else {
      // Formato: "Sem 1 Jan"
      const weekNumber = Math.ceil(date.getDate() / 7);
      periodKey = `Sem ${weekNumber} ${date.toLocaleDateString('pt-BR', { month: 'short' })}`;
    }
    
    // Inicializar o período se não existir
    if (!periodCounts[periodKey]) {
      periodCounts[periodKey] = {
        feliz: 0,
        triste: 0,
        irritado: 0,
        ansioso: 0,
        neutro: 0
      };
    }
    
    // Incrementar a contagem do mood correspondente
    const mood = session.mood.toLowerCase();
    if (periodCounts[periodKey][mood] !== undefined) {
      periodCounts[periodKey][mood]++;
    } else {
      // Se for um mood não reconhecido, considerar como neutro
      periodCounts[periodKey].neutro++;
    }
  });
  
  // Converter para o formato esperado pelo gráfico
  return Object.entries(periodCounts)
    .map(([name, counts]) => ({
      name,
      feliz: counts.feliz || 0,
      triste: counts.triste || 0,
      irritado: counts.irritado || 0,
      ansioso: counts.ansioso || 0,
      neutro: counts.neutro || 0
    }))
    .sort((a, b) => {
      // Ordenar por período (mais antigo primeiro)
      if (period === 'month') {
        // Extrair mês e ano
        const [monthA, yearA] = a.name.split(' ');
        const [monthB, yearB] = b.name.split(' ');
        
        // Comparar ano primeiro
        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
        
        // Depois comparar mês
        const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        return months.indexOf(monthA.toLowerCase()) - months.indexOf(monthB.toLowerCase());
      } else {
        // Para semanas, extrair número da semana e mês
        const weekA = parseInt(a.name.split(' ')[1]);
        const weekB = parseInt(b.name.split(' ')[1]);
        const monthA = a.name.split(' ')[2];
        const monthB = b.name.split(' ')[2];
        
        // Comparar mês primeiro
        const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        const monthCompare = months.indexOf(monthA.toLowerCase()) - months.indexOf(monthB.toLowerCase());
        
        if (monthCompare !== 0) return monthCompare;
        
        // Depois comparar semana
        return weekA - weekB;
      }
    });
}
