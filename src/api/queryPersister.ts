import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type {
  PersistedClient,
  PersistQueryClientOptions,
} from '@tanstack/react-query-persist-client';

import { QUERY_CACHE_MAX_AGE } from './queryClient';
import { postKeys, storageKeys } from './queryKeys';
import { VIEW_URL_SAFE_AGE } from './storage';

const PERSIST_KEY = 'tikitaka:query-cache';

/**
 * 게시물 응답에는 presigned 이미지 URL(10분 만료)이 들어 있다. 그보다 오래된 게시물 캐시를 복원하면
 * 디스크에 없는 이미지가 한꺼번에 실패하므로, 복원할 때 빼고 새로 받게 한다.
 */
function dropExpiredPostQueries(client: PersistedClient): PersistedClient {
  const now = Date.now();
  const queries = client.clientState.queries.filter(
    (query) =>
      query.queryKey[0] !== postKeys.all[0] || now - query.state.dataUpdatedAt < VIEW_URL_SAFE_AGE,
  );
  return { ...client, clientState: { ...client.clientState, queries } };
}

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: PERSIST_KEY,
  deserialize: (cached) => dropExpiredPostQueries(JSON.parse(cached) as PersistedClient),
});

/**
 * 마지막으로 본 피드·랭킹을 기기에 저장해, 앱을 다시 열었을 때 빈 화면 대신 바로 보여준다.
 * `view-url`은 URL만 담고 있어 곧 만료되므로 아예 저장하지 않는다.
 * 루트 레이아웃의 `PersistQueryClientProvider`에 넘긴다. 복원이 끝날 때까지 쿼리 요청을 멈춰 둔다.
 */
export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister,
  maxAge: QUERY_CACHE_MAX_AGE,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      query.state.status === 'success' && query.queryKey[0] !== storageKeys.all[0],
  },
};

/** 로그아웃·탈퇴 때 다음 계정에 이전 캐시가 보이지 않도록 저장소에서도 지운다(`useClearSession`). */
export async function clearPersistedQueryCache(): Promise<void> {
  await persister.removeClient();
}
