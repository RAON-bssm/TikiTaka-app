import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BattleButton from '@/components/territory/battle/BattleButton';
import BattleHero from '@/components/territory/battle/BattleHero';
import BattleTag from '@/components/territory/battle/BattleTag';
import BackButton from '@/components/ui/BackButton';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import MyTerritoryMap from '@/components/territory/MyTerritoryMap';
import NavRow from '@/components/ui/NavRow';
import Typography from '@/components/ui/Typography';
import { useDongPreferences } from '@/hooks/territory/useDongPreferences';
import { useMyTerritories } from '@/hooks/territory/useMyTerritories';
import { useTeamName } from '@/hooks/territory/useTeamName';
import {
  describeTimeLeft,
  type TerritoryPhase,
  useTerritoryPhase,
} from '@/hooks/territory/useTerritoryPhase';
import type { CurrentCycle, DongPreference, MyTerritory } from '@/types/territory';

type ActivePhase = Exclude<TerritoryPhase, 'none'>;

const STEPS: { phase: ActivePhase; label: string }[] = [
  { phase: 'selection', label: '선발' },
  { phase: 'awaitingPick', label: '발표' },
  { phase: 'setup', label: '세팅' },
  { phase: 'battle', label: '땅따먹기' },
];

const PHASE_TITLE: Record<ActivePhase, string> = {
  selection: '대표 선발전',
  awaitingPick: '대표 발표 대기',
  setup: '땅 세팅 기간',
  battle: '땅따먹기',
};

function countdown(phase: ActivePhase, cycle: CurrentCycle, now: number): string {
  switch (phase) {
    case 'selection':
      return describeTimeLeft(
        cycle.ranking_freeze_at,
        now,
        (left) => `랭킹 마감까지 ${left}`,
        '곧 랭킹이 멈춰요',
      );
    case 'awaitingPick':
      return '랭킹이 멈췄어요. 곧 동 대표가 발표돼요';
    case 'setup':
      return describeTimeLeft(
        cycle.battle_started_at,
        now,
        (left) => `땅따먹기 시작까지 ${left}`,
        '곧 땅따먹기가 시작돼요',
      );
    case 'battle':
      return describeTimeLeft(
        cycle.battle_ended_at,
        now,
        (left) => `끝나기까지 ${left}`,
        '곧 땅따먹기가 끝나요',
      );
  }
}

export default function TerritoryHubScreen() {
  const {
    phase,
    now,
    data: cycle,
    myLocationId,
    isLoading,
    isError,
    refetch,
  } = useTerritoryPhase();
  const teamName = useTeamName();
  const isSelecting = phase === 'selection' || phase === 'awaitingPick';
  const hasTerritories = phase === 'setup' || phase === 'battle';
  const preferences = useDongPreferences({ enabled: isSelecting });
  const myTerritories = useMyTerritories({ enabled: hasTerritories });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="gap-2xl px-xl pb-3xl pt-2xl">
        <BackButton title="땅따먹기" />

        {isLoading ? (
          <View className="gap-lg">
            <Skeleton className="h-[176px] w-full rounded-xl" />
            <Skeleton className="h-[140px] w-full rounded-md" />
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
            <Hero phase={phase} cycle={cycle} now={now} />

            <TodoCard
              phase={phase}
              preferences={preferences.data}
              myTerritories={myTerritories.data?.territories}
              loading={isSelecting ? preferences.isLoading : myTerritories.isLoading}
            />

            {hasTerritories && (
              <>
                <MyTerritorySection
                  territories={myTerritories.data?.territories}
                  maxOwned={myTerritories.data?.max_owned}
                  teamGu={teamName(myLocationId)}
                  isLoading={myTerritories.isLoading}
                  isError={myTerritories.isError}
                  onRetry={() => void myTerritories.refetch()}
                />
                <View className="gap-sm">
                  <NavRow
                    title="동 대표 선발 결과"
                    description="우리 구의 동마다 누가 대표가 됐는지 봐요"
                    onPress={() => router.push('/map/territory/representatives')}
                  />
                  {phase === 'battle' && (
                    <NavRow
                      title="팀 순위"
                      description="랭킹 탭에서 구별 땅값 순위를 봐요"
                      onPress={() => router.push({ pathname: '/ranking', params: { tab: 'team' } })}
                    />
                  )}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Hero({ phase, cycle, now }: { phase: ActivePhase; cycle: CurrentCycle; now: number }) {
  const current = STEPS.findIndex((step) => step.phase === phase);

  return (
    <BattleHero
      tone="me"
      tag={`STEP ${current + 1}/${STEPS.length}`}
      title={PHASE_TITLE[phase]}
      subtitle={countdown(phase, cycle, now)}
    >
      <View className="gap-xs pt-sm">
        <View className="flex-row items-center">
          {STEPS.map((step, index) => (
            <View
              key={step.phase}
              className={`flex-row items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              <View
                className={`h-[14px] w-[14px] rounded-full border-2 border-white ${
                  index <= current ? 'bg-white' : 'bg-primary-600'
                }`}
              />
              {index < STEPS.length - 1 && (
                <View
                  className={`h-[3px] flex-1 ${index < current ? 'bg-white' : 'bg-white/40'}`}
                />
              )}
            </View>
          ))}
        </View>
        <View className="flex-row justify-between">
          {STEPS.map((step, index) => (
            <Typography
              key={step.phase}
              variant={index === current ? 'h4' : 'caption'}
              className={index === current ? 'text-white' : 'text-white/70'}
            >
              {step.label}
            </Typography>
          ))}
        </View>
      </View>
    </BattleHero>
  );
}

type Todo = {
  title: string;
  description: string;
  action?: { label: string; href: Href };
  extra?: ReactNode;
};

function PreferenceChips({ preferences }: { preferences: DongPreference[] }) {
  return (
    <View className="flex-row flex-wrap gap-sm">
      {[...preferences]
        .sort((a, b) => a.priority - b.priority)
        .map((preference) => (
          <View
            key={preference.dong_code}
            className="flex-row items-center gap-xs rounded-full bg-primary-100 px-md py-xs"
          >
            <Typography variant="caption" className="text-primary-600">
              {`${preference.priority}지망`}
            </Typography>
            <Typography variant="body3" className="text-gray-700">
              {preference.dong_name}
            </Typography>
          </View>
        ))}
    </View>
  );
}

function getTodo(
  phase: ActivePhase,
  preferences: DongPreference[] | undefined,
  territories: MyTerritory[] | undefined,
): Todo {
  if (phase === 'selection' || phase === 'awaitingPick') {
    const count = preferences?.length ?? 0;
    const extra = count > 0 ? <PreferenceChips preferences={preferences ?? []} /> : undefined;
    if (phase === 'awaitingPick') {
      return {
        title: '곧 동 대표가 발표돼요',
        description: '희망 동은 발표 전까지 바꿀 수 있어요.',
        action: { label: '희망 동 바꾸기', href: '/map/territory/preferences' },
        extra,
      };
    }
    return count === 0
      ? {
          title: '대표가 되고 싶은 동을 골라 주세요',
          description:
            '포인트 순위가 높은 사람부터 희망 동에 배정돼요. 최대 3곳까지 고를 수 있어요.',
          action: { label: '희망 동 고르기', href: '/map/territory/preferences' },
        }
      : {
          title: `희망 동 ${count}/3 등록했어요`,
          description: '랭킹이 멈추기 전까지 포인트를 모아 순위를 올려 보세요.',
          action: { label: '희망 동 바꾸기', href: '/map/territory/preferences' },
          extra,
        };
  }

  const unset = territories?.find((territory) => !territory.defense_photo);
  const pending = territories?.find((territory) => territory.pending_adjective);

  if (phase === 'setup') {
    if (unset) {
      return {
        title: '대표가 됐어요!',
        description: `${unset.dong_name} 미션을 정하고 방어 사진을 찍어 주세요.`,
        action: {
          label: '땅 세팅하기',
          href: {
            pathname: '/map/territory/mission',
            params: { dongCode: String(unset.dong_code), mode: 'setup' },
          },
        },
      };
    }
    return territories && territories.length > 0
      ? {
          title: '세팅을 모두 마쳤어요',
          description: '땅따먹기가 시작되면 다른 팀이 내 땅에 도전해요.',
        }
      : {
          title: '이번에는 대표가 되지 못했어요',
          description: '땅따먹기가 시작되면 다른 팀 땅에 도전해서 내 땅을 만들 수 있어요.',
          action: { label: '선발 결과 보기', href: '/map/territory/representatives' },
        };
  }

  if (pending) {
    return {
      title: '새 미션이 기다리고 있어요',
      description: `${pending.dong_name}의 방어 사진을 다시 찍어야 새 미션이 적용돼요.`,
      action: {
        label: '내 땅 보기',
        href: {
          pathname: '/map/territory/manage',
          params: { dongCode: String(pending.dong_code) },
        },
      },
    };
  }
  return {
    title: '다른 팀 땅을 빼앗아 보세요',
    description: '지도에서 동을 눌러 도전하거나, 우리 팀 동료의 땅을 개발해 땅값을 올려요.',
    action: { label: '지도로 가기', href: '/map' },
  };
}

function TodoCard({
  phase,
  preferences,
  myTerritories,
  loading,
}: {
  phase: ActivePhase;
  preferences: DongPreference[] | undefined;
  myTerritories: MyTerritory[] | undefined;
  loading: boolean;
}) {
  if (loading) return <Skeleton className="h-[140px] w-full rounded-md" />;
  const todo = getTodo(phase, preferences, myTerritories);
  const action = todo.action;

  return (
    <View className="gap-md rounded-md border border-gray-200 bg-white p-lg">
      <BattleTag label="지금 할 일" />
      <View className="gap-xs">
        <Typography variant="h2" className="text-gray-800">
          {todo.title}
        </Typography>
        <Typography variant="body3" className="text-gray-500">
          {todo.description}
        </Typography>
      </View>
      {todo.extra}
      {action && (
        <BattleButton
          content={action.label}
          // 지도는 같은 스택의 첫 화면이라 push하지 않고 그 화면으로 돌아간다.
          onclick={() =>
            action.href === '/map' ? router.navigate('/map') : router.push(action.href)
          }
        />
      )}
    </View>
  );
}

function MyTerritorySection({
  territories,
  maxOwned,
  teamGu,
  isLoading,
  isError,
  onRetry,
}: {
  territories: MyTerritory[] | undefined;
  maxOwned: number | undefined;
  teamGu: string | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  return (
    <View className="gap-md">
      <View className="flex-row items-center justify-between">
        <Text className="font-title text-2xl text-gray-800">내 땅</Text>
        {territories && maxOwned !== undefined && (
          <View className="rounded-full bg-primary-100 px-md py-xs">
            <Typography variant="h4" className="text-primary-600">
              {`${territories.length}/${maxOwned}곳`}
            </Typography>
          </View>
        )}
      </View>
      {isLoading ? (
        <Skeleton className="h-[240px] w-full rounded-md" />
      ) : isError || !territories ? (
        <ErrorRetry message="내 땅을 불러오지 못했어요." onRetry={onRetry} />
      ) : (
        <MyTerritoryMap
          territories={territories}
          teamGu={teamGu}
          onSelect={(dongCode) =>
            router.push({
              pathname: '/map/territory/manage',
              params: { dongCode: String(dongCode) },
            })
          }
        />
      )}
    </View>
  );
}
