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
  
  // Buscar associações pendentes
  const { data, error } = await supabaseAny
    .from('company_psychologists')
    .select('id, company_id, started_at')
    .eq('psychologist_id', psychologistId)
    .eq('status', 'pending')
    .order('started_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar notificações:', error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  // Buscar informações das empresas
  const notifications: Notification[] = [];
  
  for (const connection of data) {
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
  
  return notifications;
};

// Buscar contagem de notificações não lidas
export const fetchUnreadNotificationsCount = async (): Promise<number> => {
  const psychologistId = localStorage.getItem('psychologistId');
  if (!psychologistId) {
    return 0;
  }
  
  const { count, error } = await supabaseAny
    .from('company_psychologists')
    .select('id', { count: 'exact', head: true })
    .eq('psychologist_id', psychologistId)
    .eq('status', 'pending');
    
  if (error) {
    console.error('Erro ao buscar contagem de notificações:', error);
    throw error;
  }
  
  return count || 0;
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
