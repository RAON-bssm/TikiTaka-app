import Character from '@/components/character/Character';
import { useUserCharacter } from '@/hooks/character/useUserCharacter';

interface UserCharacterProps {
  userId: string;
  size?: number;
  className?: string;
}

export default function UserCharacter({ userId, size, className }: UserCharacterProps) {
  const config = useUserCharacter(userId);
  return <Character config={config} size={size} className={className} />;
}
