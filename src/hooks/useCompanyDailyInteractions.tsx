import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserInteraction {
  user_id: string;
  full_name: string | null;
  preferred_name: string | null;
  interactionCount: number;
  moods: Record<string, number>;
  predominantMood: string;
}

export function useCompanyDailyInteractions(selectedDate: Date | undefined) {
  const [interactionData, setInteractionData] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysWithInteractions, setDaysWithInteractions] = useState<number[]>([]);

  // Função para obter o início e o fim do dia selecionado
  const getDayBounds = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString()
    };
  };

  // Efeito para buscar os dias do mês atual que têm interações
  useEffect(() => {
    async function fetchDaysWithInteractions() {
      try {
        // Obter o ID da empresa logada
        const companyId = localStorage.getItem('companyId');
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        // Determinar o início e o fim do mês atual
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // 1. Buscar funcionários vinculados à empresa
        const { data: employees, error: employeesError } = await supabase
          .from('user_profiles')
          .select('id, user_id')
          .eq('company_id', companyId);
        
        if (employeesError) {
          throw new Error(`Erro ao buscar funcionários: ${employeesError.message}`);
        }
        
        if (!employees || employees.length === 0) {
          setDaysWithInteractions([]);
          return;
        }
        
        // 2. Extrair IDs dos funcionários
        const employeeUserIds = employees
          .map((employee: any) => employee.user_id)
          .filter(Boolean);
        
        if (employeeUserIds.length === 0) {
          setDaysWithInteractions([]);
          return;
        }
        
        // 3. Buscar sessões desses funcionários no mês atual
        const { data: sessions, error: sessionsError } = await supabase
          .from('call_sessions')
          .select('started_at')
          .in('user_id', employeeUserIds)
          .gte('started_at', startOfMonth.toISOString())
          .lte('started_at', endOfMonth.toISOString());
        
        if (sessionsError) {
          throw new Error(`Erro ao buscar sessões: ${sessionsError.message}`);
        }
        
        if (!sessions || sessions.length === 0) {
          setDaysWithInteractions([]);
          return;
        }
        
        // 4. Extrair os dias que têm interações
        const daysSet = new Set<number>();
        sessions.forEach(session => {
          const date = new Date(session.started_at);
          daysSet.add(date.getDate());
        });
        
        setDaysWithInteractions(Array.from(daysSet));
      } catch (error: any) {
        console.error('Erro ao buscar dias com interações:', error);
      }
    }
    
    fetchDaysWithInteractions();
  }, []);

  // Efeito para buscar as interações do dia selecionado
  useEffect(() => {
    async function fetchDailyInteractions() {
      if (!selectedDate) {
        setInteractionData([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Obter o ID da empresa logada
        const companyId = localStorage.getItem('companyId');
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }
        
        // Determinar o início e o fim do dia selecionado
        const { start, end } = getDayBounds(selectedDate);
        
        // 1. Buscar funcionários vinculados à empresa
        const { data: employees, error: employeesError } = await supabase
          .from('user_profiles')
          .select('id, user_id, full_name, preferred_name')
          .eq('company_id', companyId);
        
        if (employeesError) {
          throw new Error(`Erro ao buscar funcionários: ${employeesError.message}`);
        }
        
        if (!employees || employees.length === 0) {
          setInteractionData([]);
          setLoading(false);
          return;
        }
        
        // 2. Extrair IDs dos funcionários e criar um mapa para busca rápida
        const employeeUserIds = employees
          .map((employee: any) => employee.user_id)
          .filter(Boolean);
        
        const employeeMap = new Map();
        employees.forEach((employee: any) => {
          if (employee.user_id) {
            employeeMap.set(employee.user_id, {
              full_name: employee.full_name,
              preferred_name: employee.preferred_name
            });
          }
        });
        
        if (employeeUserIds.length === 0) {
          setInteractionData([]);
          setLoading(false);
          return;
        }
        
        // 3. Buscar sessões desses funcionários no dia selecionado
        const { data: sessions, error: sessionsError } = await supabase
          .from('call_sessions')
          .select('id, user_id, mood, started_at')
          .in('user_id', employeeUserIds)
          .gte('started_at', start)
          .lte('started_at', end);
        
        if (sessionsError) {
          throw new Error(`Erro ao buscar sessões: ${sessionsError.message}`);
        }
        
        if (!sessions || sessions.length === 0) {
          setInteractionData([]);
          setLoading(false);
          return;
        }
        
        // 4. Agrupar as sessões por usuário
        const userInteractions: Record<string, {
          user_id: string;
          full_name: string | null;
          preferred_name: string | null;
          interactionCount: number;
          moods: Record<string, number>;
        }> = {};
        
        sessions.forEach(session => {
          const { user_id, mood } = session;
          
          if (!user_id) return;
          
          // Inicializar o objeto de interações do usuário se não existir
          if (!userInteractions[user_id]) {
            const employee = employeeMap.get(user_id);
            userInteractions[user_id] = {
              user_id,
              full_name: employee?.full_name || null,
              preferred_name: employee?.preferred_name || null,
              interactionCount: 0,
              moods: {
                feliz: 0,
                triste: 0,
                irritado: 0,
                ansioso: 0,
                neutro: 0
              }
            };
          }
          
          // Incrementar a contagem de interações
          userInteractions[user_id].interactionCount++;
          
          // Incrementar a contagem do mood correspondente
          if (mood) {
            const normalizedMood = mood.toLowerCase();
            if (userInteractions[user_id].moods[normalizedMood] !== undefined) {
              userInteractions[user_id].moods[normalizedMood]++;
            } else {
              // Se for um mood não reconhecido, considerar como neutro
              userInteractions[user_id].moods.neutro++;
            }
          } else {
            // Se não tiver mood, considerar como neutro
            userInteractions[user_id].moods.neutro++;
          }
        });
        
        // 5. Converter para o formato esperado e calcular o sentimento predominante
        const result = Object.values(userInteractions).map(user => {
          // Encontrar o mood predominante (o que tem maior contagem)
          let predominantMood = 'neutro';
          let maxCount = 0;
          
          Object.entries(user.moods).forEach(([mood, count]) => {
            if (count > maxCount) {
              maxCount = count;
              predominantMood = mood;
            }
          });
          
          return {
            ...user,
            predominantMood
          };
        });
        
        // Ordenar por número de interações (decrescente)
        result.sort((a, b) => b.interactionCount - a.interactionCount);
        
        setInteractionData(result);
      } catch (error: any) {
        console.error('Erro ao buscar interações diárias:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDailyInteractions();
  }, [selectedDate]);
  
  return { interactionData, loading, error, daysWithInteractions };
}
