
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PostCard, { Post, Comment } from "./PostCard";
import { Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Predefined list of tags (expanded to include more areas)
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

  // Fetch posts from Supabase
  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts', activeFilter, sortBy],
    queryFn: async () => {
      let query = supabase.from('community_posts').select(`
        id, 
        content, 
        author_id, 
        created_at, 
        likes, 
        tags,
        is_favorite
      `);

      // Apply tag filter if not 'all'
      if (activeFilter !== 'all') {
        query = query.contains('tags', [activeFilter]);
      }

      // Sort posts
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

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (newPost: { content: string, tags: string[] }) => {
      // Validate tags and content
      if (newPost.tags.length === 0) {
        toast.error("Adicione pelo menos uma tag");
        throw new Error("No tags selected");
      }

      if (newPost.content.trim() === '') {
        toast.error("O conteúdo do post não pode estar vazio");
        throw new Error("Empty post content");
      }

      // Get current user from session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast.error("Você precisa estar logado para criar um post");
        throw new Error("User not authenticated");
      }
      
      const userId = sessionData.session.user.id;

      const { data, error } = await supabase.from('community_posts').insert({
        content: newPost.content,
        tags: newPost.tags,
        author_id: userId,
        likes: 0,
        is_favorite: false
      });

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

  // Tag selection handler
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Post creation handler
  const handleCreatePost = () => {
    createPostMutation.mutate({ 
      content: newPostContent, 
      tags: selectedTags 
    });
  };

  return (
    <div>
      {/* Font size controls */}
      <div className="flex justify-end gap-2 mb-2">
        <Button size="icon" variant="outline" onClick={onDecreaseFont}>
          <Minus />
        </Button>
        <span className="inline-block text-sm text-primary-200 mt-1">Ajustar fonte</span>
        <Button size="icon" variant="outline" onClick={onIncreaseFont}>
          <Plus />
        </Button>
      </div>

      {/* Tags Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TAGS.map((tag) => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            size="sm"
            onClick={() => handleTagToggle(tag)}
            className={
              selectedTags.includes(tag)
                ? "bg-primary-300 text-gray-900 hover:bg-primary-400"
                : "border-gray-700 text-gray-400 hover:text-primary-300"
            }
          >
            {tag}
          </Button>
        ))}
      </div>

      {/* New Post Card */}
      <Card className="p-4 mb-4 border border-gray-800 bg-gray-900/50">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Compartilhe uma dúvida ou dica com a comunidade..."
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

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div>Carregando posts...</div>
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
