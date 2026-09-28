import Skeleton from '@/components/ui/feedback/Skeleton';
import PointBadge from '@/components/ui/PointBadge';
import { useMyProfile } from '@/hooks/user/useMyProfile';

/** 구매하면 `userKeys`가 무효화돼 차감된 포인트로 다시 그려진다. 실패하면 숨긴다. */
export default function MyPointBadge() {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading) return <Skeleton className="h-7 w-20 rounded-full" />;
  if (!profile) return null;
  return <PointBadge point={profile.point} />;
}
