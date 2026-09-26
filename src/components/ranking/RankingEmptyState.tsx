import { View } from 'react-native';

import Typography from '@/components/ui/Typography';

interface Props {
  /** 안내 문구 둘째 줄. 탭에 따라 "개인"/"동네" 점수 순위로 문구가 달라진다. */
  description: string;
}

/**
 * 랭킹이 하나도 없을 때(대결 미시작) 보여주는 포디움 일러스트 + 안내 문구.
 */
export default function RankingEmptyState({ description }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-lg py-lg">
      <View className="flex-row items-end justify-center gap-md">
        <View className="items-center">
          <View className="-mb-sm h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Typography variant="h4" className="text-gray-400">
              ?
            </Typography>
          </View>
          <View className="h-16 w-16 items-center justify-center rounded-t-lg bg-gray-100">
            <Typography variant="h3" className="text-gray-400">
              2
            </Typography>
          </View>
        </View>

        <View className="items-center">
          <View className="-mb-sm h-14 w-14 items-center justify-center rounded-full bg-primary-200">
            <Typography variant="h2" className="text-primary-600">
              ?
            </Typography>
          </View>
          <View className="h-24 w-20 items-center justify-center rounded-t-lg bg-primary-200">
            <Typography variant="h1" className="text-primary-600">
              1
            </Typography>
          </View>
        </View>

        <View className="items-center">
          <View className="-mb-sm h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Typography variant="h4" className="text-gray-400">
              ?
            </Typography>
          </View>
          <View className="h-16 w-16 items-center justify-center rounded-t-lg bg-gray-100">
            <Typography variant="h3" className="text-gray-400">
              3
            </Typography>
          </View>
        </View>
      </View>

      <View className="items-center gap-xs">
        <Typography variant="h3" className="text-gray-800">
          아직 랭킹이 없어요
        </Typography>
        <Typography variant="body2" className="text-gray-400">
          {description}
        </Typography>
      </View>
    </View>
  );
}
