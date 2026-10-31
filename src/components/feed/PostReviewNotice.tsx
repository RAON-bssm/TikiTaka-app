import { View } from 'react-native';

import InfoIcon from '@/assets/icons/info.svg';
import Typography from '@/components/ui/Typography';
import { getPostReviewNotice } from '@/constants/post';
import { palette } from '@/constants/colors';
import type { PostStatus } from '@/types/post';

interface Props {
  status: PostStatus;
}

export default function PostReviewNotice({ status }: Props) {
  const { title, description } = getPostReviewNotice(status);

  return (
    <View className="flex-row items-start gap-md rounded-md border border-gray-100 bg-white p-lg">
      <InfoIcon width={24} height={24} color={palette.primary[600]} />
      <View className="flex-1 gap-xs">
        <Typography variant="h3" className="text-gray-800">
          {title}
        </Typography>
        <Typography variant="body3" className="text-gray-500">
          {description}
        </Typography>
      </View>
    </View>
  );
}
