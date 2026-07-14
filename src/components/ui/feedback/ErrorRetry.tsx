import { View } from 'react-native';

import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';

interface Props {
  /** 안내 문구. 기본값은 게시글 로딩 실패 메시지. */
  message?: string;
  /** "다시 시도" 버튼을 눌렀을 때 실행(보통 refetch). */
  onRetry: () => void;
}

/**
 * 데이터 로딩 실패 시 안내 문구 + "다시 시도" 버튼을 보여주는 공용 컴포넌트.
 */
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
