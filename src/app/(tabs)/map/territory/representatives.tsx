import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import UserCharacter from '@/components/character/UserCharacter';
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
    <View className="flex-row gap-sm">
      <Skeleton className="h-[176px] flex-1 rounded-md" />
      <Skeleton className="h-[176px] flex-1 rounded-md" />
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

  const list = data?.representatives ?? [];
  // 2열이라 개수가 홀수면 마지막 카드가 혼자 줄을 채우지 않게 빈 칸을 하나 둔다.
  const cells: (Representative | null)[] = list.length % 2 === 1 ? [...list, null] : list;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <FlatList
        data={cells}
        numColumns={2}
        keyExtractor={(item) => (item ? `${item.dong_code}-${item.user_id}` : 'empty')}
        renderItem={({ item }) =>
          item ? <RepresentativeCard representative={item} /> : <View className="flex-1" />
        }
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        columnWrapperClassName="gap-sm"
        ItemSeparatorComponent={() => <View className="h-sm" />}
        contentContainerClassName="px-xl pb-3xl pt-2xl"
      />
    </SafeAreaView>
  );
}

function RepresentativeCard({ representative }: { representative: Representative }) {
  const { mine } = representative;
  return (
    <View
      className={`flex-1 items-center gap-sm rounded-md border px-md pb-lg pt-md ${
        mine ? 'border-primary-300 bg-primary-100' : 'border-gray-200 bg-white'
      }`}
    >
      <View className="w-full flex-row items-center justify-between">
        <Typography variant="caption" className="text-gray-400">
          {`#${representative.rank}`}
        </Typography>
        <View className={`rounded-full px-sm py-xs ${mine ? 'bg-white' : 'bg-gray-100'}`}>
          <Typography variant="caption" className={mine ? 'text-primary-600' : 'text-gray-500'}>
            {ASSIGNED_LABEL[representative.assigned_by]}
          </Typography>
        </View>
      </View>
      <Typography
        variant="h3"
        className={mine ? 'text-primary-700' : 'text-gray-800'}
        numberOfLines={1}
      >
        {representative.dong_name}
      </Typography>
      <UserCharacter userId={representative.user_id} size={64} />
      <View className="items-center gap-xs">
        <View className="flex-row items-center gap-xs">
          <Typography variant="body3" className="text-gray-700" numberOfLines={1}>
            {representative.user_name}
          </Typography>
          {mine && (
            <View className="rounded-full bg-primary-600 px-sm">
              <Typography variant="caption" className="text-white">
                나
              </Typography>
            </View>
          )}
        </View>
        <Typography variant="caption" className="text-gray-400">
          {`${representative.score.toLocaleString()}점`}
        </Typography>
      </View>
    </View>
  );
}
