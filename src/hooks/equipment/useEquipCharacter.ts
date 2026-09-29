import { useMutation, useQueryClient } from '@tanstack/react-query';

import { equipItems } from '@/api/equipment';
import { getInventory } from '@/api/inventory';
import { equipmentKeys, inventoryKeys } from '@/api/queryKeys';
import { configToColorRequest, configToEquipRequest } from '@/constants/character/equipment';
import type { CharacterConfig } from '@/constants/character/types';

/**
 * 로컬 config를 서버 착용 상태에 맞춘다. 화면은 로컬 저장본을 그리므로 실패해도 알리지 않는다.
 * 인벤토리는 구매 직후 무효화된 상태일 수 있어 ensureQueryData가 아니라 fetchQuery로 최신값을 받는다.
 */
export function useEquipCharacter() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: equipItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });

  return async (config: CharacterConfig) => {
    // 색은 착용과 따로 보낸다. 서버에 없는 색이면 요청 전체가 400이라, 같이 보내면 착용까지 막힌다.
    mutate(configToColorRequest(config));

    try {
      const inventory = await queryClient.fetchQuery({
        queryKey: inventoryKeys.list(),
        queryFn: getInventory,
      });
      const req = configToEquipRequest(config, inventory);
      if (req) mutate(req);
    } catch {
      // 인벤토리 조회 실패도 착용 동기화만 건너뛴다.
    }
  };
}
