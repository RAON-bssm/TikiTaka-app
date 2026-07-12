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
  /** 업로드할 사진의 로컬 경로 (file:///...). form-data의 post_image 파트로 전송된다. */
  fileUri: string;
  content: string;
}

export interface UpdatePostRequest {
  content: string;
}
