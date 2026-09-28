import { View } from 'react-native';
import LikeButton from './LikeButton';
import Typography from '../ui/Typography';

interface Props {
  postId: string;
  authorName: string;
  title: string;
  likeCount: number;
  liked: boolean;
}

export default function PostTitleRow({ postId, authorName, title, likeCount, liked }: Props) {
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
      <LikeButton
        postId={postId}
        likeCount={likeCount}
        liked={liked}
        className="flex flex-row items-center"
        textClassName="text-gray-600"
      />
    </View>
  );
}
