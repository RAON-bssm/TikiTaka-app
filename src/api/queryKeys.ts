/**
 * TanStack Query 키의 단일 창구. 훅에 문자열 배열을 직접 쓰지 말고 새 도메인은 여기에 먼저 추가한다.
 * 세부 키는 `[...all, '역할', 파라미터]`로 `all`을 접두사로 가져, `all` 무효화가 하위 키까지 덮는다.
 */

export const boardKeys = {
  all: ['board'] as const,
  list: () => [...boardKeys.all, 'list'] as const,
};

export const postKeys = {
  all: ['post'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (boardId: number) => [...postKeys.lists(), boardId] as const,
  detail: (postId: string) => [...postKeys.all, 'detail', postId] as const,
};

export const storageKeys = {
  all: ['storage'] as const,
  viewUrl: (key: string | undefined) => [...storageKeys.all, 'viewUrl', key] as const,
};

export const characterKeys = {
  all: ['character'] as const,
  /** 서버 연동 전까지 기기 로컬 저장이 유일한 출처다. */
  config: () => [...characterKeys.all, 'config'] as const,
};

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

export const locationKeys = {
  all: ['location'] as const,
  list: () => [...locationKeys.all, 'list'] as const,
};

export const rankingKeys = {
  all: ['ranking'] as const,
  location: () => [...rankingKeys.all, 'location'] as const,
  user: () => [...rankingKeys.all, 'user'] as const,
};

export const matchKeys = {
  all: ['match'] as const,
  stage: () => [...matchKeys.all, 'stage'] as const,
  result: () => [...matchKeys.all, 'result'] as const,
};

export const productKeys = {
  all: ['product'] as const,
  /** 미보유 상품만 내려온다. */
  list: () => [...productKeys.all, 'list'] as const,
};

export const inventoryKeys = {
  all: ['inventory'] as const,
  list: () => [...inventoryKeys.all, 'list'] as const,
};

export const equipmentKeys = {
  all: ['equipment'] as const,
  current: () => [...equipmentKeys.all, 'current'] as const,
};
