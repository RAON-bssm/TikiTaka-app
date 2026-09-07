import type { ApiResponse, DateTimeString, EmptyResponse } from './api';

/**
 * 게시판 한 건. `GET /api/board`
 *
 * 내 메인 동네가 참가한 게시판이 목록 앞쪽에 오고 `my_match: true`가 붙는다.
 * "현재 내 미션"은 첫 항목이 아니라 `my_match`로 찾을 것.
 */
export interface Board {
  board_id: number;
  team1_name: string;
  team2_name: string;
  mission: string;
  /** **enum 이름이 아니라 한글 설명이 온다.** (`'일반 매치'` 등) */
  match_type: string;
  season: number;
  round: number;
  my_match: boolean;
}

export interface BoardListData {
  board: Board[];
}

export type BoardListResponse = ApiResponse<BoardListData>;

/**
 * 게시물 목록의 한 건. `GET /api/post/{boardId}`
 *
 * `post_image`는 URL이 아니라 **S3 key**다. 표시하려면 `getViewUrl(key)`를 거쳐야 한다.
 */
export interface Post {
  post_id: string;
  user_id: string;
  user_name: string;
  post_image: string;
  score: number;
  created_at: DateTimeString;
  updated_at: DateTimeString;
  content: string;
  location: string;
}

export interface PostListData {
  post: Post[];
}

export type PostListResponse = ApiResponse<PostListData>;

/**
 * 게시물 상세. `GET /api/post/{postId}`
 * 목록용 Post와 달리 post_id가 없고, ai_review·like_count가 추가로 내려온다.
 *
 * `like_count`는 **서버가 항상 0을 넣는다.** 좋아요 기능이 아직 없다.
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
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export type PostDetailResponse = ApiResponse<PostDetail>;

/**
 * 게시물 생성 요청. `POST /api/post` (multipart/form-data)
 *
 * **form-data 파트 이름은 `boardId`·`content`·`image`**다. 스네이크 케이스 규칙이
 * 적용되지 않으니 주의. (전송은 `src/api/post.ts` 참고)
 */
export interface CreatePostRequest {
  board_id: number;
  /** 업로드할 사진의 로컬 경로 (file:///...). image 파트로 전송된다. */
  fileUri: string;
  content: string;
}

/** 게시물 수정 요청 body. `PATCH /api/post/patch/{postId}` */
export interface UpdatePostRequest {
  content: string;
}

/**
 * 게시물 생성 응답. `POST /api/post`
 *
 * **생성된 post_id를 돌려주지 않는다.** 작성 직후 상세로 보내려면 목록을 다시 받아야 한다.
 * 실패: 400(이미지 오류·AI 점수 실패), 404(종료된 라운드·내 동네 아님), 413(용량 초과)
 */
export type CreatePostResponse = EmptyResponse;

/** 게시물 수정 응답. `PATCH /api/post/patch/{postId}` 남의 게시물이면 403. */
export type UpdatePostResponse = EmptyResponse;

/**
 * 게시물 삭제 응답. `PATCH /api/post/delete/{postId}` (DELETE가 아니라 PATCH다)
 *
 * **소프트 삭제**이고, 이 게시물이 올렸던 동네·개인 점수를 되돌려 차감한다.
 * 삭제 후에는 랭킹 쿼리도 함께 무효화할 것. 남의 게시물이면 403.
 */
export type DeletePostResponse = EmptyResponse;
