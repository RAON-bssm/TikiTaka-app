export interface Post {
  post_id: string;
  user_id: string;
  user_name: string;
  post_image: string;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface PostListData {
  post: Post[];
}
