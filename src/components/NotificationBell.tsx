import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NotificationsPopover from './NotificationsPopover';
import { fetchUnreadNotificationsCount } from '@/services/notificationService';

const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await fetchUnreadNotificationsCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Erro ao buscar contagem de notificações:', error);
      }
    };
    
    loadUnreadCount();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <NotificationsPopover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button 
          className="p-2 rounded-full hover:bg-gray-100 relative"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      }
    />
  );
};

export default NotificationBell;
