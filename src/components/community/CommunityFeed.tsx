
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PostCard, { Post } from "./PostCard";
import { Plus, Minus } from "lucide-react";

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
        isBestTip: true,
        replies: [
          {
            id: "reply1",
            content: "Boa dica! Vou experimentar mapas mentais também.",
            author: {
              id: "user4",
              name: "Lucas Rocha",
              avatar: undefined
            },
            createdAt: new Date(Date.now() - 1600000),
            likes: 1,
          }
        ]
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
        likes: 2,
        replies: []
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
  fontSize: number;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
}

const renderThreadedComments = (comments: any[], depth = 0) =>
  comments.map((comment) => (
    <div key={comment.id} className={`ml-${Math.min(depth * 4, 12)} border-l-2 border-gray-800 pl-3 mt-2`}>
      <div className="flex gap-2 items-center text-xs">
        <span className="font-bold text-primary-200">{comment.author.name}</span>
        <span className="text-gray-500">{Math.floor((Date.now() - new Date(comment.createdAt).getTime()) / 60000)}min atrás</span>
        {comment.isBestTip && <span className="ml-1 px-2 py-0.5 bg-purple-600/30 text-purple-200 rounded text-xxs">Melhor Dica</span>}
      </div>
      <div className="my-1 text-gray-200 text-sm">{comment.content}</div>
      <div className="flex gap-3 items-center mb-2">
        <Button size="sm" variant="ghost" className="text-primary-200 px-1">Curtir</Button>
        <Button size="sm" variant="ghost" className="text-primary-200 px-1">Responder</Button>
      </div>
      {comment.replies && comment.replies.length > 0 && renderThreadedComments(comment.replies, depth + 1)}
    </div>
  ));

const CommunityFeed = ({ fontSize, onIncreaseFont, onDecreaseFont }: CommunityFeedProps) => {
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
            likes: 0,
            replies: []
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

  // Filtro simulado
  const filteredPosts =
    activeFilter === "all"
      ? posts
      : posts.filter((post) =>
          post.tags?.map((tag) => tag.toLowerCase()).includes(activeFilter)
        );

  // Ordenação simulada
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return (b.likes || 0) - (a.likes || 0);
    }
  });

  return (
    <div>
      <div className="flex justify-end gap-2 mb-2">
        <Button size="icon" variant="outline" onClick={onDecreaseFont}>
          <Minus />
        </Button>
        <span className="inline-block text-sm text-primary-200 mt-1">Ajustar fonte</span>
        <Button size="icon" variant="outline" onClick={onIncreaseFont}>
          <Plus />
        </Button>
      </div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
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
      {/* Ordenação */}
      <div className="flex items-center justify-between border-t border-gray-800 pt-3 mb-4">
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

      {/* Criar novo post */}
      <Card className="p-4 mb-4 border border-gray-800 bg-gray-900/50">
        <textarea
          placeholder="Compartilhe uma dúvida ou dica com a comunidade..."
          className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-md text-gray-300 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-300 min-h-[100px]"
          style={{ fontSize }}
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
        {sortedPosts.map((post) => (
          <Card key={post.id} className="p-4 border border-gray-800 bg-gray-900/50">
            <div className="mb-2">
              <span className="font-semibold text-primary-200">{post.author.name}</span>
              <span className="ml-2 text-xs text-gray-500">{Math.floor((Date.now() - new Date(post.createdAt).getTime())/60000)}min atrás</span>
              {post.tags && (
                <div className="mt-1 flex gap-1 flex-wrap">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-primary-300/10 text-primary-200 text-xs rounded">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="my-2 text-gray-100" style={{ fontSize }}>
              {post.content}
            </div>
            <div className="flex gap-4 mt-2 items-center">
              <Button size="sm" variant="ghost" className="hover:text-primary-300 px-2" onClick={() => handleLike(post.id)}>
                Curtir {post.likes > 0 && <span className="ml-1 text-primary-200">{post.likes}</span>}
              </Button>
              <Button size="sm" variant="ghost" className="hover:text-primary-300 px-2">
                Comentar
              </Button>
              {/* Outros ícones: copiar, favoritar, grifar seriam implementados aqui */}
            </div>
            <div className="mt-2">
              {post.comments?.length > 0 && renderThreadedComments(post.comments)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityFeed;
