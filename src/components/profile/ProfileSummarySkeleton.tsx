import { View } from 'react-native';

import Skeleton from '@/components/ui/feedback/Skeleton';

/**
 * 프로필 화면 상단(UserProfile + 동네 NavRow)의 로딩 뼈대.
 *
 * 두 줄이 같은 요청(`useMyProfile`) 하나에 매달려 있어 함께 채워지므로 한 컴포넌트로 묶었다.
 * NavRow는 배경이 gray-100이라 뼈대(gray-100↔200)를 안에 넣으면 잘 보이지 않아,
 * 실제 높이(p-lg 32 + h3 19 + gap-xs 4 + body3 16)만큼의 블록 하나로 대신한다.
 */
export default function ProfileSummarySkeleton() {
  return (
    <>
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-sm">
          {/* Character size={72} 와 같은 크기 */}
          <Skeleton className="size-[72px] rounded-full" />
          <View className="gap-xs">
            <Skeleton className="h-6 w-28 rounded-sm" />
            <Skeleton className="h-5 w-32 rounded-sm" />
          </View>
        </View>
        <Skeleton className="h-6 w-20 rounded-full" />
      </View>
      <Skeleton className="h-[71px] w-full rounded-md" />
    </>
  );
}
