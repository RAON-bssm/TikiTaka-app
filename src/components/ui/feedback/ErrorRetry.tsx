import { View } from 'react-native';

import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';

interface Props {
  message?: string;
  /** 보통 refetch를 넘긴다. */
  onRetry: () => void;
}

export default function ErrorRetry({ message = '게시글을 불러오지 못했어요.', onRetry }: Props) {
  return (
    <View className="items-center gap-lg py-3xl">
      <Typography variant="body2" className="text-center text-gray-400">
        {message}
      </Typography>
      <Button content="다시 시도" variant="light" size="sm" onclick={onRetry} />
    </View>
  );
}
