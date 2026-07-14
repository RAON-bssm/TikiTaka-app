import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getSavedCharacter, saveCharacter } from '@/api/character';
import { DEFAULT_CHARACTER_CONFIG } from '@/constants/character/assets';
import type { CharacterConfig } from '@/constants/character/types';

/** 캐릭터 config 캐시 키. 이 키를 공유하는 모든 화면이 같은 상태를 본다. */
const CHARACTER_QUERY_KEY = ['character'] as const;

/**
 * 캐릭터 config를 소유하고 기기에 영속화하는 훅.
 *
 * TanStack Query 캐시(`['character']`)로 상태를 공유하므로, 꾸미기 화면에서 저장하면
 * 마이페이지 등 같은 훅을 쓰는 다른 화면에도 즉시 반영된다. 마운트 시 저장값을 불러오고,
 * `setConfig`로 바꿀 때마다 캐시를 갱신하고 로컬 저장소에 자동 저장한다.
 *
 * @param fallback 저장된 값이 없을 때 사용할 config
 * @returns config, setConfig(자동 저장), isLoaded(불러오기 완료 여부)
 */
export function useCharacterConfig(fallback: CharacterConfig = DEFAULT_CHARACTER_CONFIG) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: CHARACTER_QUERY_KEY,
    queryFn: async () => (await getSavedCharacter()) ?? fallback,
    // 로컬 저장소가 유일한 출처라 자동 재요청은 불필요하다.
    staleTime: Infinity,
  });

  const setConfig = (next: CharacterConfig) => {
    // 캐시를 즉시 갱신해 이 훅을 쓰는 모든 화면이 바로 바뀌게 한다.
    queryClient.setQueryData(CHARACTER_QUERY_KEY, next);
    // 저장 실패해도 화면 상태는 유지되도록 fire-and-forget 한다.
    void saveCharacter(next);
  };

  return { config: data ?? fallback, setConfig, isLoaded: !isLoading };
}
