import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getSavedCharacter, saveCharacter } from '@/api/character';
import { getEquipment } from '@/api/equipment';
import { characterKeys } from '@/api/queryKeys';
import { DEFAULT_CHARACTER_CONFIG } from '@/constants/character/assets';
import { equipmentToConfig } from '@/constants/character/equipment';
import type { CharacterConfig } from '@/constants/character/types';

/**
 * 캐릭터 config를 로컬 저장소에 영속화한다. 쿼리 캐시로 상태를 공유해,
 * 꾸미기 화면에서 저장하면 같은 훅을 쓰는 다른 화면에도 즉시 반영된다.
 */
export function useCharacterConfig(fallback: CharacterConfig = DEFAULT_CHARACTER_CONFIG) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: characterKeys.config(),
    queryFn: async () => {
      const saved = await getSavedCharacter();
      if (saved) return saved;
      try {
        return equipmentToConfig(await getEquipment(), fallback);
      } catch {
        return fallback;
      }
    },
    // 로컬 저장본이 기준이라 자동 재요청은 불필요하다.
    staleTime: Infinity,
  });

  // 저장에 성공한 뒤에만 캐시를 바꾼다. 먼저 바꾸면 실패해도 저장된 것처럼 보이고 재시작 때 사라진다.
  const setConfig = async (next: CharacterConfig) => {
    await saveCharacter(next);
    queryClient.setQueryData(characterKeys.config(), next);
  };

  return { config: data ?? fallback, setConfig, isLoaded: !isLoading };
}
