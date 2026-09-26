import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getSavedCharacter, saveCharacter } from '@/api/character';
import { characterKeys } from '@/api/queryKeys';
import { DEFAULT_CHARACTER_CONFIG } from '@/constants/character/assets';
import type { CharacterConfig } from '@/constants/character/types';

/**
 * 캐릭터 config를 로컬 저장소에 영속화한다. 쿼리 캐시로 상태를 공유해,
 * 꾸미기 화면에서 저장하면 같은 훅을 쓰는 다른 화면에도 즉시 반영된다.
 */
export function useCharacterConfig(fallback: CharacterConfig = DEFAULT_CHARACTER_CONFIG) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: characterKeys.config(),
    queryFn: async () => (await getSavedCharacter()) ?? fallback,
    // 로컬 저장소가 유일한 출처라 자동 재요청은 불필요하다.
    staleTime: Infinity,
  });

  const setConfig = (next: CharacterConfig) => {
    queryClient.setQueryData(characterKeys.config(), next);
    // 저장 실패해도 화면 상태는 유지되도록 fire-and-forget 한다.
    void saveCharacter(next);
  };

  return { config: data ?? fallback, setConfig, isLoaded: !isLoading };
}
