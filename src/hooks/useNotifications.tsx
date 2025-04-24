
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export interface Notification {
  id: string;
  type: string;
  content: string;
  created_at: string;
  read: boolean;
  from_user_id?: string;
  related_id?: string;
  related_type?: string;
  related_law?: string;
  related_article?: string;
  user_id: string;
}

export function useNotifications() {
  const queryClient = useQueryClient(); // This was missing or incorrectly defined
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data as Notification[];
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  
  // Function to navigate to the related content
  const navigateToNotificationContent = async (notification: Notification): Promise<boolean> => {
    try {
      switch (notification.type) {
        case 'comment':
          if (notification.related_id) {
            // Navigate to the comment in the community page
            navigate(`/comunidade?comment=${notification.related_id}`);
            return true;
          }
          break;
        
        case 'like':
          if (notification.related_id && notification.related_type) {
            if (notification.related_type === 'post') {
              // Navigate to the post
              navigate(`/comunidade?post=${notification.related_id}`);
              return true;
            } else if (notification.related_type === 'comment') {
              // Navigate to the comment
              navigate(`/comunidade?comment=${notification.related_id}`);
              return true;
            }
          }
          break;
          
        case 'achievement':
          // Navigate to the user profile
          navigate('/perfil');
          return true;
          
        case 'article':
          if (notification.related_law && notification.related_article) {
            // Navigate to the specific article
            navigate(`/lei/${encodeURIComponent(notification.related_law)}?artigo=${notification.related_article}`);
            return true;
          }
          break;
          
        default:
          // Default case - just mark as read but don't navigate
          return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error navigating to notification content:', error);
      return false;
    }
  };

  return {
    notifications,
    markAsRead,
    navigateToNotificationContent
  };
}
