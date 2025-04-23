
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Heart, MessageSquare, User, Award } from "lucide-react";

interface Notification {
  id: string;
  type: "like" | "comment" | "mention" | "follow" | "bestTip";
  content: string;
  from: {
    id: string;
    name: string;
    avatar?: string;
  };
  postId?: string;
  createdAt: Date;
  read: boolean;
}

// Mock notifications for demonstration
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "like",
    content: "curtiu sua publicação sobre Direito Civil",
    from: {
      id: "user1",
      name: "João Silva",
      avatar: undefined
    },
    postId: "post1",
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    read: false
  },
  {
    id: "2",
    type: "comment",
    content: "comentou em sua publicação sobre Direito Constitucional",
    from: {
      id: "user2",
      name: "Maria Oliveira",
      avatar: undefined
    },
    postId: "post2",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    read: false
  },
  {
    id: "3",
    type: "bestTip",
    content: "marcou seu comentário como Melhor Dica",
    from: {
      id: "user3",
      name: "Carlos Santos",
      avatar: undefined
    },
    postId: "post3",
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    read: true
  }
];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart size={16} className="text-red-400" />;
      case 'comment':
        return <MessageSquare size={16} className="text-blue-400" />;
      case 'mention':
        return <User size={16} className="text-green-400" />;
      case 'follow':
        return <User size={16} className="text-yellow-400" />;
      case 'bestTip':
        return <Award size={16} className="text-purple-400" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative text-gray-400 hover:text-primary-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-medium text-gray-300">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary-300 hover:text-primary-400 p-0 h-auto hover:bg-transparent"
                onClick={markAllAsRead}
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-800 flex items-start gap-3 hover:bg-gray-800/50 cursor-pointer ${
                    !notification.read ? "bg-gray-800/30" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <Avatar className="h-6 w-6">
                        <div className="h-full w-full rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-300">
                            {notification.from.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-300">
                        {notification.from.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.content}
                    </p>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {formatDistanceToNow(notification.createdAt, {
                        locale: ptBR,
                        addSuffix: true
                      })}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary-300 mt-1"></div>
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
