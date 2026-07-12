import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

import FavoriteIcon from '@/assets/icons/favorite.svg';
import MoreIcon from '@/assets/icons/more-vert.svg';
import PlaceIcon from '@/assets/icons/place.svg';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';

const COLOR_GRAY = palette.gray[400];
const COLOR_ORANGE = palette.primary[600];
const COLOR_ICON = palette.gray[500]; // 더보기 아이콘

export interface FeedAuthor {
  name: string;
  avatarUrl: string;
}

interface Props {
  postId: string;
  author: FeedAuthor;
  imageUrl: string;
  title: string;
  place: string;
  timeAgo: string;
  likeCount: number;
  onPressMore?: () => void;
  onPressLike?: () => void;
}

export default function FeedCard({
  postId,
  author,
  imageUrl,
  title,
  place,
  timeAgo,
  likeCount,
  onPressMore,
  onPressLike,
}: Props) {
  return (
    <Pressable
      onPress={() => router.push(`/feed/${postId}`)}
      className="w-full gap-lg rounded-md border border-gray-100 bg-white p-lg active:opacity-90"
    >
      <View className="w-full flex-row items-center justify-between">
        <View className="flex-row items-center gap-sm">
          <Image source={{ uri: author.avatarUrl }} className="size-10 rounded-full bg-gray-100" />
          <Typography variant="body2" className="text-gray-800">
            {author.name}
          </Typography>
        </View>
        <Pressable onPress={onPressMore} className="active:opacity-70">
          <MoreIcon width={24} height={24} color={COLOR_ICON} />
        </Pressable>
      </View>

      <View className="h-[225px] w-full overflow-hidden rounded-lg bg-gray-400">
        <Image source={{ uri: imageUrl }} resizeMode="cover" className="h-full w-full" />
      </View>

      <View className="w-full flex-row items-center justify-between">
        <View className="gap-xs">
          <Typography variant="h3" className="text-gray-800">
            {title}
          </Typography>
          <View className="flex-row items-center gap-sm">
            <View className="flex-row items-center gap-xs">
              <PlaceIcon width={20} height={20} color={COLOR_GRAY} />
              <Typography variant="body3" className="text-gray-400">
                {place}
              </Typography>
            </View>
            <Typography variant="body3" className="text-gray-400">
              ·
            </Typography>
            <Typography variant="body3" className="text-gray-400">
              {timeAgo}
            </Typography>
          </View>
        </View>

        <Pressable
          onPress={onPressLike}
          className="items-center justify-center gap-[2px] active:opacity-70"
        >
          <FavoriteIcon width={20} height={20} color={COLOR_ORANGE} />
          <Typography variant="body3" className="text-gray-700">
            {likeCount}
          </Typography>
        </Pressable>
      </View>
    </Pressable>
  );
}
