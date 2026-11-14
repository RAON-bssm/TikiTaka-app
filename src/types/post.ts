import type { ApiResponse, DateTimeString, EmptyResponse } from './api';
import type { Equipment } from './equipment';

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

export type PostStatus = 'PENDING' | 'DONE' | 'REJECTED' | 'FAILED' | 'EXPIRED';

export interface BoardListData {
  board: Board[];
}

export type BoardListResponse = ApiResponse<BoardListData>;

/**
 * 삭제된 글과 심사가 끝나지 않은(`DONE`이 아닌) 글은 빠진다. 없는 board_id도 404가 아니라 빈 목록이다.
 *
 * `post_image`는 URL이 아니라 S3 key(구버전 호환용, 캐시 키로 안 쓴다). 카드에는 `post_thumbnail`
 * (캐시 키)과 `post_thumbnail_url`(다운로드)만 쓰면 된다 — 썸네일이 없는 글은 이 두 필드에 원본과
 * 같은 값이 들어가므로 분기 불필요. **두 필드가 응답에 아예 없으면 이미지가 없는 글이다(기본 이미지 표시).**
 * `post_image_url`은 상세·내 게시물 화면 전용이라 피드 카드에서는 쓰지 않는다.
 * `user_equipment`는 작성자 캐릭터 정보(`GET /api/equipment/{userId}`와 같은 모양). 없는 슬롯은 키가 빠진다.
 */
export interface Post {
  post_id: string;
  user_id: string;
  user_name: string;
  user_equipment?: Equipment;
  post_image: string;
  post_image_url?: string;
  post_thumbnail?: string;
  post_thumbnail_url?: string;
  score: number;
  like_count: number;
  liked_by_me: boolean;
  created_at: DateTimeString;
  updated_at: DateTimeString;
  content: string;
  city_name: string;
  location: string;
}

/** `next_cursor`는 size·cursor 파라미터로 요청했을 때만, 다음 페이지가 있으면 들어간다. */
export interface PostListData {
  post: Post[];
  next_cursor?: string;
}

export type PostListResponse = ApiResponse<PostListData>;

/**
 * `GET /api/user/me/posts`(마이페이지 게시물 보관함). 항상 본인 글이라 `user_id`·`user_name`이 없다.
 * 라운드를 넘나드는 목록이라 그 글이 속했던 게시판·매치 정보가 붙는다. 삭제된 글은 빠지고 최신순이다.
 * 심사 상태와 상관없이 모든 글이 오고, `DONE`이 아니면 `score` 키가 없다.
 */
export interface MyPost {
  post_id: string;
  post_image: string;
  /** 이미지가 없거나 조회 URL 발급에 실패하면 빠진다 — 없으면 `useViewUrl(post_image)`로 받는다. */
  post_image_url?: string;
  status: PostStatus;
  score?: number;
  created_at: DateTimeString;
  updated_at: DateTimeString;
  content: string;
  city_name: string;
  location: string;
  board_id: number;
  mission: string;
  team1_name: string;
  team2_name: string;
  /** enum 이름이 아니라 한글 설명이 온다. (`'일반 매치'` 등) */
  match_type: string;
  season: number;
  round: number;
  like_count: number;
  liked_by_me: boolean;
}

export interface MyPostListData {
  post: MyPost[];
}

export type MyPostListResponse = ApiResponse<MyPostListData>;

/**
 * 없거나 삭제된 글이면 404. 목록용 Post와 달리 post_id가 없다.
 * `DONE`이 아닌 글은 작성자 본인만 볼 수 있고(남은 404), `score`·`ai_review` 키가 빠진다.
 */
export interface PostDetail {
  user_id: string;
  user_name: string;
  post_image: string;
  /** 이미지가 없거나 조회 URL 발급에 실패하면 빠진다 — 없으면 `useViewUrl(post_image)`로 받는다. */
  post_image_url?: string;
  content: string;
  status: PostStatus;
  score?: number;
  ai_review?: string;
  city_name: string;
  location: string;
  like_count: number;
  liked_by_me: boolean;
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
 * 실패: 400 이미지 오류(동기 모드는 AI 점수 실패도), 404 종료된 라운드·내 동네 아님, 413 용량 초과,
 * 429 업로드 한도(10분에 2건, 심사 대기 2건). 429의 `message`는 그대로 보여줄 수 있는 문장이다.
 */
export interface CreatePostData {
  post_id: string;
  status: PostStatus;
}

/**
 * 본문만 바뀐다. 이미지는 수정할 수 없고 AI 점수도 재심사하지 않는다.
 * 실패: 403 남의 게시물, 404 없는 게시물, 409 심사 중(`PENDING`)인 게시물.
 */
export type UpdatePostResponse = EmptyResponse;

/**
 * 좋아요 `POST`, 취소 `DELETE /api/post/{postId}/like`. 둘 다 idempotent라 이미 그 상태여도 성공이다.
 * 좋아요 수는 주지 않아 목록·상세를 다시 받아야 한다. 없거나 삭제됐거나 심사가 끝나지 않은 글이면 404.
 */
export type LikePostResponse = EmptyResponse;

/**
 * `PATCH /api/post/delete/{postId}`(DELETE 아님). 소프트 삭제이며 동네·개인 점수를 차감하므로(심사 전 글은 차감 없음)
 * 랭킹 쿼리도 함께 무효화할 것. 남의 게시물이면 403.
 */
export type DeletePostResponse = EmptyResponse;
