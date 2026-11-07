import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Header from '@/components/ui/Header';
import Typography from '@/components/ui/Typography';
import { useViewUrl } from '@/hooks/storage/useViewUrl';
import { useChallenge } from '@/hooks/territory/useChallenge';
import { useMyInfo } from '@/hooks/user/useMyInfo';

/**
 * 도전 응답에는 상대(지키던 대표) 정보가 없어, 도전 화면이 도전 전에 남겨 둔 값을 파라미터로 받는다.
 * 결과만 다시 열 때(파라미터 없음)는 상대 쪽을 비워 둔다.
 */
type Params = {
  challengeId: string;
  guName?: string;
  myPhoto?: string;
  defenderName?: string;
  defenderTeam?: string;
  defenderPhoto?: string;
};

export default function ChallengeResultScreen() {
  const params = useLocalSearchParams<Params>();
  const { data: result, isLoading, isError, refetch } = useChallenge(params.challengeId);
  const { data: myInfo } = useMyInfo();
  const defenderPhoto = useViewUrl(params.defenderPhoto || undefined);

  const myTeam = myInfo?.main_location.location_name ?? '';
  const won = result?.result === 'CAPTURED';
  const guPrefix = params.guName ? `${params.guName} ` : '';

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
            <Skeleton className="h-[107px] w-full rounded-md" />
            <Skeleton className="h-[155px] w-full rounded-md" />
          </View>
        ) : isError || !result ? (
          <ErrorRetry message="도전 결과를 불러오지 못했어요." onRetry={() => void refetch()} />
        ) : (
          <>
            <View className="items-start gap-sm">
              <View
                className={`rounded-full px-md py-xs ${won ? 'bg-primary-100' : 'bg-gray-100'}`}
              >
                <Typography
                  variant="caption"
                  className={won ? 'text-primary-600' : 'text-gray-600'}
                >
                  {won ? '땅 차지' : '땅 방어됨'}
                </Typography>
              </View>
              <Typography variant="display" className="text-gray-800">
                {guPrefix}
                <Typography variant="display" className="text-primary-700">
                  {result.dong_name}
                </Typography>
                {won ? '은\n이제 내 땅이에요.' : '을\n차지할 수 없어요'}
              </Typography>
            </View>

            <View className="flex-row gap-lg">
              <PhotoCard
                uri={params.myPhoto}
                name={myInfo?.user_name ?? '나'}
                score={result.score}
                side="me"
              />
              <PhotoCard
                uri={defenderPhoto.uri}
                name={params.defenderName || '주인 없는 땅'}
                score={result.defense_score_at}
                side="defender"
              />
            </View>

            <View className="gap-sm rounded-sm border border-gray-200 bg-white p-md">
              {params.defenderTeam !== undefined && (
                <Row label="차지 팀">
                  <View className="flex-row items-center gap-xs">
                    <Typography variant="body3" className="text-secondary-500">
                      {params.defenderTeam || '주인 없음'}
                    </Typography>
                    <Typography variant="body3" className="text-gray-400">
                      →
                    </Typography>
                    <Typography
                      variant="body3"
                      className={won ? 'text-primary-600' : 'text-secondary-500'}
                    >
                      {won ? myTeam : params.defenderTeam || '주인 없음'}
                    </Typography>
                  </View>
                </Row>
              )}
              {won ? (
                <Row label="새 방어 점수" value={String(result.score)} />
              ) : (
                <Row label="모자란 점수" value={String(result.defense_score_at - result.score)} />
              )}
              <Row label="낸 통행료" value={`${result.toll.toLocaleString()} P`} />
            </View>

            {result.review && (
              <Typography variant="body3" className="text-gray-500">
                {result.review}
              </Typography>
            )}

            <View className="gap-sm">
              {!won && (
                <Button
                  content="다시 도전하기"
                  onclick={() =>
                    router.replace({
                      pathname: '/map/challenge-camera',
                      params: { dongCode: String(result.dong_code) },
                    })
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

function PhotoCard({
  uri,
  name,
  score,
  side,
}: {
  uri: string | undefined;
  name: string;
  score: number;
  side: 'me' | 'defender';
}) {
  const scoreText = (
    <Typography
      variant="display"
      className={side === 'me' ? 'text-primary-600' : 'text-secondary-500'}
    >
      {score}
    </Typography>
  );
  const nameText = (
    <Typography variant="h3" className="text-gray-500">
      {name}
    </Typography>
  );

  return (
    <View className="flex-1 gap-sm">
      <View className="h-[155px] w-full overflow-hidden rounded-md bg-gray-400">
        {uri && <Image source={{ uri }} resizeMode="cover" className="h-full w-full" />}
      </View>
      <View className="flex-row items-center justify-between px-xs">
        {side === 'me' ? scoreText : nameText}
        {side === 'me' ? nameText : scoreText}
      </View>
    </View>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Typography variant="body3" className="text-gray-700">
        {label}
      </Typography>
      {children ?? (
        <Typography variant="body3" className="text-gray-400">
          {value}
        </Typography>
      )}
    </View>
  );
}
