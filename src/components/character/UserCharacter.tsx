import { memo } from 'react';

import Character from '@/components/character/Character';
import { useUserCharacter } from '@/hooks/character/useUserCharacter';

interface UserCharacterProps {
  userId: string;
  size?: number;
  className?: string;
}

/** userId·size·className이 그대로면 부모가 리렌더돼도 다시 그리지 않도록 memo로 감싼다. */
function UserCharacter({ userId, size, className }: UserCharacterProps) {
  const config = useUserCharacter(userId);
  return <Character config={config} size={size} className={className} />;
}

export default memo(UserCharacter);
