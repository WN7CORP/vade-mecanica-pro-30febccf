import React, { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Award, Bookmark, Heart, MessageSquare } from "lucide-react";
import CommentList from "./CommentList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  likes: number;
  tags: string[];
  is_favorite?: boolean;
  best_tip_id?: string;
}

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_comment_id?: string;
  created_at: string;
  likes: number;
  is_best_tip?: boolean;
  replies?: Comment[];
}

const PostCard = ({ post }: { post: Post }) => {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ['post-comments', post.id],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Você precisa estar logado para ver os comentários");
        return [];
      }

      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) {
        toast.error("Erro ao carregar comentários", { description: error.message });
        return [];
      }

      const threadedComments = [];
      const commentMap = new Map();
      
      data.forEach(comment => {
        commentMap.set(comment.id, {...comment, replies: []});
      });
      
      data.forEach(comment => {
        const commentWithReplies = commentMap.get(comment.id);
        
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies.push(commentWithReplies);
          } else {
            threadedComments.push(commentWithReplies);
          }
        } else {
          threadedComments.push(commentWithReplies);
        }
      });
      
      return threadedComments as Comment[];
    },
    enabled: showComments
  });

  const createCommentMutation = useMutation({
    mutationFn: async (commentContent: string) => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast.error("Você precisa estar logado para adicionar um comentário");
        throw new Error("User not authenticated");
      }

      if (commentContent.trim().length < 5) {
        toast.error("O comentário é muito curto");
        throw new Error("Comment too short");
      }
      
      const userId = sessionData.session.user.id;

      const { data, error } = await supabase.from('community_comments').insert({
        content: commentContent,
        post_id: post.id,
        author_id: userId,
        likes: 0,
        is_best_tip: false
      }).select();

      if (error) {
        toast.error("Erro ao adicionar comentário", { description: error.message });
        throw error;
      }

      toast.success("Comentário adicionado com sucesso!");
      setNewComment("");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', post.id] });
    }
  });

  const handleSetBestTip = async (postId: string, commentId: string) => {
    const { error: updateCommentError } = await supabase
      .from('community_comments')
      .update({ is_best_tip: true })
      .eq('id', commentId);

    if (updateCommentError) {
      toast.error("Erro ao marcar melhor dica", { description: updateCommentError.message });
      return;
    }

    const { error: updatePostError } = await supabase
      .from('community_posts')
      .update({ best_tip_id: commentId })
      .eq('id', postId);

    if (updatePostError) {
      toast.error("Erro ao atualizar post", { description: updatePostError.message });
      return;
    }

    toast.success("Dica marcada como melhor resposta!");
    queryClient.invalidateQueries({ queryKey: ['post-comments', post.id] });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim().length < 5) {
      toast.error("O comentário é muito curto");
      return;
    }
    createCommentMutation.mutate(newComment);
  };

  return (
    <Card className="mb-4 overflow-hidden border border-gray-800 bg-gray-900/50">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-lg font-medium text-gray-300">
                {post.author_id ? post.author_id.substring(0, 1).toUpperCase() : 'U'}
              </span>
            </div>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-200">
              Nome do Autor
            </h3>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.created_at), { locale: ptBR, addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-primary-900/30 text-primary-300 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-primary-300 hover:bg-gray-800"
          >
            <Heart size={16} className="mr-1" />
            <span>{post.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-primary-300 hover:bg-gray-800"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare size={16} className="mr-1" />
            <span>{comments?.length || 0}</span>
          </Button>
          
          {post.is_favorite !== undefined && (
            <Button
              variant="ghost"
              size="sm"
              className={`${
                post.is_favorite ? "text-primary-300" : "text-gray-400 hover:text-primary-300"
              } hover:bg-gray-800 ml-auto`}
            >
              <Bookmark size={16} className={post.is_favorite ? "fill-current" : ""} />
            </Button>
          )}
        </div>
      </div>

      {showComments && (
        <div className="border-t border-gray-800 p-4">
          <CommentList 
            comments={comments || []} 
            postId={post.id}
            onSetBestTip={handleSetBestTip}
          />
          
          <form onSubmit={handleSubmitComment} className="mt-4">
            <div className="flex gap-3">
              <Avatar>
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-300">U</span>
                </div>
              </Avatar>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1 bg-gray-800/50 rounded-full px-4 py-2 text-sm text-gray-300 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-300"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="bg-primary-300 hover:bg-primary-400 text-gray-900"
              >
                Enviar
              </Button>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
