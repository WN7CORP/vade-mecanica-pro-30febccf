
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Award, Heart } from "lucide-react";
import { Comment } from "./PostCard";
import { supabase } from "@/integrations/supabase/client";

interface CommentListProps {
  comments: Comment[];
  postId: string;
  onSetBestTip?: (postId: string, commentId: string) => void;
}

const CommentList = ({ comments, postId, onSetBestTip }: CommentListProps) => {
  if (comments.length === 0) {
    return <p className="text-sm text-gray-400">Nenhum comentário ainda. Seja o primeiro a comentar!</p>;
  }

  // Function to fetch author name
  const getAuthorName = (authorId: string) => {
    // In a real implementation, you would fetch from profiles table
    // For now, return a placeholder
    return "Usuário";
  };

  // Function to render comments and their replies recursively
  const renderComments = (comments: Comment[], depth: number = 0) => {
    return comments.map((comment) => (
      <div key={comment.id} className={`flex gap-3 ${comment.is_best_tip ? 'bg-primary-900/20 p-3 rounded border-l-2 border-primary-300' : ''} ${depth > 0 ? `ml-${Math.min(depth * 4, 12)} border-l-2 border-gray-800 pl-3 mt-2` : ''}`}>
        <Avatar>
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-300">
              {getAuthorName(comment.author_id).charAt(0).toUpperCase()}
            </span>
          </div>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-300">{getAuthorName(comment.author_id)}</span>
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
            >
              <Heart size={14} className="mr-1" />
              <span className="text-xs">{comment.likes}</span>
            </Button>
            
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
              {renderComments(comment.replies, depth + 1)}
            </div>
          )}
        </div>
      </div>
    ));
  };

  return <div className="space-y-4">{renderComments(comments)}</div>;
};

export default CommentList;
