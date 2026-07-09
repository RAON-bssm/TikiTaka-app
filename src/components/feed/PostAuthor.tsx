import PlaceIcon from '@/assets/icons/place.svg';
import { palette } from '@/constants/colors';
import { Image, View } from 'react-native';
import Typography from '../ui/Typography';

interface Props {
  name: string;
  profile: string;
  place: string;
  createdAt: string;
}

export default function PostAuthor({ name, profile, place, createdAt }: Props) {
  return (
    <View className="flex flex-row items-center gap-md">
      <Image
        source={{ uri: profile }}
        style={{ width: 40, height: 40 }}
        className="rounded-full bg-white"
      />
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
