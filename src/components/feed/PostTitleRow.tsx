import { View } from 'react-native';
import Typography from '../ui/Typography';
import LikeButton from './LikeButton';
import PostSaveImageButton from './PostSaveImageButton';
import PostShareButton from './PostShareButton';

interface Props {
  postId: string;
  title: string;
  /** 사진 저장에 쓰는 S3 key(`post_image`)와 조회 URL. */
  imageKey: string;
  imageUrl?: string;
  likeCount?: number;
  liked?: boolean;
}

export default function PostTitleRow({
  postId,
  title,
  imageKey,
  imageUrl,
  likeCount,
  liked,
}: Props) {
  return (
    <View className="flex flex-row items-start gap-md">
      <Typography variant="body2" className="flex-1 text-gray-800">
        {title}
      </Typography>
      {likeCount !== undefined && (
        <LikeButton
          postId={postId}
          likeCount={likeCount}
          liked={liked}
          className="flex flex-row items-center"
          textClassName="text-gray-700"
        />
      )}
      <PostSaveImageButton imageKey={imageKey} imageUrl={imageUrl} />
      <PostShareButton postId={postId} />
    </View>
  );
}
