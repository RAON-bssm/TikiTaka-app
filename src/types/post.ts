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

/**
 * 게시물 상세 조회 응답(`GET /api/post/:postId`)의 data 형태.
 * 목록용 Post와 달리 post_id가 없고, content·ai_review·location·like_count가 추가로 내려온다.
 */
export interface PostDetail {
  user_id: string;
  user_name: string;
  post_image: string;
  content: string;
  score: number;
  ai_review: string;
  location: string;
  like_count: number;
  created_at: string;
  updated_at: string;
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
