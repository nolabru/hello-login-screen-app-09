import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PatientInteraction {
  user_id: string;
  full_name: string | null;
  preferred_name: string | null;
  interactionCount: number;
  moods: {
    feliz: number;
    triste: number;
    irritado: number;
    ansioso: number;
    neutro: number;
  };
  predominantMood: string;
}

export function usePsychologistDailyInteractions(selectedDate: Date | undefined) {
  const [interactionData, setInteractionData] = useState<PatientInteraction[]>([]);
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
        // Obter o ID do psicólogo logado
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) {
          throw new Error('ID do psicólogo não encontrado');
        }

        // Determinar o início e o fim do mês atual
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // 1. Buscar pacientes vinculados ao psicólogo
        // Nota: Esta é uma consulta fictícia, pois não temos a tabela exata.
        // Você precisará adaptar isso à estrutura real do seu banco de dados.
        const { data: patients, error: patientsError } = await supabase
          .from('user_profiles')
          .select('id, user_id, full_name, preferred_name')
          .eq('psychologist_id', psychologistId);
        
        if (patientsError) {
          throw new Error(`Erro ao buscar pacientes: ${patientsError.message}`);
        }
        
        if (!patients || patients.length === 0) {
          setDaysWithInteractions([]);
          return;
        }
        
        // 2. Extrair IDs dos pacientes
        const patientUserIds = patients
          .map((patient: any) => patient.user_id)
          .filter(Boolean);
        
        if (patientUserIds.length === 0) {
          setDaysWithInteractions([]);
          return;
        }
        
        // 3. Buscar sessões desses pacientes no mês atual
        const { data: sessions, error: sessionsError } = await supabase
          .from('call_sessions')
          .select('started_at')
          .in('user_id', patientUserIds)
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
        
        // Obter o ID do psicólogo logado
        const psychologistId = localStorage.getItem('psychologistId');
        if (!psychologistId) {
          throw new Error('ID do psicólogo não encontrado');
        }
        
        // Determinar o início e o fim do dia selecionado
        const { start, end } = getDayBounds(selectedDate);
        
        // 1. Buscar pacientes vinculados ao psicólogo
        // Nota: Esta é uma consulta fictícia, pois não temos a tabela exata.
        // Você precisará adaptar isso à estrutura real do seu banco de dados.
        const { data: patients, error: patientsError } = await supabase
          .from('user_profiles')
          .select('id, user_id, full_name, preferred_name')
          .eq('psychologist_id', psychologistId);
        
        if (patientsError) {
          throw new Error(`Erro ao buscar pacientes: ${patientsError.message}`);
        }
        
        if (!patients || patients.length === 0) {
          setInteractionData([]);
          setLoading(false);
          return;
        }
        
        // 2. Extrair IDs dos pacientes e criar um mapa para busca rápida
        const patientUserIds = patients
          .map((patient: any) => patient.user_id)
          .filter(Boolean);
        
        const patientMap = new Map();
        patients.forEach((patient: any) => {
          if (patient.user_id) {
            patientMap.set(patient.user_id, {
              full_name: patient.full_name,
              preferred_name: patient.preferred_name
            });
          }
        });
        
        if (patientUserIds.length === 0) {
          setInteractionData([]);
          setLoading(false);
          return;
        }
        
        // 3. Buscar sessões desses pacientes no dia selecionado
        const { data: sessions, error: sessionsError } = await supabase
          .from('call_sessions')
          .select('id, user_id, mood, started_at')
          .in('user_id', patientUserIds)
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
        
        // 4. Agrupar as sessões por paciente
        const patientInteractions: Record<string, PatientInteraction> = {};
        
        sessions.forEach(session => {
          const { user_id, mood } = session;
          
          if (!user_id) return;
          
          // Inicializar o objeto de interações do paciente se não existir
          if (!patientInteractions[user_id]) {
            const patient = patientMap.get(user_id);
            patientInteractions[user_id] = {
              user_id,
              full_name: patient?.full_name || null,
              preferred_name: patient?.preferred_name || null,
              interactionCount: 0,
              moods: {
                feliz: 0,
                triste: 0,
                irritado: 0,
                ansioso: 0,
                neutro: 0
              },
              predominantMood: 'neutro'
            };
          }
          
          // Incrementar a contagem de interações
          patientInteractions[user_id].interactionCount++;
          
          // Incrementar a contagem do mood correspondente
          if (mood) {
            const normalizedMood = mood.toLowerCase();
            if (normalizedMood === 'feliz' || 
                normalizedMood === 'triste' || 
                normalizedMood === 'irritado' || 
                normalizedMood === 'ansioso' || 
                normalizedMood === 'neutro') {
              patientInteractions[user_id].moods[normalizedMood]++;
            } else {
              // Se for um mood não reconhecido, considerar como neutro
              patientInteractions[user_id].moods.neutro++;
            }
          } else {
            // Se não tiver mood, considerar como neutro
            patientInteractions[user_id].moods.neutro++;
          }
        });
        
        // 5. Calcular o sentimento predominante para cada paciente
        Object.values(patientInteractions).forEach(patient => {
          let predominantMood = 'neutro';
          let maxCount = 0;
          
          Object.entries(patient.moods).forEach(([mood, count]) => {
            if (count > maxCount) {
              maxCount = count;
              predominantMood = mood;
            }
          });
          
          patient.predominantMood = predominantMood;
        });
        
        // 6. Converter para array e ordenar por número de interações (decrescente)
        const result = Object.values(patientInteractions).sort((a, b) => 
          b.interactionCount - a.interactionCount
        );
        
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
