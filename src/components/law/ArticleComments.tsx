
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  tag: string;
  created_at: string;
  user_id: string;
  likes: number;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface ArticleCommentsProps {
  lawName: string;
  articleNumber?: string;
}

const ArticleComments = ({ lawName, articleNumber }: ArticleCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [lawName, articleNumber, selectedTag]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('law_article_comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (articleNumber) {
        query = query.eq('article_number', articleNumber);
      }
      if (lawName) {
        query = query.eq('law_name', lawName);
      }
      if (selectedTag) {
        query = query.eq('tag', selectedTag);
      }

      const { data, error } = await query;
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tagColors = {
    duvida: "bg-yellow-500/20 text-yellow-300",
    atento: "bg-red-500/20 text-red-300",
    importante: "bg-blue-500/20 text-blue-300",
    geral: "bg-gray-500/20 text-gray-300"
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {['geral', 'duvida', 'atento', 'importante'].map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className={`cursor-pointer capitalize ${selectedTag === tag ? tagColors[tag] : ''}`}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="neomorph p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <img src={comment.profiles?.avatar_url || "/placeholder.svg"} alt="Avatar" />
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-primary-200">
                      {comment.profiles?.full_name || "Usuário"}
                    </span>
                    <Badge className={`${tagColors[comment.tag]} text-xs`}>
                      {comment.tag}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDistance(new Date(comment.created_at), new Date(), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-primary-100">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-8">
          Nenhum comentário encontrado.
        </p>
      )}
    </div>
  );
};

export default ArticleComments;
