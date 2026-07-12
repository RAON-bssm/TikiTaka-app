import { View } from 'react-native';

import Skeleton from '@/components/ui/feedback/Skeleton';

/**
 * 게시글 상세 화면의 로딩 상태 뼈대.
 * PostAuthor + PostImage / PostTitleRow / AiScoreCard 레이아웃을 그대로 따른다.
 */
export default function PostDetailSkeleton() {
  return (
    <>
      <View className="flex flex-col gap-lg">
        <View className="flex flex-row items-center gap-md">
          <Skeleton className="size-14 rounded-full" />
          <View className="flex flex-col gap-xs">
            <Skeleton className="h-5 w-24 rounded-sm" />
            <Skeleton className="h-4 w-32 rounded-sm" />
          </View>
        </View>
        <Skeleton className="h-[320px] w-full rounded-lg" />
      </View>

      <View className="flex-row items-center justify-between">
        <Skeleton className="h-6 w-48 rounded-sm" />
        <Skeleton className="size-6 rounded-sm" />
      </View>

      <View className="flex flex-row items-center gap-xl rounded-md border border-gray-100 bg-white p-lg">
        <View className="flex flex-col items-center gap-sm">
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-16 w-16 rounded-md" />
        </View>
        <View className="h-[81px] w-[2px] rounded-xs bg-gray-200" />
        <View className="flex-1 gap-xs pt-md">
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-2/3 rounded-sm" />
        </View>
      </View>
    </>
  );
}
