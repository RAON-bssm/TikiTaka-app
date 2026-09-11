import { View } from 'react-native';

import Skeleton from '@/components/ui/feedback/Skeleton';

export default function ProfileSummarySkeleton() {
  return (
    <>
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-sm">
          <Skeleton className="size-[72px] rounded-full" />
          <View className="gap-xs">
            <Skeleton className="h-6 w-28 rounded-sm" />
            <Skeleton className="h-5 w-32 rounded-sm" />
          </View>
        </View>
        <Skeleton className="h-6 w-20 rounded-full" />
      </View>
      {/* 배경이 gray-100인 NavRow 안에서는 뼈대가 묻혀, 같은 높이의 블록 하나로 대신한다. */}
      <Skeleton className="h-[71px] w-full rounded-md" />
    </>
  );
}
