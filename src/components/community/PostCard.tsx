import React, { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Award, Bookmark, Heart, MessageSquare } from "lucide-react";
import CommentList from "./CommentList";

export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  likes: number;
  comments: Comment[];
  tags: string[];
  bestTip?: string;
  isFavorite?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  likes: number;
  isBestTip?: boolean;
  replies?: Comment[]; // Added replies property
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onSetBestTip?: (postId: string, commentId: string) => void;
  onToggleFavorite?: (postId: string) => void;
}

const PostCard = ({ post, onLike, onComment, onSetBestTip, onToggleFavorite }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment("");
    }
  };

  return (
    <Card className="mb-4 overflow-hidden border border-gray-800 bg-gray-900/50">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-lg font-medium text-gray-300">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-200">{post.author.name}</h3>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(post.createdAt, { locale: ptBR, addSuffix: true })}
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

        {post.bestTip && (
          <div className="bg-primary-900/30 border-l-4 border-primary-300 p-3 rounded mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-primary-300" />
              <span className="text-sm font-medium text-primary-300">Melhor Dica</span>
            </div>
            <p className="text-gray-300 text-sm">{post.bestTip}</p>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-primary-300 hover:bg-gray-800"
            onClick={() => onLike(post.id)}
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
            <span>{post.comments.length}</span>
          </Button>
          
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="sm"
              className={`${
                post.isFavorite ? "text-primary-300" : "text-gray-400 hover:text-primary-300"
              } hover:bg-gray-800 ml-auto`}
              onClick={() => onToggleFavorite(post.id)}
            >
              <Bookmark size={16} className={post.isFavorite ? "fill-current" : ""} />
            </Button>
          )}
        </div>
      </div>

      {showComments && (
        <div className="border-t border-gray-800 p-4">
          <CommentList 
            comments={post.comments} 
            postId={post.id}
            onSetBestTip={onSetBestTip}
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
              <Button type="submit" size="sm" className="bg-primary-300 hover:bg-primary-400 text-gray-900">
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
