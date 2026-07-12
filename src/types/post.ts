export interface Board {
  board_id: number;
  team1: string;
  team2: string;
  mission: string;
  match_type: string;
  season: number;
  round: number;
}

export interface BoardListData {
  board: Board[];
}

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

export interface CreatePostRequest {
  board_id: number;
  post_image: string;
  content: string;
}

export interface UpdatePostRequest {
  content: string;
}
