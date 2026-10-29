import LoadingImage from '@/components/ui/feedback/LoadingImage';
import { useViewUrl } from '@/hooks/storage/useViewUrl';

interface Props {
  /** 서버가 내려준 이미지 key (또는 절대 URL). */
  uri: string;
}

export default function PostImage({ uri }: Props) {
  const { uri: resolvedUri, isLoading } = useViewUrl(uri);

  return (
    <LoadingImage
      uri={isLoading ? undefined : (resolvedUri ?? undefined)}
      className="h-[320px] w-full rounded-lg"
    />
  );
}
