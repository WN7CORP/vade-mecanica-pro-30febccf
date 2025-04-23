
export interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  likes: number;
  is_favorite: boolean;
  tags: string[];
  best_tip_id: string | null;
  community_type: 'general' | 'legislation' | 'movies';
  commentCount?: number;
}
