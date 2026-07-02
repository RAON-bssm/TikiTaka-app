import PlaceIcon from '@/assets/icons/place.svg';
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
        className="rounded-full bg-gray-50"
      />
      <View className="flex flex-col gap-xs">
        <Typography variant="body2" className="text-gray-900">
          {name}
        </Typography>
        <View className="flex flex-row items-center gap-sm">
          <View className="flex flex-row items-center gap-xs">
            <PlaceIcon width={12} height={12} color="#9DAABB" />
            <Typography variant="body3" className="text-gray-500 text-[10px]">
              {place}
            </Typography>
          </View>
          <Typography variant="body3" className="text-gray-500 text-[10px]">
            ·
          </Typography>
          <Typography variant="body3" className="text-gray-500 text-[10px]">
            {createdAt}
          </Typography>
        </View>
      </View>
    </View>
  );
}
