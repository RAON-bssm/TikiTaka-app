import { memo } from 'react';

import Character from '@/components/character/Character';
import { useUserCharacter } from '@/hooks/character/useUserCharacter';
import type { Equipment } from '@/types/equipment';

interface UserCharacterProps {
  userId: string;
  size?: number;
  className?: string;
  /** 응답에 이미 들어있는 착용 정보. 있으면 개별 조회를 생략한다. */
  equipment?: Equipment;
}

/** userId·size·className이 그대로면 부모가 리렌더돼도 다시 그리지 않도록 memo로 감싼다. */
function UserCharacter({ userId, size, className, equipment }: UserCharacterProps) {
  const config = useUserCharacter(userId, equipment);
  return <Character config={config} size={size} className={className} />;
}

export default memo(UserCharacter);
