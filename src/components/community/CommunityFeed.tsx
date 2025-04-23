
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PostCard, { Post } from "./PostCard";

// Mock data for demonstration
const MOCK_POSTS: Post[] = [
  {
    id: "1",
    content: "Acabei de estudar sobre o artigo 5º da Constituição Federal. Alguém tem alguma dica de como memorizar melhor os incisos?",
    author: {
      id: "user1",
      name: "Maria Silva",
      avatar: undefined
    },
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    likes: 12,
    comments: [
      {
        id: "comment1",
        content: "Eu uso mapas mentais para organizar os incisos por tema. Ajuda bastante na memorização!",
        author: {
          id: "user2",
          name: "João Carvalho",
          avatar: undefined
        },
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        likes: 5,
        isBestTip: true
      },
      {
        id: "comment2",
        content: "Também recomendo fazer flashcards e revisar diariamente.",
        author: {
          id: "user3",
          name: "Ana Paula",
          avatar: undefined
        },
        createdAt: new Date(Date.now() - 900000), // 15 minutes ago
        likes: 2
      }
    ],
    tags: ["Constitucional", "Concursos", "Dicas"],
    bestTip: "Eu uso mapas mentais para organizar os incisos por tema. Ajuda bastante na memorização!"
  },
  {
    id: "2",
    content: "Alguém pode me explicar a diferença entre prescrição e decadência no Direito Civil? Estou confundindo os conceitos.",
    author: {
      id: "user4",
      name: "Pedro Almeida",
      avatar: undefined
    },
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    likes: 8,
    comments: [],
    tags: ["Civil", "Dúvida"],
    isFavorite: true
  }
];

const filters = [
  { id: "all", label: "Todos" },
  { id: "constitutional", label: "Constitucional" },
  { id: "civil", label: "Civil" },
  { id: "criminal", label: "Penal" },
  { id: "labor", label: "Trabalhista" },
  { id: "administrative", label: "Administrativo" },
  { id: "tax", label: "Tributário" }
];

interface CommunityFeedProps {
  showFilters: boolean;
}

const CommunityFeed = ({ showFilters }: CommunityFeedProps) => {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleComment = (postId: string, commentContent: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: `comment${Date.now()}`,
            content: commentContent,
            author: {
              id: "currentUser",
              name: "Você",
              avatar: undefined
            },
            createdAt: new Date(),
            likes: 0
          };
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );
  };

  const handleSetBestTip = (postId: string, commentId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const updatedComments = post.comments.map((comment) => ({
            ...comment,
            isBestTip: comment.id === commentId
          }));
          
          const bestTipComment = post.comments.find(
            (comment) => comment.id === commentId
          );
          
          return {
            ...post,
            comments: updatedComments,
            bestTip: bestTipComment?.content
          };
        }
        return post;
      })
    );
  };

  const handleToggleFavorite = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, isFavorite: !post.isFavorite } : post
      )
    );
  };

  return (
    <div>
      {showFilters && (
        <Card className="p-4 mb-4 border border-gray-800 bg-gray-900/50">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className={
                    activeFilter === filter.id
                      ? "bg-primary-300 text-gray-900 hover:bg-primary-400"
                      : "border-gray-700 text-gray-400 hover:text-primary-300"
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-800 pt-3">
              <span className="text-sm text-gray-400">Ordenar por:</span>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "recent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("recent")}
                  className={
                    sortBy === "recent"
                      ? "bg-primary-300 text-gray-900 hover:bg-primary-400"
                      : "border-gray-700 text-gray-400 hover:text-primary-300"
                  }
                >
                  Mais recentes
                </Button>
                <Button
                  variant={sortBy === "popular" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("popular")}
                  className={
                    sortBy === "popular"
                      ? "bg-primary-300 text-gray-900 hover:bg-primary-400"
                      : "border-gray-700 text-gray-400 hover:text-primary-300"
                  }
                >
                  Mais curtidos
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4 mb-4 border border-gray-800 bg-gray-900/50">
        <textarea
          placeholder="Compartilhe uma dúvida ou dica com a comunidade..."
          className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-gray-300 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-300 min-h-[100px]"
        />
        <div className="flex justify-between mt-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:text-primary-300">
              #Tags
            </Button>
          </div>
          <Button className="bg-primary-300 hover:bg-primary-400 text-gray-900">
            Publicar
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onSetBestTip={handleSetBestTip}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default CommunityFeed;
