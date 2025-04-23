
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Heart, MessageSquare, User, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: commentsData, error: commentsError } = await supabase
        .from('community_comments')
        .select(`
          id,
          content,
          created_at,
          post:community_posts!inner(
            id,
            author_id
          ),
          author_id
        `)
        .eq('post.author_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (commentsError) {
        console.error('Error fetching notifications:', commentsError);
        return;
      }

      // Get user profiles for each author
      const authorIds = commentsData.map(comment => comment.author_id);
      const { data: userProfiles, error: userError } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', authorIds);

      if (userError) {
        console.error('Error fetching user profiles:', userError);
        return;
      }

      // Create a map for quick lookup
      const userMap = new Map();
      userProfiles?.forEach(profile => {
        userMap.set(profile.id, profile);
      });

      const notificationsData = commentsData.map(comment => {
        const userProfile = userMap.get(comment.author_id) || { full_name: 'Usuário' };
        
        return {
          id: comment.id,
          type: 'comment' as const,
          content: 'comentou em sua publicação',
          from: {
            id: comment.author_id,
            name: userProfile?.full_name || 'Usuário',
          },
          postId: comment.post?.id,
          createdAt: new Date(comment.created_at),
          read: false
        };
      });

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
    };

    fetchNotifications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('comment-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_comments'
        },
        (payload) => {
          // Add new notification
          toast.info('Novo comentário recebido!');
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
