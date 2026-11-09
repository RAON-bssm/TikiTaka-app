import { router, type Href } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  advanceMockPhase,
  getMockShortcuts,
  installTerritoryMock,
  resetMockWorld,
  setMockLocations,
  setMockPoint,
  updateMockSettings,
} from '@/api/mock/territoryMockServer';
import {
  type MockChallengeOutcome,
  type MockPhase,
  useTerritoryMockSettings,
} from '@/api/mock/territoryMockStore';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import NavRow from '@/components/ui/NavRow';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { TERRITORY_CITY } from '@/constants/territory/region';
import { useLocations } from '@/hooks/location/useLocations';
import { useMyInfo } from '@/hooks/user/useMyInfo';

const PHASES: { value: MockPhase; label: string }[] = [
  { value: 'none', label: '사이클 없음' },
  { value: 'selection', label: '선발전' },
  { value: 'awaitingPick', label: '발표 대기' },
  { value: 'setup', label: '땅 세팅' },
  { value: 'battle', label: '땅따먹기' },
];

const OUTCOMES: { value: MockChallengeOutcome; label: string }[] = [
  { value: 'random', label: '점수대로' },
  { value: 'CAPTURED', label: '항상 차지' },
  { value: 'FAILED', label: '항상 실패' },
];

const DELAYS = [
  { value: 0, label: '바로' },
  { value: 2000, label: '2초' },
  { value: 8000, label: '8초' },
];

const POINTS = [0, 100, 5000];

/**
 * 개발 빌드 전용. 서버에 땅 데이터가 없는 동안 땅따먹기 화면을 직접 조작해 보는 곳이다.
 * 목 모드를 켜면 `/api/territory/*`만 가짜 서버가 응답하고, 로그인·포인트 등 나머지는 실제 서버를 쓴다.
 */
export default function DevTerritoryScreen() {
  const settings = useTerritoryMockSettings();
  const { showToast } = useToast();
  const { data: locations } = useLocations();
  const { data: myInfo } = useMyInfo();
  const busanGus = (locations ?? []).filter((location) => location.city_name === TERRITORY_CITY);

  useEffect(() => {
    installTerritoryMock();
  }, []);

  useEffect(() => {
    if (locations) setMockLocations(locations);
  }, [locations]);

  if (!__DEV__) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Typography variant="body2" className="text-gray-400">
          개발 빌드에서만 쓸 수 있어요.
        </Typography>
      </SafeAreaView>
    );
  }

  const shortcuts = settings.enabled ? getMockShortcuts() : undefined;
  const go = (href: Href, ready = true, reason = '이 단계에서는 해당하는 땅이 없어요') => {
    if (!ready) {
      showToast(reason);
      return;
    }
    router.push(href);
  };

  const toggle = () => {
    if (!settings.enabled && myInfo?.main_location.location_city_name === TERRITORY_CITY) {
      updateMockSettings({ enabled: true, teamGu: myInfo.main_location.location_name });
      return;
    }
    updateMockSettings({ enabled: !settings.enabled });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="gap-2xl px-xl pb-3xl pt-2xl">
        <BackButton title="땅따먹기 미리보기 (개발용)" />

        <View className="gap-sm rounded-md border border-gray-200 bg-white p-lg">
          <Typography variant="h3" className="text-gray-700">
            {settings.enabled ? '목 모드 켜짐' : '목 모드 꺼짐'}
          </Typography>
          <Typography variant="body3" className="text-gray-400">
            켜면 땅따먹기 API만 가짜 데이터로 응답해요. 앱을 다시 켜면 꺼져요. 지도 색칠까지 보려면
            지도 웹 주소가 개발 서버여야 해요.
          </Typography>
          <Button
            content={settings.enabled ? '목 모드 끄기' : '목 모드 켜기'}
            variant={settings.enabled ? 'light' : 'primary'}
            onclick={toggle}
          />
        </View>

        <Group title="단계">
          <Chips
            items={PHASES}
            selected={settings.phase}
            onSelect={(phase) => updateMockSettings({ phase })}
          />
          <Button content="다음 단계로 →" size="sm" variant="light" onclick={advanceMockPhase} />
          <Typography variant="caption" className="text-gray-400">
            선발전에서 고른 희망 동은 대표 발표(땅 세팅 단계) 때 1지망부터 내 땅이 돼요. 땅따먹기로
            넘어가면 세팅하지 않은 땅에 기본 미션이 들어가요.
          </Typography>
        </Group>

        <Group title="내 팀(본진 구)">
          <Chips
            items={busanGus.map((location) => ({
              value: location.location_name,
              label: location.location_name,
            }))}
            selected={settings.teamGu}
            onSelect={(teamGu) => updateMockSettings({ teamGu })}
          />
        </Group>

        <Group title="도전 결과">
          <Chips
            items={OUTCOMES}
            selected={settings.challengeOutcome}
            onSelect={(challengeOutcome) => updateMockSettings({ challengeOutcome })}
          />
        </Group>

        <Group title="AI 채점 시간">
          <Chips
            items={DELAYS}
            selected={settings.scoringDelayMs}
            onSelect={(scoringDelayMs) => updateMockSettings({ scoringDelayMs })}
          />
        </Group>

        <Group title="본진 구 위치 판정">
          <Chips
            items={[
              { value: true, label: '건너뛰기' },
              { value: false, label: '실제 위치로' },
            ]}
            selected={settings.skipLocation}
            onSelect={(skipLocation) => updateMockSettings({ skipLocation })}
          />
        </Group>

        <Group title={`내 포인트 (지금 ${myInfo?.point.toLocaleString() ?? '-'} P)`}>
          <Chips
            items={POINTS.map((point) => ({ value: point, label: `${point.toLocaleString()} P` }))}
            selected={-1}
            onSelect={setMockPoint}
          />
          <Typography variant="caption" className="text-gray-400">
            화면에만 바뀌어요. 내 정보를 다시 받으면 실제 포인트로 돌아가요.
          </Typography>
        </Group>

        <Button content="목 데이터 초기화" variant="light" size="sm" onclick={resetMockWorld} />

        {settings.enabled && shortcuts && (
          <Group title="화면 바로가기">
            <View className="gap-sm">
              <NavRow title="지도 (단계 카드·동 시트·개발)" onPress={() => go('/map')} />
              <NavRow title="땅따먹기 허브" onPress={() => go('/map/territory')} />
              <NavRow title="희망 동 고르기" onPress={() => go('/map/territory/preferences')} />
              <NavRow
                title="동 대표 선발 결과"
                onPress={() => go('/map/territory/representatives')}
              />
              <NavRow
                title="내 땅 관리"
                onPress={() =>
                  go(
                    {
                      pathname: '/map/territory/manage',
                      params: { dongCode: String(shortcuts.myDong ?? shortcuts.unsetDong) },
                    },
                    !!(shortcuts.myDong ?? shortcuts.unsetDong),
                  )
                }
              />
              <NavRow
                title="땅 세팅 (미션 입력 → 카메라)"
                description="'땅 세팅' 단계에서만 세팅 전 땅이 있어요"
                onPress={() =>
                  go(
                    {
                      pathname: '/map/territory/mission',
                      params: { dongCode: String(shortcuts.unsetDong), mode: 'setup' },
                    },
                    !!shortcuts.unsetDong,
                  )
                }
              />
              <NavRow
                title="미션 바꾸기"
                onPress={() =>
                  go(
                    {
                      pathname: '/map/territory/mission',
                      params: { dongCode: String(shortcuts.myDong), mode: 'change' },
                    },
                    !!shortcuts.myDong,
                  )
                }
              />
              <NavRow
                title="방어 사진 다시 찍기 (카메라)"
                onPress={() =>
                  go(
                    {
                      pathname: '/map/challenge-camera',
                      params: { dongCode: String(shortcuts.myDong), purpose: 'retake' },
                    },
                    !!shortcuts.myDong,
                  )
                }
              />
              <NavRow
                title="다른 팀 땅 도전 (카메라)"
                description="'땅따먹기' 단계에서만 도전할 수 있어요"
                onPress={() =>
                  go(
                    {
                      pathname: '/map/challenge-camera',
                      params: { dongCode: String(shortcuts.rivalDong) },
                    },
                    !!shortcuts.rivalDong,
                  )
                }
              />
              <NavRow
                title="최근 도전 결과 다시 보기"
                onPress={() =>
                  go(
                    {
                      pathname: '/map/challenge-result',
                      params: { challengeId: shortcuts.lastChallengeId ?? '' },
                    },
                    !!shortcuts.lastChallengeId,
                    '아직 도전한 기록이 없어요',
                  )
                }
              />
              <NavRow title="랭킹 탭 (동결 안내)" onPress={() => go('/ranking')} />
              <NavRow
                title="랭킹 탭 · 팀랭킹"
                description="'땅따먹기' 단계에서만 팀 순위가 나와요"
                onPress={() => go({ pathname: '/ranking', params: { tab: 'team' } })}
              />
              <NavRow
                title="본진 변경 (땅따먹기 안내)"
                onPress={() => go({ pathname: '/profile/edit-region', params: { mode: 'main' } })}
              />
            </View>
          </Group>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-sm">
      <Typography variant="h4" className="text-gray-600">
        {title}
      </Typography>
      {children}
    </View>
  );
}

function Chips<T extends string | number | boolean>({
  items,
  selected,
  onSelect,
}: {
  items: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-sm">
      {items.map((item) => {
        const active = item.value === selected;
        return (
          <Pressable
            key={String(item.value)}
            onPress={() => onSelect(item.value)}
            className={`rounded-full border px-md py-sm ${
              active ? 'border-primary-600 bg-primary-100' : 'border-gray-200 bg-white'
            }`}
          >
            <Typography
              variant={active ? 'h4' : 'body3'}
              className={active ? 'text-primary-600' : 'text-gray-600'}
            >
              {item.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
