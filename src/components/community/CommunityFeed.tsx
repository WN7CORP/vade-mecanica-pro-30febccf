
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PostCard, { Post } from "./PostCard";
import { Plus, Minus, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const GENERAL_TAGS = [
  "Constitucional", 
  "Civil", 
  "Penal", 
  "Trabalhista", 
  "Administrativo", 
  "Tributário", 
  "Empresarial", 
  "Ambiental", 
  "Internacional"
];

const LEGISLATION_TAGS = [
  "Leis Federais",
  "Códigos",
  "Estatutos", 
  "Portarias",
  "Resoluções",
  "Decretos",
  "Projetos de Lei",
  "Jurisprudência",
  "Direito Comparado"
];

const MOVIE_TAGS = [
  "Drama Judicial",
  "Biografias",
  "Documentários",
  "Direito Penal",
  "Direito Civil",
  "Direitos Humanos",
  "Advocacia",
  "Casos Históricos",
  "Série Jurídica"
];

interface CommunityFeedProps {
  fontSize: number;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  communityType: 'general' | 'legislation' | 'movies';
}

const CommunityFeed = ({ fontSize, onIncreaseFont, onDecreaseFont, communityType = 'general' }: CommunityFeedProps) => {
  const queryClient = useQueryClient();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  // Select tag options based on community type
  const getTags = () => {
    switch(communityType) {
      case 'legislation': return LEGISLATION_TAGS;
      case 'movies': return MOVIE_TAGS;
      default: return GENERAL_TAGS;
    }
  };

  const getPlaceholderText = () => {
    switch(communityType) {
      case 'legislation':
        return "Compartilhe dúvidas ou informações sobre legislações...";
      case 'movies':
        return "Recomende um filme jurídico ou discuta sobre um título...";
      default:
        return "Compartilhe uma dúvida ou dica com a comunidade...";
    }
  };

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts', activeFilter, sortBy, communityType],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Você precisa estar logado para ver os posts");
        return [];
      }

      let query = supabase.from('community_posts').select(`
        id, 
        content, 
        author_id, 
        created_at, 
        likes, 
        tags,
        is_favorite,
        community_type
      `);
      
      // Filter by community type
      query = query.eq('community_type', communityType);

      if (activeFilter !== 'all') {
        query = query.contains('tags', [activeFilter]);
      }

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('likes', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) {
        toast.error("Erro ao carregar posts", { description: error.message });
        return [];
      }

      return data as Post[];
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (newPost: { content: string, tags: string[], community_type: string }) => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast.error("Você precisa estar logado para criar um post");
        throw new Error("User not authenticated");
      }

      if (newPost.tags.length === 0) {
        toast.error("Adicione pelo menos uma tag ao post");
        throw new Error("No tags selected");
      }

      if (newPost.content.trim().length < 10) {
        toast.error("O conteúdo do post é muito curto");
        throw new Error("Post content too short");
      }

      const { data, error } = await supabase.from('community_posts').insert({
        content: newPost.content,
        tags: newPost.tags,
        author_id: sessionData.session.user.id,
        likes: 0,
        is_favorite: false,
        community_type: newPost.community_type
      }).select();

      if (error) {
        console.error("Post creation error:", error);
        toast.error("Erro ao criar post", { description: error.message });
        throw error;
      }

      toast.success("Post criado com sucesso!");
      setNewPostContent("");
      setSelectedTags([]);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    }
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleCreatePost = () => {
    if (newPostContent.trim().length < 10) {
      toast.error("O conteúdo do post é muito curto");
      return;
    }

    if (selectedTags.length === 0) {
      toast.error("Selecione pelo menos uma tag");
      return;
    }

    createPostMutation.mutate({ 
      content: newPostContent, 
      tags: selectedTags,
      community_type: communityType
    });
  };

  const tags = getTags();

  return (
    <div>
      <div className="flex justify-end gap-2 mb-2">
        <Button 
          size="icon" 
          variant="outline" 
          onClick={onDecreaseFont}
          className="hover:bg-primary-300/10"
        >
          <Minus className="text-primary-300" />
        </Button>
        <span className="inline-block text-sm text-primary-300 mt-1">
          Ajustar fonte ({fontSize}px)
        </span>
        <Button 
          size="icon" 
          variant="outline" 
          onClick={onIncreaseFont}
          className="hover:bg-primary-300/10"
        >
          <Plus className="text-primary-300" />
        </Button>
      </div>

      <div className="p-4 mb-6 border border-primary-300/30 rounded-lg bg-primary-300/5">
        <h3 className="text-primary-300 font-medium mb-2">Selecione pelo menos uma tag para seu post:</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => handleTagToggle(tag)}
              className={
                selectedTags.includes(tag)
                  ? "bg-primary-300 text-gray-900 hover:bg-primary-400"
                  : "border-primary-300/30 text-primary-300 hover:bg-primary-300/10"
              }
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      <Card className="p-4 mb-4 border border-gray-800 bg-gray-900/50">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder={getPlaceholderText()}
          className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-gray-300 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-300 min-h-[100px]"
          style={{ fontSize }}
        />
        <div className="flex justify-end mt-3">
          <Button 
            onClick={handleCreatePost}
            disabled={selectedTags.length === 0 || newPostContent.trim() === ''}
            className="bg-primary-300 hover:bg-primary-400 text-gray-900 disabled:opacity-50"
          >
            Publicar
          </Button>
        </div>
      </Card>

      {communityType === 'movies' && (
        <div className="mb-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Film className="text-primary-300" size={24} />
            <h2 className="text-lg font-medium text-primary-300">Filmes Jurídicos Recomendados</h2>
          </div>
          <p className="text-gray-300 mb-3">
            Compartilhe e descubra filmes que abordam temas jurídicos, como dramas de tribunal, 
            biografias de advogados e documentários sobre casos reais.
          </p>
          <p className="text-sm text-gray-400">
            Ao recomendar um filme, procure incluir detalhes como onde assistir, 
            ano de lançamento e os temas jurídicos abordados.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div>Carregando posts...</div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">
              Nenhum post encontrado nesta comunidade. Seja o primeiro a compartilhar algo!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;
