import FavoriteIcon from '@/assets/icons/favorite.svg';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { palette } from '@/constants/colors';
import Typography from '../ui/Typography';

interface Props {
  authorName: string;
  title: string;
  likeCount: number;
}

export default function PostTitleRow({ authorName, title, likeCount }: Props) {
  const [liked, setLiked] = useState(false);

  return (
    <View className="flex flex-row items-center justify-between">
      <View className="flex flex-row items-center gap-xs">
        <Typography variant="h3" className="text-gray-800">
          {authorName}
        </Typography>
        <Typography variant="h3" className="text-gray-600">
          ·
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          {title}
        </Typography>
      </View>
      <Pressable
        onPress={() => setLiked((prev) => !prev)}
        className="flex flex-row items-center gap-xs active:opacity-70"
      >
        <FavoriteIcon
          width={20}
          height={20}
          color={liked ? palette.primary[600] : palette.gray[400]}
        />
        <Typography variant="body3" className="text-gray-600">
          {likeCount + (liked ? 1 : 0)}
        </Typography>
      </Pressable>
    </View>
  );
}
