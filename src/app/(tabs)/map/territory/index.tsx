import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import NavRow from '@/components/ui/NavRow';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { useDongPreferences } from '@/hooks/territory/useDongPreferences';
import { useMyTerritories } from '@/hooks/territory/useMyTerritories';
import { useTeamName } from '@/hooks/territory/useTeamName';
import { useTeamRanking } from '@/hooks/territory/useTeamRanking';
import {
  formatTimeLeft,
  type TerritoryPhase,
  useTerritoryPhase,
} from '@/hooks/territory/useTerritoryPhase';
import type { MyTerritory, TeamRank } from '@/types/territory';

const STEPS: { phases: TerritoryPhase[]; label: string }[] = [
  { phases: ['selection'], label: '대표 선발전' },
  { phases: ['awaitingPick'], label: '대표 발표' },
  { phases: ['setup'], label: '땅 세팅' },
  { phases: ['battle'], label: '땅따먹기' },
];

export default function TerritoryHubScreen() {
  const {
    phase,
    myLocationId,
    now,
    data: cycle,
    isLoading,
    isError,
    refetch,
  } = useTerritoryPhase();
  const isSelecting = phase === 'selection' || phase === 'awaitingPick';
  const hasTerritories = phase === 'setup' || phase === 'battle';

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="gap-2xl px-xl pb-3xl pt-2xl">
        <BackButton title="땅따먹기" />

        {isLoading ? (
          <View className="gap-lg">
            <Skeleton className="h-[64px] w-full rounded-md" />
            <Skeleton className="h-[160px] w-full rounded-md" />
          </View>
        ) : isError || !cycle || !phase ? (
          <ErrorRetry message="땅따먹기 정보를 불러오지 못했어요." onRetry={() => void refetch()} />
        ) : phase === 'none' ? (
          <View className="items-center gap-sm py-3xl">
            <Typography variant="h3" className="text-gray-600">
              지금은 땅따먹기 기간이 아니에요
            </Typography>
            <Typography variant="body3" className="text-center text-gray-400">
              다음 사이클이 시작되면 동 대표 선발전부터 열려요.
            </Typography>
          </View>
        ) : (
          <>
            <StepBar phase={phase} />

            {phase === 'selection' && (
              <Notice>
                {`포인트 순위가 높은 순서로 희망 동의 대표가 돼요. ${
                  formatTimeLeft(cycle.ranking_freeze_at, now) ?? ''
                } 뒤 랭킹이 멈추고 대표를 뽑아요.`}
              </Notice>
            )}
            {phase === 'awaitingPick' && (
              <Notice>랭킹이 멈췄어요. 곧 이 순위로 동 대표가 발표돼요.</Notice>
            )}
            {phase === 'setup' && (
              <Notice>
                {`대표가 된 땅의 미션을 정하고 방어 사진을 찍어 두세요. 땅따먹기 시작까지 ${
                  formatTimeLeft(cycle.battle_started_at, now) ?? '곧'
                }`}
              </Notice>
            )}
            {phase === 'battle' && (
              <Notice>
                {`본진 구 안에서 미션 사진을 찍어 다른 팀 땅을 빼앗고, 우리 팀 땅은 개발해서 땅값을 올려요. 끝나기까지 ${
                  formatTimeLeft(cycle.battle_ended_at, now) ?? '곧'
                }`}
              </Notice>
            )}

            {isSelecting && <PreferenceSection />}
            {hasTerritories && <MyTerritorySection phase={phase} />}
            {phase === 'battle' && <TeamRankingSection myLocationId={myLocationId} />}
            {hasTerritories && (
              <NavRow
                title="동 대표 선발 결과"
                description="우리 구의 동마다 누가 대표가 됐는지 봐요"
                onPress={() => router.push('/map/territory/representatives')}
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StepBar({ phase }: { phase: TerritoryPhase }) {
  const current = STEPS.findIndex((step) => step.phases.includes(phase));
  return (
    <View className="flex-row gap-xs">
      {STEPS.map((step, index) => (
        <View key={step.label} className="flex-1 gap-xs">
          <View
            className={`h-[4px] rounded-full ${index <= current ? 'bg-primary-600' : 'bg-gray-200'}`}
          />
          <Typography
            variant="caption"
            className={index === current ? 'text-primary-600' : 'text-gray-400'}
          >
            {step.label}
          </Typography>
        </View>
      ))}
    </View>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-sm bg-secondary-100 p-md">
      <Typography variant="body3" className="text-secondary-500">
        {children}
      </Typography>
    </View>
  );
}

function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-md">
      <View className="flex-row items-end justify-between">
        <Typography variant="h2" className="text-gray-700">
          {title}
        </Typography>
        {aside && (
          <Typography variant="caption" className="text-gray-400">
            {aside}
          </Typography>
        )}
      </View>
      {children}
    </View>
  );
}

function PreferenceSection() {
  const { data: preferences, isLoading, isError, refetch } = useDongPreferences();

  return (
    <Section title="희망 동" aside={`${preferences?.length ?? 0}/3`}>
      {isLoading ? (
        <Skeleton className="h-[120px] w-full rounded-md" />
      ) : isError || !preferences ? (
        <ErrorRetry message="희망 동을 불러오지 못했어요." onRetry={() => void refetch()} />
      ) : (
        <View className="gap-md rounded-md border border-gray-200 bg-white p-lg">
          {preferences.length === 0 ? (
            <Typography variant="body3" className="text-gray-400">
              아직 고른 동이 없어요. 고르지 않으면 남은 동 중에서 무작위로 정해져요.
            </Typography>
          ) : (
            preferences.map((preference) => (
              <View key={preference.dong_code} className="flex-row items-center gap-md">
                <Typography variant="h4" className="text-primary-600">
                  {`${preference.priority}지망`}
                </Typography>
                <Typography variant="body2" className="text-gray-700">
                  {preference.dong_name}
                </Typography>
              </View>
            ))
          )}
          <Button
            content={preferences.length === 0 ? '희망 동 고르기' : '희망 동 바꾸기'}
            size="sm"
            variant="light"
            onclick={() => router.push('/map/territory/preferences')}
          />
        </View>
      )}
    </Section>
  );
}

function MyTerritorySection({ phase }: { phase: TerritoryPhase }) {
  const { data, isLoading, isError, refetch } = useMyTerritories();

  return (
    <Section
      title="내 땅"
      aside={data ? `${data.territories.length}/${data.max_owned}` : undefined}
    >
      {isLoading ? (
        <Skeleton className="h-[72px] w-full rounded-md" />
      ) : isError || !data ? (
        <ErrorRetry message="내 땅을 불러오지 못했어요." onRetry={() => void refetch()} />
      ) : data.territories.length === 0 ? (
        <View className="rounded-md border border-gray-200 bg-white p-lg">
          <Typography variant="body3" className="text-gray-400">
            {phase === 'battle'
              ? '가진 땅이 없어요. 지도에서 다른 팀 땅에 도전해 보세요.'
              : '이번에는 대표가 되지 못했어요. 땅따먹기가 시작되면 다른 팀 땅에 도전할 수 있어요.'}
          </Typography>
        </View>
      ) : (
        data.territories.map((territory) => (
          <MyTerritoryRow key={territory.dong_code} territory={territory} />
        ))
      )}
    </Section>
  );
}

function MyTerritoryRow({ territory }: { territory: MyTerritory }) {
  const teamName = useTeamName();
  const needsSetup = !territory.defense_photo;
  const hasPending = !!territory.pending_adjective;

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/map/territory/manage',
          params: { dongCode: String(territory.dong_code) },
        })
      }
      className="flex-row items-center gap-md rounded-md border border-gray-200 bg-white p-lg active:opacity-80"
    >
      <View className="flex-1 gap-xs">
        <View className="flex-row items-center gap-sm">
          <Typography variant="h3" className="text-gray-700">
            {[teamName(territory.location_id), territory.dong_name].filter(Boolean).join(' ')}
          </Typography>
          {(needsSetup || hasPending) && (
            <View className="rounded-full bg-primary-100 px-sm py-xs">
              <Typography variant="caption" className="text-primary-600">
                {needsSetup ? '세팅 필요' : '새 미션 대기'}
              </Typography>
            </View>
          )}
        </View>
        <Typography variant="body3" className="text-gray-400" numberOfLines={1}>
          {territory.mission ?? '아직 미션이 없어요'}
        </Typography>
      </View>
      <View className="items-end gap-xs">
        <Typography variant="h3" className="text-primary-600">
          {territory.defense_score}
        </Typography>
        <Typography variant="caption" className="text-gray-400">
          방어 점수
        </Typography>
      </View>
      <ChevronRightIcon width={20} height={20} color={palette.gray[400]} />
    </Pressable>
  );
}

function TeamRankingSection({ myLocationId }: { myLocationId: number | undefined }) {
  const { data, isLoading, isError, refetch } = useTeamRanking();

  return (
    <Section title="팀 순위" aside={data ? (data.finalized ? '최종 순위' : '실시간') : undefined}>
      {isLoading ? (
        <Skeleton className="h-[200px] w-full rounded-md" />
      ) : isError || !data ? (
        <ErrorRetry message="팀 순위를 불러오지 못했어요." onRetry={() => void refetch()} />
      ) : (
        <View className="rounded-md border border-gray-200 bg-white py-sm">
          {data.teams.map((team) => (
            <TeamRow
              key={team.location_id}
              team={team}
              mine={team.location_id === (data.my_location_id ?? myLocationId)}
            />
          ))}
        </View>
      )}
    </Section>
  );
}

function TeamRow({ team, mine }: { team: TeamRank; mine: boolean }) {
  return (
    <View className={`flex-row items-center gap-md px-lg py-sm ${mine ? 'bg-primary-100' : ''}`}>
      <Typography
        variant="h4"
        className={`w-[28px] ${team.rank <= 3 ? 'text-primary-600' : 'text-gray-400'}`}
      >
        {team.rank}
      </Typography>
      <View className="flex-1 gap-xs">
        <Typography variant="h4" className={mine ? 'text-primary-700' : 'text-gray-700'}>
          {mine ? `${team.location_name} (우리 팀)` : team.location_name}
        </Typography>
        <Typography variant="caption" className="text-gray-400">
          {`땅 ${team.owned_dong_count}곳`}
        </Typography>
      </View>
      <Typography variant="body3" className="text-gray-600">
        {team.total_land_price.toLocaleString()}
      </Typography>
    </View>
  );
}
