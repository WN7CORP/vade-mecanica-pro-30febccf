import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Award, Heart } from "lucide-react";
import { Comment } from "./PostCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Animated Emoji Suggestions
const emojiSuggestions = [
  '👍', '❤️', '🔥', '😂', '😮', '👏', '🤔', '🙌'
];

interface CommentListProps {
  comments: Comment[];
  postId: string;
  onSetBestTip?: (postId: string, commentId: string) => void;
}

const CommentList = ({ comments, postId, onSetBestTip }: CommentListProps) => {
  if (comments.length === 0) {
    return <p className="text-sm text-gray-400">Nenhum comentário ainda. Seja o primeiro a comentar!</p>;
  }

  const renderComments = (comments: Comment[], depth: number = 0) => {
    return comments.map((comment) => (
      <CommentItem 
        key={comment.id} 
        comment={comment} 
        depth={depth} 
        postId={postId} 
        onSetBestTip={onSetBestTip} 
      />
    ));
  };

  return <div className="space-y-4">{renderComments(comments)}</div>;
};

const CommentItem = ({ 
  comment, 
  depth, 
  postId, 
  onSetBestTip 
}: { 
  comment: Comment; 
  depth: number; 
  postId: string; 
  onSetBestTip?: (postId: string, commentId: string) => void; 
}) => {
  const queryClient = useQueryClient();
  const [showEmojiSuggestions, setShowEmojiSuggestions] = useState(false);

  // Mutation for liking a comment
  const likeCommentMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getSession();
      if (!user) {
        toast.error("Você precisa estar logado para curtir um comentário");
        return;
      }

      const { error } = await supabase
        .from('community_comments')
        .update({ likes: comment.likes + 1 })
        .eq('id', comment.id);

      if (error) {
        toast.error("Erro ao curtir comentário", { description: error.message });
        throw error;
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
    },
    onSuccess: () => {
      toast.success("Comentário curtido!");
    }
  });

  const handleEmojiSelect = (emoji: string) => {
    // Add emoji to comment input or trigger a function to handle emoji
    setShowEmojiSuggestions(false);
    // TODO: Implement emoji insertion in comment input
  };

    // Fetch user profile data including avatar
    const { data: userData } = useQuery({
      queryKey: ['user', comment.author_id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('full_name, default_avatar_id, avatar_url')
          .eq('id', comment.author_id)
          .single();
  
        if (error) {
          console.error('Error fetching comment author:', error);
          return { full_name: 'Usuário', avatar_url: null, default_avatar_id: null };
        }
  
        // If user has default avatar, fetch it
        if (data.default_avatar_id && !data.avatar_url) {
          const { data: avatarData } = await supabase
            .from('default_avatars')
            .select('url')
            .eq('id', data.default_avatar_id)
            .single();
  
          if (avatarData) {
            return { ...data, avatar_url: avatarData.url };
          }
        }
  
        return data;
      }
    });
  
    const userName = userData?.full_name || 'Usuário';
    const userInitial = userName.charAt(0).toUpperCase();
    const avatarUrl = userData?.avatar_url;

  return (
    <div className={`flex gap-3 ${comment.is_best_tip ? 'bg-primary-900/20 p-3 rounded border-l-2 border-primary-300' : ''} ${depth > 0 ? `ml-${Math.min(depth * 4, 12)} border-l-2 border-gray-800 pl-3 mt-2` : ''}`}>
      <Avatar>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={userName} />
        ) : (
          <AvatarFallback className="bg-gray-700 text-gray-300">
            {userInitial}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-300">{userName}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.created_at), { locale: ptBR, addSuffix: true })}
          </span>
          
          {comment.is_best_tip && (
            <div className="flex items-center gap-1 bg-primary-900/30 text-primary-300 text-xs px-2 py-0.5 rounded-full">
              <Award size={12} />
              <span>Melhor Dica</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
        
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-primary-300 hover:bg-transparent px-2 py-1 h-auto min-h-0"
            onClick={() => likeCommentMutation.mutate()}
          >
            <Heart size={14} className="mr-1" />
            <span className="text-xs">{comment.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-primary-300 hover:bg-transparent px-2 py-1 h-auto min-h-0"
            onClick={() => setShowEmojiSuggestions(!showEmojiSuggestions)}
          >
            😊
          </Button>

          {showEmojiSuggestions && (
            <div className="flex gap-1 animate-in slide-in-from-top-2">
              {emojiSuggestions.map(emoji => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="icon"
                  className="text-2xl hover:scale-125 transition-transform"
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}
          
          {onSetBestTip && !comment.is_best_tip && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-primary-300 hover:bg-transparent px-2 py-1 h-auto min-h-0"
              onClick={() => onSetBestTip(postId, comment.id)}
            >
              <Award size={14} className="mr-1" />
              <span className="text-xs">Marcar como Melhor Dica</span>
            </Button>
          )}
        </div>
        
        {/* We need to modify this once we have proper reply structure */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                depth={depth + 1} 
                postId={postId} 
                onSetBestTip={onSetBestTip} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentList;
