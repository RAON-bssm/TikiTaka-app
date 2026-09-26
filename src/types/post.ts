import type { ApiResponse, DateTimeString, EmptyResponse } from './api';

/**
 * 현재 라운드의 모든 게시판. 내 매치가 맨 앞에 오지만, 내 매치가 없으면 첫 항목은 남의 게시판이니
 * "현재 내 미션"은 `my_match`로 찾을 것. 기준은 본진이 아니라 지금 있는 동네(`current_location`)이고,
 * 글은 `my_match`인 게시판에만 쓸 수 있다. 토큰 없이 부르면 전부 false.
 */
export interface Board {
  board_id: number;
  team1_name: string;
  team2_name: string;
  mission: string;
  /** enum 이름이 아니라 한글 설명이 온다. (`'일반 매치'` 등) */
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
 * 삭제된 글은 빠진다. 없는 board_id도 404가 아니라 빈 목록이다.
 * `post_image`는 URL이 아니라 S3 key다. 표시하려면 `getViewUrl(key)`를 거친다.
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
  city_name: string;
  location: string;
}

export interface PostListData {
  post: Post[];
}

export type PostListResponse = ApiResponse<PostListData>;

/** 없거나 삭제된 글이면 404. 목록용 Post와 달리 post_id가 없다. `like_count`는 좋아요 기능이 없어 서버가 항상 0을 넣는다. */
export interface PostDetail {
  user_id: string;
  user_name: string;
  post_image: string;
  content: string;
  score: number;
  ai_review: string;
  city_name: string;
  location: string;
  like_count: number;
  created_at: DateTimeString;
  updated_at: DateTimeString;
}

export type PostDetailResponse = ApiResponse<PostDetail>;

/** multipart 전송. 실제 파트 이름은 `boardId`·`content`·`image`다(`src/api/post.ts`). */
export interface CreatePostRequest {
  board_id: number;
  /** 업로드할 사진의 로컬 경로 (file:///...). */
  fileUri: string;
  content: string;
}

export interface UpdatePostRequest {
  content: string;
}

/**
 * 생성된 post_id를 돌려주지 않는다.
 * 실패: 400 이미지 오류·AI 점수 실패, 404 종료된 라운드·내 동네 아님, 413 용량 초과.
 */
export type CreatePostResponse = EmptyResponse;

/** 남의 게시물이면 403. */
export type UpdatePostResponse = EmptyResponse;

/**
 * `PATCH /api/post/delete/{postId}`(DELETE 아님). 소프트 삭제이며 동네·개인 점수를 차감하므로
 * 랭킹 쿼리도 함께 무효화할 것. 남의 게시물이면 403.
 */
export type DeletePostResponse = EmptyResponse;
