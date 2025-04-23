
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Award, MessageSquare, Heart } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, navigateToNotificationContent } = useNotifications();
  const [bellAnimation, setBellAnimation] = useState(false);
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Animate the bell when new notifications arrive
  useEffect(() => {
    if (unreadCount > 0) {
      setBellAnimation(true);
      const timeout = setTimeout(() => setBellAnimation(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [unreadCount]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read first
      if (!notification.read) {
        await markAsRead.mutate(notification.id);
      }
      
      // Close the notification panel
      setIsOpen(false);
      
      // Navigate to the related content if available
      const success = await navigateToNotificationContent(notification);
      
      if (!success) {
        toast({
          description: "Não foi possível encontrar o conteúdo relacionado.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-5 w-5 text-primary-300" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-400" />;
      case 'like':
        return <Heart className="h-5 w-5 text-rose-400" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className={`h-5 w-5 ${bellAnimation ? 'animate-bounce' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-md shadow-lg z-50 animate-fade-in">
          <div className="p-3 border-b border-border flex justify-between items-center">
            <h3 className="font-medium">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary hover:text-primary-hover p-0 h-auto hover:bg-transparent"
                onClick={() => notifications.forEach(n => !n.read && markAsRead.mutate(n.id))}
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-border flex items-start gap-3 hover:bg-accent/50 cursor-pointer transition-colors duration-150 ${
                    !notification.read ? "bg-accent/30" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      {notification.content}
                    </p>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        locale: ptBR,
                        addSuffix: true
                      })}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 ml-auto pulse-animation"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
