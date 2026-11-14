import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

import { queryClient } from './queryClient';
import { storageKeys } from './queryKeys';

const PERSIST_KEY = 'tikitaka:query-cache';
// 하루 지난 캐시는 복원하지 않는다. 그보다 오래된 피드·랭킹을 보여주는 건 의미가 없다.
const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;

const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: PERSIST_KEY });

/**
 * 마지막으로 본 피드·랭킹을 기기에 저장해, 앱을 다시 열었을 때 빈 화면 대신 바로 보여준다.
 * `view-url`(presigned, 10분 만료)은 저장해도 곧 못 쓰니 제외한다.
 * 루트 레이아웃에서 한 번만 호출한다. 반환하는 해제 함수는 StrictMode 이중 마운트 대비용.
 */
export function setupQueryPersistence(): () => void {
  const [unsubscribe] = persistQueryClient({
    queryClient,
    persister,
    maxAge: PERSIST_MAX_AGE,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) =>
        query.state.status === 'success' && query.queryKey[0] !== storageKeys.all[0],
    },
  });
  return unsubscribe;
}

/** 로그아웃·탈퇴 때 다음 계정에 이전 캐시가 보이지 않도록 저장소에서도 지운다(`useClearSession`). */
export function clearPersistedQueryCache() {
  return persister.removeClient();
}
