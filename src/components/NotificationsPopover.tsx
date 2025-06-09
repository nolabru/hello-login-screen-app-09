import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Notification, fetchNotifications, markNotificationAsRead } from '@/services/notificationService';
import { Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { acceptCompanyRequest, rejectCompanyRequest } from '@/integrations/supabase/companyPsychologistsService';
import { acceptPatientRequest, rejectPatientRequest } from '@/integrations/supabase/psychologistPatientsService';

interface NotificationsPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
}

const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ 
  open, 
  onOpenChange,
  trigger 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);
  
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcceptRequest = async (notification: Notification) => {
    try {
      const { company_id, connection_id } = notification.data;
      const psychologistId = localStorage.getItem('psychologistId');
      
      if (!psychologistId) {
        throw new Error('ID do psicólogo não encontrado');
      }
      
      await acceptCompanyRequest(company_id, psychologistId, connection_id);
      await markNotificationAsRead(notification.id);
      
      toast({
        title: 'Convite Aceito',
        description: 'Você aceitou o convite da empresa.',
      });
      
      loadNotifications();
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aceitar o convite. Tente novamente.',
        variant: 'destructive'
      });
    }
  };
  
  const handleRejectRequest = async (notification: Notification) => {
    try {
      const { company_id, connection_id } = notification.data;
      const psychologistId = localStorage.getItem('psychologistId');
      
      if (!psychologistId) {
        throw new Error('ID do psicólogo não encontrado');
      }
      
      await rejectCompanyRequest(company_id, psychologistId, connection_id);
      await markNotificationAsRead(notification.id);
      
      toast({
        title: 'Convite rejeitado',
        description: 'Você rejeitou o convite da empresa.',
      });
      
      loadNotifications();
    } catch (error) {
      console.error('Erro ao rejeitar convite:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o convite. Tente novamente.',
        variant: 'destructive'
      });
    }
  };
  
  const handleAcceptPatientRequest = async (notification: Notification) => {
    try {
      const { patient_id, connection_id } = notification.data;
      const psychologistId = localStorage.getItem('psychologistId');
      
      if (!psychologistId) {
        throw new Error('ID do psicólogo não encontrado');
      }
      
      await acceptPatientRequest(patient_id, psychologistId, connection_id);
      await markNotificationAsRead(notification.id);
      
      toast({
        title: 'Solicitação aceita',
        description: 'Você aceitou a solicitação do paciente.',
      });
      
      loadNotifications();
    } catch (error) {
      console.error('Erro ao aceitar solicitação de paciente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aceitar a solicitação. Tente novamente.',
        variant: 'destructive'
      });
    }
  };
  
  const handleRejectPatientRequest = async (notification: Notification) => {
    try {
      const { patient_id, connection_id } = notification.data;
      const psychologistId = localStorage.getItem('psychologistId');
      
      if (!psychologistId) {
        throw new Error('ID do psicólogo não encontrado');
      }
      
      await rejectPatientRequest(patient_id, psychologistId, connection_id);
      await markNotificationAsRead(notification.id);
      
      toast({
        title: 'Solicitação rejeitada',
        description: 'Você rejeitou a solicitação do paciente.',
      });
      
      loadNotifications();
    } catch (error) {
      console.error('Erro ao rejeitar solicitação de paciente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar a solicitação. Tente novamente.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-medium">Notificações</h3>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">Carregando Notificações...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">Nenhuma Notificação</p>
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  
                  {notification.type === 'connection_request' && !notification.read && (
                    <div className="flex space-x-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                        onClick={() => handleAcceptRequest(notification)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aceitar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        onClick={() => handleRejectRequest(notification)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                  
                  {notification.type === 'patient_request' && !notification.read && (
                    <div className="flex space-x-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                        onClick={() => handleAcceptPatientRequest(notification)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aceitar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        onClick={() => handleRejectPatientRequest(notification)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
