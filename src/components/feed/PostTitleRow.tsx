import FavoriteIcon from '@/assets/icons/favorite.svg';
import { View } from 'react-native';
import Typography from '../ui/Typography';

interface Props {
  authorName: string;
  title: string;
  likeCount: number;
}

export default function PostTitleRow({ authorName, title, likeCount }: Props) {
  return (
    <View className="flex flex-row items-center justify-between">
      <View className="flex flex-row items-center gap-xs">
        <Typography variant="h3" className="text-gray-900">
          {authorName}
        </Typography>
        <Typography variant="h3" className="text-gray-700">
          ·
        </Typography>
        <Typography variant="body2" className="text-gray-700">
          {title}
        </Typography>
      </View>
      <View className="flex flex-row items-center gap-xs">
        <FavoriteIcon width={20} height={20} color="#FC8253" />
        <Typography variant="body3" className="text-gray-700">
          {likeCount}
        </Typography>
      </View>
    </View>
  );
}
