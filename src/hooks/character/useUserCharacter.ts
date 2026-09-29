import { useQuery } from '@tanstack/react-query';

import { getUserEquipment } from '@/api/equipment';
import { equipmentKeys } from '@/api/queryKeys';
import { DEFAULT_CHARACTER_CONFIG } from '@/constants/character/assets';
import { equipmentToConfig } from '@/constants/character/equipment';
import type { CharacterConfig } from '@/constants/character/types';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';
import { useMyInfo } from '@/hooks/user/useMyInfo';

/**
 * 다른 유저의 착용 상태(모양·색)로 캐릭터를 만든다. 색을 한 번도 올리지 않은 유저는 기본 색이다.
 * 본인은 로컬 저장본을 그려야 내 화면(프로필 등)과 모습이 같다(서버 반영 전이어도).
 * 로딩·실패 중에는 기본 캐릭터를 그린다.
 */
export function useUserCharacter(userId: string): CharacterConfig {
  const { data: myInfo } = useMyInfo();
  const { config: myConfig } = useCharacterConfig();
  const isMe = myInfo?.user_id === userId;

  const { data } = useQuery({
    queryKey: equipmentKeys.user(userId),
    queryFn: () => getUserEquipment(userId),
    enabled: !isMe,
    select: (equipment) => equipmentToConfig(equipment, DEFAULT_CHARACTER_CONFIG),
  });

  if (isMe) return myConfig;
  return data ?? DEFAULT_CHARACTER_CONFIG;
}
