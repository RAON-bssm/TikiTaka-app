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
      // 새 기기·재설치처럼 저장본이 없을 때만 서버 착용 상태로 모양을 복원한다. 색은 기본값이다.
      try {
        return equipmentToConfig(await getEquipment(), fallback);
      } catch {
        return fallback;
      }
    },
    // 로컬 저장본이 기준이라 자동 재요청은 불필요하다.
    staleTime: Infinity,
  });

  const setConfig = (next: CharacterConfig) => {
    queryClient.setQueryData(characterKeys.config(), next);
    // 저장 실패해도 화면 상태는 유지되도록 fire-and-forget 한다.
    void saveCharacter(next);
  };

  return { config: data ?? fallback, setConfig, isLoaded: !isLoading };
}
