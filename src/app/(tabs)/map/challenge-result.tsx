import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRequireCamera } from '@/components/camera/CameraPermissionGate';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Header from '@/components/ui/Header';
import BattleButton from '@/components/territory/battle/BattleButton';
import JudgeComment from '@/components/territory/battle/JudgeComment';
import ResultHero from '@/components/territory/battle/ResultHero';
import VersusPhotos from '@/components/territory/battle/VersusPhotos';
import ResultRow from '@/components/territory/ResultRow';
import Typography from '@/components/ui/Typography';
import { useViewUrl } from '@/hooks/storage/useViewUrl';
import { useChallenge } from '@/hooks/territory/useChallenge';
import { useMyTeam } from '@/hooks/territory/useMyTeam';
import { useTeamName } from '@/hooks/territory/useTeamName';
import { useMyInfo } from '@/hooks/user/useMyInfo';

/**
 * 도전 응답에는 상대(지키던 대표) 정보가 없어, 도전 화면이 도전 전에 남겨 둔 값을 파라미터로 받는다.
 * 결과만 다시 열 때(파라미터 없음)는 상대 쪽을 비워 둔다.
 */
type Params = {
  challengeId: string;
  guLocationId?: string;
  myPhoto?: string;
  /** '1'이면 주인 있던 땅, '0'이면 주인 없던 땅. 없으면(결과만 다시 열 때) 모른다. */
  hasDefender?: '1' | '0';
  defenderName?: string;
  defenderLocationId?: string;
  defenderPhoto?: string;
};

const toId = (value: string | undefined) => (value ? Number(value) : undefined);

export default function ChallengeResultScreen() {
  const params = useLocalSearchParams<Params>();
  const { data: result, isLoading, isError, refetch } = useChallenge(params.challengeId);
  const { data: myInfo } = useMyInfo();
  const { team } = useMyTeam();
  const teamName = useTeamName();
  const requireCamera = useRequireCamera();
  const defenderPhoto = useViewUrl(params.defenderPhoto || undefined);

  const myTeam = team?.location_name ?? '';
  const won = result?.result === 'CAPTURED';
  const guName = teamName(toId(params.guLocationId));
  const guPrefix = guName ? `${guName} ` : '';
  const hasDefender = params.hasDefender === '1';
  const defenderTeam = hasDefender
    ? (teamName(toId(params.defenderLocationId)) ?? '')
    : '주인 없음';

  const goToMap = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/map');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="gap-3xl px-xl pb-2xl pt-2xl">
        <Header />

        {isLoading ? (
          <View className="gap-2xl">
            <Skeleton className="h-[160px] w-full rounded-xl" />
            <Skeleton className="h-[240px] w-full rounded-md" />
          </View>
        ) : isError || !result ? (
          <ErrorRetry message="도전 결과를 불러오지 못했어요." onRetry={() => void refetch()} />
        ) : (
          <>
            <ResultHero
              tone={won ? 'me' : 'rival'}
              tag={won ? '땅 차지!' : '방어당했어요'}
              title={won ? `${result.dong_name}\n이제 내 땅!` : `${result.dong_name}\n차지 실패`}
              subtitle={
                won
                  ? `${guPrefix}${result.dong_name}에 우리 팀 깃발을 꽂았어요`
                  : `방어 점수 ${result.defense_score_at}점을 넘지 못했어요`
              }
            />

            <VersusPhotos
              me={{ uri: params.myPhoto, name: myInfo?.user_name ?? '나', score: result.score }}
              rival={{
                uri: defenderPhoto.uri,
                name:
                  params.hasDefender === undefined
                    ? '지키던 대표'
                    : hasDefender
                      ? (params.defenderName ?? '')
                      : '주인 없는 땅',
                score: result.defense_score_at,
              }}
              winner={won ? 'me' : 'rival'}
            />

            <View className="gap-sm rounded-sm border border-gray-200 bg-white p-md">
              {params.hasDefender !== undefined && (
                <ResultRow label="차지 팀">
                  <View className="flex-row items-center gap-xs">
                    <Typography variant="body3" className="text-secondary-500">
                      {defenderTeam}
                    </Typography>
                    <Typography variant="body3" className="text-gray-400">
                      →
                    </Typography>
                    <Typography
                      variant="body3"
                      className={won ? 'text-primary-600' : 'text-secondary-500'}
                    >
                      {won ? myTeam : defenderTeam}
                    </Typography>
                  </View>
                </ResultRow>
              )}
              {won ? (
                <ResultRow label="새 방어 점수" value={String(result.score)} />
              ) : (
                <ResultRow
                  label="모자란 점수"
                  value={String(result.defense_score_at - result.score)}
                />
              )}
              <ResultRow label="낸 통행료" value={`${result.toll.toLocaleString()} P`} />
            </View>

            {result.review && <JudgeComment review={result.review} />}

            <View className="gap-sm">
              {!won && (
                <BattleButton
                  content="다시 도전하기"
                  onclick={() =>
                    requireCamera(() =>
                      router.replace({
                        pathname: '/map/challenge-camera',
                        params: { dongCode: String(result.dong_code) },
                      }),
                    )
                  }
                />
              )}
              <Button content="지도로 돌아가기" variant="light" onclick={goToMap} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
