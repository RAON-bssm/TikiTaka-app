import { View } from 'react-native';
import Typography from '../ui/Typography';
import LikeButton from './LikeButton';

interface Props {
  postId: string;
  title: string;
  likeCount: number;
  liked: boolean;
}

export default function PostTitleRow({ postId, title, likeCount, liked }: Props) {
  return (
    <View className="flex flex-row items-start gap-md">
      <Typography variant="body2" className="flex-1 text-gray-800">
        {title}
      </Typography>
      <LikeButton
        postId={postId}
        likeCount={likeCount}
        liked={liked}
        className="flex flex-row items-center"
        textClassName="text-gray-700"
      />
    </View>
  );
}
