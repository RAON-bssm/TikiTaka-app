import PlaceIcon from '@/assets/icons/place.svg';
import { CharacterConfig } from '@/constants/character/types';
import { View } from 'react-native';
import Character from '../character/Character';
import PointBadge from '../ui/PointBadge';
import Typography from '../ui/Typography';

interface Props {
  character: CharacterConfig;
  point: number;
  userName: string;
  userPlace: string;
}

export default function UserProfile({ character, point, userName, userPlace }: Props) {
  return (
    <View className="flex flex-row justify-between items-center">
      <View className="flex flex-row justify-content items-center gap-sm">
        <Character config={character} size={72} />
        <View className="flex flex-col ">
          <Typography variant="h2" className="text-gray-700">
            {userName}
          </Typography>
          <View className="flex flex-row items-center gap-xs">
            <PlaceIcon width={24} height={24} color="#9DAABB" />
            <Typography variant="body2" className="text-gray-400 text-sm">
              {userPlace}
            </Typography>
          </View>
        </View>
      </View>
      <PointBadge point={point} />
    </View>
  );
}
