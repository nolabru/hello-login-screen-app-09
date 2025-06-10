import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompanySentimentData {
  name: string; // Período (semana)
  feliz: number;
  triste: number;
  irritado: number;
  ansioso: number;
  neutro: number;
}

export function useCompanySentimentData(period: 'month' | 'week' = 'week') {
  const [sentimentData, setSentimentData] = useState<CompanySentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanySentimentData() {
      try {
        setLoading(true);
        
        // Obter o ID da empresa logada
        const companyId = localStorage.getItem('companyId');
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }
        
        console.log('Buscando dados de sentimentos para a empresa:', companyId);
        
        // 1. Buscar funcionários vinculados à empresa
        const { data: employees, error: employeesError } = await supabase
          .from('user_profiles')
          .select('id, user_id, full_name, preferred_name')
          .eq('company_id', companyId);
        
        if (employeesError) {
          throw new Error(`Erro ao buscar funcionários: ${employeesError.message}`);
        }
        console.log('Funcionários encontrados:', employees);
        
        if (!employees || employees.length === 0) {
          console.log('Nenhum funcionário encontrado para a empresa');
          setSentimentData([]);
          setLoading(false);
          return;
        }
        
        // 2. Extrair IDs dos funcionários e filtrar valores nulos/indefinidos
        const employeeUserIds = employees
          .map((employee: any) => employee.user_id)
          .filter(Boolean); // Remove valores nulos/undefined/vazios
        
        console.log('IDs dos funcionários:', employeeUserIds);
        
        if (employeeUserIds.length === 0) {
          console.log('Nenhum ID de usuário válido encontrado para os funcionários');
          setSentimentData([]);
          setLoading(false);
          return;
        }
        
        // 3. Buscar sessões desses funcionários com mood usando o cliente Supabase
        const { data: sessions, error: sessionsError } = await supabase
          .from('call_sessions')
          .select('id, user_id, mood, started_at')
          .in('user_id', employeeUserIds);
        
        if (sessionsError) {
          throw new Error(`Erro ao buscar sessões: ${sessionsError.message}`);
        }
        console.log('Sessões encontradas:', sessions);
        
        if (!sessions || sessions.length === 0) {
          console.log('Nenhuma sessão encontrada para os funcionários');
          setSentimentData([]);
          setLoading(false);
          return;
        }
        
        // 4. Processar e agregar os dados por período
        const aggregatedData = aggregateByPeriod(sessions, period);
        console.log('Dados agregados:', aggregatedData);
        
        setSentimentData(aggregatedData);
      } catch (error: any) {
        console.error('Erro ao buscar dados de sentimentos da empresa:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompanySentimentData();
  }, [period]);
  
  return { sentimentData, loading, error };
}

// Função auxiliar para agregar dados por período
function aggregateByPeriod(sessions: any[], period: 'month' | 'week'): CompanySentimentData[] {
  // Objeto para armazenar contagens por período
  const periodCounts: Record<string, Record<string, number>> = {};
  
  // Processar cada sessão
  sessions.forEach(session => {
    if (!session.mood) return; // Ignorar sessões sem mood
    
    // Determinar o período (mês ou semana)
    const date = new Date(session.started_at);
    let periodKey;
    
    if (period === 'month') {
      // Formato: "Janeiro 2025"
      const month = date.toLocaleDateString('pt-BR', { month: 'long' });
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      periodKey = `${capitalizedMonth} ${date.getFullYear()}`;
    } else {
      // Formato: "1ª Semana de Janeiro"
      const weekNumber = Math.ceil(date.getDate() / 7);
      const month = date.toLocaleDateString('pt-BR', { month: 'long' });
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      periodKey = `${weekNumber}ª Semana de ${capitalizedMonth}`;
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
        // Formato: "Janeiro 2025"
        const monthsA = a.name.split(' ');
        const monthsB = b.name.split(' ');
        const monthA = monthsA[0];
        const yearA = parseInt(monthsA[1]);
        const monthB = monthsB[0];
        const yearB = parseInt(monthsB[1]);
        
        // Comparar ano primeiro
        if (yearA !== yearB) return yearA - yearB;
        
        // Depois comparar mês
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return months.indexOf(monthA.toLowerCase()) - months.indexOf(monthB.toLowerCase());
      } else {
        // Formato: "1ª Semana de Janeiro"
        // Extrair número da semana
        const weekA = parseInt(a.name.split('ª')[0]);
        const weekB = parseInt(b.name.split('ª')[0]);
        
        // Extrair mês
        const monthA = a.name.split('de ')[1];
        const monthB = b.name.split('de ')[1];
        
        // Comparar mês primeiro
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const monthCompare = months.indexOf(monthA.toLowerCase()) - months.indexOf(monthB.toLowerCase());
        
        if (monthCompare !== 0) return monthCompare;
        
        // Depois comparar semana
        return weekA - weekB;
      }
    });
}
