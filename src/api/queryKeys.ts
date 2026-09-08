/**
 * TanStack Query 키를 만드는 단일 창구.
 *
 * 1. 도메인마다 `all`을 두고 **전체 무효화에만** 쓴다.
 * 2. 세부 키는 `[...all, '역할', 파라미터]`로 `all`을 접두사로 갖는다.
 *    접두사가 겹치므로 `all` 무효화가 하위 키까지 덮는다.
 * 3. 훅에 문자열 배열을 직접 쓰지 않고, 새 도메인은 여기에 키를 먼저 추가한다.
 */

export const boardKeys = {
  all: ['board'] as const,
  /** 게시판 목록. `GET /api/board` */
  list: () => [...boardKeys.all, 'list'] as const,
};

export const postKeys = {
  all: ['post'] as const,
  /** 게시판별 게시물 목록. `GET /api/post/{boardId}` */
  list: (boardId: number) => [...postKeys.all, 'list', boardId] as const,
  /** 게시물 상세. `GET /api/post/{postId}` */
  detail: (postId: string) => [...postKeys.all, 'detail', postId] as const,
};

export const storageKeys = {
  all: ['storage'] as const,
  /** S3 key로 발급받은 presigned 조회 URL. `GET /api/storage/view-url` */
  viewUrl: (key: string | undefined) => [...storageKeys.all, 'viewUrl', key] as const,
};

export const characterKeys = {
  all: ['character'] as const,
  /** 캐릭터 config. 서버 연동 전까지 기기 로컬 저장이 유일한 출처다. */
  config: () => [...characterKeys.all, 'config'] as const,
};

export const userKeys = {
  all: ['user'] as const,
  /** 내 정보(동네 id 포함). `GET /api/user/me` */
  me: () => [...userKeys.all, 'me'] as const,
  /** 프로필(동네 이름 + 이번 라운드 순위). `GET /api/users/profile` */
  profile: () => [...userKeys.all, 'profile'] as const,
};

export const locationKeys = {
  all: ['location'] as const,
  /** 동네 목록. `GET /api/location` */
  list: () => [...locationKeys.all, 'list'] as const,
};

export const rankingKeys = {
  all: ['ranking'] as const,
  /** 동네 랭킹. `GET /api/location/rank` */
  location: () => [...rankingKeys.all, 'location'] as const,
  /** 개인 랭킹. `GET /api/users/rank` */
  user: () => [...rankingKeys.all, 'user'] as const,
};

export const matchKeys = {
  all: ['match'] as const,
  /** 현재 시즌·라운드. `GET /api/match/stage` */
  stage: () => [...matchKeys.all, 'stage'] as const,
  /** 직전 라운드 경기 결과. `GET /api/match/result` */
  result: () => [...matchKeys.all, 'result'] as const,
};

export const productKeys = {
  all: ['product'] as const,
  /** 상점 상품 목록(미보유만). `GET /api/product` */
  list: () => [...productKeys.all, 'list'] as const,
};

export const inventoryKeys = {
  all: ['inventory'] as const,
  /** 보유 아이템 목록. `GET /api/inventory` */
  list: () => [...inventoryKeys.all, 'list'] as const,
};

export const equipmentKeys = {
  all: ['equipment'] as const,
  /** 현재 착용 상태. `GET /api/equipment` */
  current: () => [...equipmentKeys.all, 'current'] as const,
};
