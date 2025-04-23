
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PostCard, { Post } from "./PostCard";
import { Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TAGS = [
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

const CommunityFeed = ({ fontSize, onIncreaseFont, onDecreaseFont }) => {
  const queryClient = useQueryClient();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts', activeFilter, sortBy],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Você precisa estar logado para ver os posts");
        return [];
      }

      try {
        let query = supabase.from('community_posts').select(`
          id, 
          content, 
          author_id, 
          created_at, 
          likes, 
          tags,
          is_favorite
        `);

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
      } catch (err) {
        console.error("Error fetching posts:", err);
        toast.error("Erro ao carregar posts");
        return [];
      }
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (newPost: { content: string, tags: string[] }) => {
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
        is_favorite: false
        // We're not mentioning liked_by here since it causes errors
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
      tags: selectedTags 
    });
  };

  return (
    <div>
      <div className="flex justify-end gap-2 mb-2">
        <Button 
          size="icon" 
          variant="outline" 
          onClick={onDecreaseFont}
          className="hover:bg-primary-300/10 transition-all hover:scale-105"
          aria-label="Diminuir fonte"
        >
          <Minus className="text-primary-300" />
        </Button>
        <Button 
          size="icon" 
          variant="outline" 
          onClick={onIncreaseFont}
          className="hover:bg-primary-300/10 transition-all hover:scale-105"
          aria-label="Aumentar fonte"
        >
          <Plus className="text-primary-300" />
        </Button>
      </div>

      <div className="p-4 mb-6 border border-primary-300/30 rounded-lg bg-primary-300/5 animate-fade-in">
        <h3 className="text-primary-300 font-medium mb-2">Selecione pelo menos uma tag para seu post:</h3>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => handleTagToggle(tag)}
              className={
                selectedTags.includes(tag)
                  ? "bg-primary-300 text-gray-900 hover:bg-primary-400 transition-colors hover:scale-[1.02]"
                  : "border-primary-300/30 text-primary-300 hover:bg-primary-300/10 transition-colors hover:scale-[1.02]"
              }
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      <Card className="p-4 mb-4 border border-gray-800 bg-gray-900/50 hover:shadow-lg transition-all duration-300">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Compartilhe uma dúvida ou dica com a comunidade..."
          className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-gray-300 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-300 min-h-[100px] transition-all"
          style={{ fontSize }}
        />
        <div className="flex justify-end mt-3">
          <Button 
            onClick={handleCreatePost}
            disabled={selectedTags.length === 0 || newPostContent.trim() === ''}
            className="bg-primary-300 hover:bg-primary-400 text-gray-900 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
          >
            Publicar
          </Button>
        </div>
      </Card>

      <div className="space-y-4 animate-fade-in">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando posts...</p>
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-8 neomorph">
            <p className="text-gray-400">Nenhum post encontrado. Seja o primeiro a compartilhar!</p>
          </div>
        ) : (
          posts?.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;
