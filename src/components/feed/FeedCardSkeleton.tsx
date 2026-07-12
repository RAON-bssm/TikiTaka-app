import { View } from 'react-native';

import Skeleton from '@/components/ui/feedback/Skeleton';

/**
 * FeedCard 의 로딩 상태 뼈대. 실제 FeedCard 와 동일한 레이아웃·간격을 따른다.
 */
export default function FeedCardSkeleton() {
  return (
    <View className="w-full gap-lg rounded-md border border-gray-100 bg-white p-lg">
      <View className="w-full flex-row items-center justify-between">
        <View className="flex-row items-center gap-sm">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-sm" />
        </View>
        <Skeleton className="size-6 rounded-sm" />
      </View>

      <Skeleton className="h-[225px] w-full rounded-lg" />

      <View className="w-full flex-row items-center justify-between">
        <View className="gap-xs">
          <Skeleton className="h-5 w-40 rounded-sm" />
          <Skeleton className="h-4 w-28 rounded-sm" />
        </View>
        <Skeleton className="size-6 rounded-sm" />
      </View>
    </View>
  );
}
