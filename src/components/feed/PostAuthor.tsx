import PlaceIcon from '@/assets/icons/place.svg';
import { DEFAULT_CHARACTER_CONFIG } from '@/constants/character/assets';
import type { CharacterConfig } from '@/constants/character/types';
import { palette } from '@/constants/colors';
import { View } from 'react-native';
import Character from '../character/Character';
import Typography from '../ui/Typography';

interface Props {
  name: string;
  /** 작성자 캐릭터 구성. 없으면 기본 캐릭터로 렌더한다. */
  character?: CharacterConfig;
  place: string;
  createdAt: string;
}

export default function PostAuthor({
  name,
  character = DEFAULT_CHARACTER_CONFIG,
  place,
  createdAt,
}: Props) {
  return (
    <View className="flex flex-row items-center gap-md">
      <Character config={character} size={56} />
      <View className="flex flex-col gap-xs">
        <Typography variant="h3" className="text-gray-800">
          {name}
        </Typography>
        <View className="flex flex-row items-center gap-sm">
          <View className="flex flex-row items-center gap-xs">
            <PlaceIcon width={20} height={20} color={palette.gray[400]} />
            <Typography variant="body2" className="text-gray-400 text-md">
              {place}
            </Typography>
          </View>
          <Typography variant="body2" className="text-gray-400 text-md">
            ·
          </Typography>
          <Typography variant="body2" className="text-gray-400 text-md">
            {createdAt}
          </Typography>
        </View>
      </View>
    </View>
  );
}
