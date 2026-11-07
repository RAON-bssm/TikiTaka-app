import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BackButton from '@/components/ui/BackButton';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Typography from '@/components/ui/Typography';
import { useRepresentatives } from '@/hooks/territory/useRepresentatives';
import { useTeamName } from '@/hooks/territory/useTeamName';
import { useTerritoryPhase } from '@/hooks/territory/useTerritoryPhase';
import type { AssignedBy, Representative } from '@/types/territory';

const ASSIGNED_LABEL: Record<AssignedBy, string> = {
  PREFERENCE_1: '1지망',
  PREFERENCE_2: '2지망',
  PREFERENCE_3: '3지망',
  RANDOM: '무작위',
};

/** 응답 형식이 임시라(서버 명세) 화면을 얇게 둔다. */
export default function RepresentativesScreen() {
  const cycle = useTerritoryPhase();
  const myLocationId = cycle.myLocationId;
  const teamName = useTeamName();
  // 구를 모를 때 부르면 부산 전체가 먼저 보였다가 바뀌므로 사이클을 받은 뒤에 부른다.
  const representatives = useRepresentatives(myLocationId, { enabled: cycle.isSuccess });
  const { data, refetch } = representatives;
  const isLoading = cycle.isLoading || representatives.isLoading;
  const isError = cycle.isError || representatives.isError;
  const guName = teamName(myLocationId);

  const header = (
    <View className="gap-2xl pb-lg">
      <BackButton title="동 대표 선발 결과" />
      <View className="gap-sm">
        <Typography variant="h1" className="text-gray-800">
          {guName ? `${guName} 동 대표` : '동 대표'}
        </Typography>
        <Typography variant="body3" className="text-gray-400">
          선발전 포인트 순위대로 희망 동을 배정했어요.
        </Typography>
      </View>
    </View>
  );

  const empty = isLoading ? (
    <View className="gap-sm">
      <Skeleton className="h-[64px] w-full rounded-md" />
      <Skeleton className="h-[64px] w-full rounded-md" />
      <Skeleton className="h-[64px] w-full rounded-md" />
    </View>
  ) : isError || !data ? (
    <ErrorRetry message="선발 결과를 불러오지 못했어요." onRetry={() => void refetch()} />
  ) : (
    <View className="items-center py-3xl">
      <Typography variant="body2" className="text-center text-gray-400">
        {data.representatives_selected
          ? '이번 사이클에 뽑힌 대표가 없어요.'
          : '아직 대표가 발표되지 않았어요.'}
      </Typography>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <FlatList
        data={data?.representatives ?? []}
        keyExtractor={(item) => `${item.dong_code}-${item.user_id}`}
        renderItem={({ item }) => <RepresentativeRow representative={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => <View className="h-sm" />}
        contentContainerClassName="px-xl pb-3xl pt-2xl"
      />
    </SafeAreaView>
  );
}

function RepresentativeRow({ representative }: { representative: Representative }) {
  const { mine } = representative;
  return (
    <View
      className={`flex-row items-center gap-md rounded-md border p-lg ${
        mine ? 'border-primary-300 bg-primary-100' : 'border-gray-200 bg-white'
      }`}
    >
      <Typography variant="h3" className="w-[32px] text-gray-400">
        {representative.rank}
      </Typography>
      <View className="flex-1 gap-xs">
        <Typography variant="h3" className={mine ? 'text-primary-700' : 'text-gray-700'}>
          {representative.dong_name}
        </Typography>
        <Typography variant="body3" className="text-gray-500">
          {mine ? `${representative.user_name} (나)` : representative.user_name}
        </Typography>
      </View>
      <View className="items-end gap-xs">
        <Typography variant="caption" className="text-gray-400">
          {ASSIGNED_LABEL[representative.assigned_by]}
        </Typography>
        <Typography variant="body3" className="text-gray-600">
          {`${representative.score.toLocaleString()}점`}
        </Typography>
      </View>
    </View>
  );
}
