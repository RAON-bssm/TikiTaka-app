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
        className="rounded-full bg-white"
      />
      <View className="flex flex-col gap-xs">
        <Typography variant="h3" className="text-gray-800">
          {name}
        </Typography>
        <View className="flex flex-row items-center gap-sm">
          <View className="flex flex-row items-center gap-xs">
            <PlaceIcon width={24} height={24} color="#9DAABB" />
            <Typography variant="body2" className="text-gray-300 text-md">
              {place}
            </Typography>
          </View>
          <Typography variant="body2" className="text-gray-300 text-md">
            ·
          </Typography>
          <Typography variant="body2" className="text-gray-300 text-md">
            {createdAt}
          </Typography>
        </View>
      </View>
    </View>
  );
}
