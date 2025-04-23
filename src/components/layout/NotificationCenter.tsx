
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Award } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notificationId: string) => {
    markAsRead.mutate(notificationId);
    // You can add navigation logic here based on notification type
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-md shadow-lg z-50">
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

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-border flex items-start gap-3 hover:bg-accent/50 cursor-pointer ${
                    !notification.read ? "bg-accent/30" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="mt-1">
                    {notification.type === 'achievement' ? (
                      <Award className="h-5 w-5 text-primary" />
                    ) : (
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    )}
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
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 ml-auto"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
