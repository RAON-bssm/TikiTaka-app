import PlaceIcon from '@/assets/icons/place.svg';
import { useRouter } from 'expo-router';
import { Image, ImageBackground, Pressable, View } from 'react-native';
import Typography from '../ui/Typography';

interface Props {
  imgUrl: string;
  user: {
    name: string;
    profile: string;
  };
  place: string;
  postId: string;
}

export default function FeedPreviewCard({ imgUrl, user, place, postId }: Props) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/feed/${postId}`)}>
      <ImageBackground
        source={{ uri: imgUrl }}
        className="w-[160px] h-[220px] overflow-hidden rounded-md"
      >
        <View className="absolute inset-0 bg-black/20" />
        <View className="flex-1 justify-between p-md">
          <View className="flex flex-row items-center gap-xs">
            <Image source={{ uri: user.profile }} className="w-8 h-8 rounded-full" />
            <Typography variant="h4" className="text-white">
              {user.name}
            </Typography>
          </View>
          <View className="flex flex-row items-center gap-xs">
            <PlaceIcon width={16} height={16} color="#F9FAFB" />
            <Typography variant="h4" className="text-white">
              {place}
            </Typography>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}
