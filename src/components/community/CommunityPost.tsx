
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CommunityPostProps {
  post: {
    id: string;
    content: string;
    likes: number;
    author_id: string;
  };
  currentUserId?: string;
}

export const CommunityPost = ({ post, currentUserId }: CommunityPostProps) => {
  const [likes, setLikes] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Você precisa estar logado para curtir");
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .update({ likes: likes + 1 })
        .eq('id', post.id)
        .select();

      if (error) throw error;

      setLikes(prev => prev + 1);
      toast.success("Post curtido!");
    } catch (error) {
      console.error("Erro ao curtir:", error);
      toast.error("Erro ao curtir o post");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className="p-4 mb-4 bg-gradient-to-b from-gray-900/50 to-gray-800/30 border border-gray-800/50 hover:border-primary-300/20 transition-all duration-300 backdrop-blur-sm">
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-200">{post.content}</p>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-300/10 hover:bg-primary-300/20 transition-all group"
          >
            <ThumbsUp 
              size={16} 
              className={`transition-all ${isLiking ? 'animate-pulse' : 'group-hover:scale-110'}`} 
            />
            <span className="text-sm font-medium">{likes}</span>
          </button>
        </div>
      </div>
    </Card>
  );
};
