import { supabase } from '@/integrations/supabase/client';

// Usando any para o tipo do Supabase para contornar erros de tipo
const supabaseAny: any = supabase;

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

// Buscar notificações do usuário (convites pendentes)
export const fetchNotifications = async (): Promise<Notification[]> => {
  const psychologistId = localStorage.getItem('psychologistId');
  if (!psychologistId) {
    return [];
  }
  
  const notifications: Notification[] = [];
  
  // Buscar associações pendentes de empresas
  const { data: companyConnections, error: companyError } = await supabaseAny
    .from('company_psychologists')
    .select('id, company_id, started_at')
    .eq('psychologist_id', psychologistId)
    .eq('status', 'pending')
    .order('started_at', { ascending: false });
    
  if (companyError) {
    console.error('Erro ao buscar notificações de empresas:', companyError);
  } else if (companyConnections && companyConnections.length > 0) {
    // Buscar informações das empresas
    for (const connection of companyConnections) {
      try {
        const { data: company } = await supabaseAny
          .from('companies')
          .select('name')
          .eq('id', connection.company_id)
          .single();
          
        if (company) {
          notifications.push({
            id: connection.id,
            type: 'connection_request',
            title: 'Convite de Empresa',
            message: `A empresa ${company.name} convidou você para se conectar.`,
            data: { 
              company_id: connection.company_id, 
              connection_id: connection.id 
            },
            read: false,
            created_at: connection.started_at
          });
        }
      } catch (err) {
        console.error('Erro ao buscar informações da empresa:', err);
      }
    }
  }
  
  // Buscar solicitações pendentes de pacientes (apenas as iniciadas pelo paciente)
  const { data: patientConnections, error: patientError } = await supabaseAny
    .from('psychologists_patients')
    .select('id, patient_id, started_at, patient_email')
    .eq('psychologist_id', psychologistId)
    .eq('status', 'pending')
    .is('patient_email', null)  // Apenas conexões onde patient_email é nulo (iniciadas pelo paciente)
    .order('started_at', { ascending: false });
    
  console.log('Conexões de pacientes encontradas:', patientConnections);
  console.log('Erro ao buscar conexões de pacientes:', patientError);
    
  if (patientError) {
    console.error('Erro ao buscar notificações de pacientes:', patientError);
  } else if (patientConnections && patientConnections.length > 0) {
    // Usar uma abordagem mais robusta para buscar dados dos pacientes
    try {
      // Extrair todos os IDs de pacientes
      const patientIds = patientConnections.map(conn => conn.patient_id);
      console.log('IDs de pacientes para buscar:', patientIds);
      
      // Buscar todos os pacientes de uma vez com os campos corretos
      const { data: patientsData, error: patientsError } = await supabaseAny
        .from('user_profiles')
        .select('user_id, preferred_name, full_name')
        .in('user_id', patientIds);
      
      console.log('Dados de pacientes retornados:', patientsData);
      console.log('Erro ao buscar dados dos pacientes:', patientsError);
      
      if (patientsError) {
        console.error('Erro ao buscar dados dos pacientes:', patientsError);
        
        // Mesmo com erro, criar notificações com nome genérico
        for (const connection of patientConnections) {
          notifications.push({
            id: connection.id,
            type: 'patient_request',
            title: 'Solicitação de Paciente',
            message: `Um paciente solicitou conexão com você.`,
            data: { 
              patient_id: connection.patient_id, 
              connection_id: connection.id 
            },
            read: false,
            created_at: connection.started_at
          });
        }
      } else {
        // Criar um mapa para facilitar o acesso aos nomes dos pacientes
        const patientMap = new Map();
        patientsData?.forEach(p => {
          // Usar full_name se disponível, caso contrário preferred_name
          const name = p.full_name || p.preferred_name;
          patientMap.set(p.user_id, name);
        });
        
        // Criar notificações usando o mapa
        for (const connection of patientConnections) {
          const patientName = patientMap.get(connection.patient_id) || "Paciente";
          notifications.push({
            id: connection.id,
            type: 'patient_request',
            title: 'Solicitação de Paciente',
            message: `O paciente ${patientName} solicitou conexão com você.`,
            data: { 
              patient_id: connection.patient_id, 
              connection_id: connection.id 
            },
            read: false,
            created_at: connection.started_at
          });
        }
      }
    } catch (err) {
      console.error('Erro ao processar notificações de pacientes:', err);
      
      // Em caso de erro, criar notificações com nome genérico
      for (const connection of patientConnections) {
        notifications.push({
          id: connection.id,
          type: 'patient_request',
          title: 'Solicitação de Paciente',
          message: `Um paciente solicitou conexão com você.`,
          data: { 
            patient_id: connection.patient_id, 
            connection_id: connection.id 
          },
          read: false,
          created_at: connection.started_at
        });
      }
    }
  }
  
  // Ordenar notificações por data (mais recentes primeiro)
  return notifications.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

// Buscar contagem de notificações não lidas
export const fetchUnreadNotificationsCount = async (): Promise<number> => {
  const psychologistId = localStorage.getItem('psychologistId');
  if (!psychologistId) {
    return 0;
  }
  
  // Contar convites pendentes de empresas
  const { count: companyCount, error: companyError } = await supabaseAny
    .from('company_psychologists')
    .select('id', { count: 'exact', head: true })
    .eq('psychologist_id', psychologistId)
    .eq('status', 'pending');
    
  // Contar solicitações pendentes de pacientes (apenas as iniciadas pelo paciente)
  const { count: patientCount, error: patientError } = await supabaseAny
    .from('psychologists_patients')
    .select('id', { count: 'exact', head: true })
    .eq('psychologist_id', psychologistId)
    .eq('status', 'pending')
    .is('patient_email', null);  // Apenas conexões onde patient_email é nulo (iniciadas pelo paciente)
    
  if (companyError) {
    console.error('Erro ao buscar contagem de notificações de empresas:', companyError);
  }
  
  if (patientError) {
    console.error('Erro ao buscar contagem de notificações de pacientes:', patientError);
  }
  
  return (companyCount || 0) + (patientCount || 0);
};

// Marcar notificação como lida (aceitar ou rejeitar o convite)
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  // Esta função não é mais necessária, pois aceitar ou rejeitar o convite
  // já muda o status da associação para 'active' ou 'rejected'
  console.log('markNotificationAsRead não é mais necessária');
};

// Criar uma nova notificação (não é mais necessário)
export const createNotification = async (
  recipientId: string,
  recipientType: string,
  senderId: string,
  senderType: string,
  type: string,
  title: string,
  message: string,
  data: any = {}
): Promise<string> => {
  // Esta função não é mais necessária, pois as notificações são baseadas
  // nas associações pendentes na tabela company_psychologists
  console.log('createNotification não é mais necessária');
  return 'dummy-id';
};
