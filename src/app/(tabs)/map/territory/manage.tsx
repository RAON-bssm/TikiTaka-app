import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRequireCamera } from '@/components/camera/CameraPermissionGate';
import Topic from '@/components/camera/Topic';
import BattleButton from '@/components/territory/battle/BattleButton';
import BattleTag, { type BattleTone } from '@/components/territory/battle/BattleTag';
import { TILT } from '@/components/territory/battle/tilt';
import TerritoryStats from '@/components/territory/TerritoryStats';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { getPendingMission } from '@/constants/territory/mission';
import { useViewUrl } from '@/hooks/storage/useViewUrl';
import { useTeamName } from '@/hooks/territory/useTeamName';
import { useTerritory } from '@/hooks/territory/useTerritory';
import { useTerritoryPhase } from '@/hooks/territory/useTerritoryPhase';

// 사진 위 흰 글씨가 읽히도록 아래쪽만 어둡게 덮는다.
const HERO_SHADE = `${palette.gray[800]}B3`;
const PHOTO_SHADOW = `0px 8px 20px ${palette.gray[800]}33`;

export default function ManageTerritoryScreen() {
  const { dongCode: dongCodeParam } = useLocalSearchParams<{ dongCode: string }>();
  const dongCode = Number(dongCodeParam);
  const { data: territory, isLoading, isError, refetch } = useTerritory(dongCode);
  const { phase } = useTerritoryPhase();
  const teamName = useTeamName();
  const requireCamera = useRequireCamera();
  const photo = useViewUrl(territory?.defense_photo);

  const needsSetup = !!territory && !territory.defense_photo;
  const pendingMission = territory && getPendingMission(territory);
  const canEdit = phase === 'setup' || phase === 'battle';
  const status: { label: string; tone: BattleTone } = needsSetup
    ? { label: '세팅 필요', tone: 'neutral' }
    : pendingMission
      ? { label: '새 미션 대기', tone: 'rival' }
      : { label: '방어 중', tone: 'me' };

  const goToCamera = (purpose: 'retake') =>
    requireCamera(() =>
      router.push({
        pathname: '/map/challenge-camera',
        params: { dongCode: String(dongCode), purpose },
      }),
    );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="gap-2xl px-xl pb-3xl pt-2xl">
        <BackButton title="내 땅" />

        {isLoading ? (
          <View className="gap-lg">
            <Skeleton className="h-[88px] w-full rounded-md" />
            <Skeleton className="h-[232px] w-full rounded-md" />
            <Skeleton className="h-[66px] w-full rounded-sm" />
          </View>
        ) : isError || !territory ? (
          <ErrorRetry message="땅 정보를 불러오지 못했어요." onRetry={() => void refetch()} />
        ) : (
          <>
            <View className="gap-md">
              <BattleTag label={status.label} tone={status.tone} />
              <Topic title={territory.mission ?? '미션을 정해 주세요'} />
            </View>

            <View
              className="h-[280px] w-full overflow-hidden rounded-md border-4 border-white bg-gray-200"
              style={{ boxShadow: PHOTO_SHADOW }}
            >
              {photo.uri ? (
                <>
                  <Image source={{ uri: photo.uri }} resizeMode="cover" className="h-full w-full" />
                  <LinearGradient
                    colors={['transparent', HERO_SHADE]}
                    style={StyleSheet.absoluteFill}
                  />
                </>
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Typography variant="body3" className="text-gray-500">
                    아직 방어 사진이 없어요
                  </Typography>
                </View>
              )}
              {!needsSetup && (
                <View
                  className="absolute right-md top-md items-center rounded-md border-2 border-white bg-primary-600 px-md py-xs"
                  style={TILT.sticker}
                >
                  <Typography variant="caption" className="text-white">
                    방어 점수
                  </Typography>
                  <Text className="font-title text-2xl text-white">{territory.defense_score}</Text>
                </View>
              )}
              <View className="absolute bottom-0 left-0 right-0 p-lg">
                <Text
                  className={`font-title text-xl ${photo.uri ? 'text-white' : 'text-gray-500'}`}
                >
                  {[teamName(territory.location_id), territory.dong_name].filter(Boolean).join(' ')}
                </Text>
              </View>
            </View>

            {territory.scoring_criteria && (
              <Typography variant="caption" className="-mt-lg text-gray-400">
                {`채점 기준 · ${territory.scoring_criteria}`}
              </Typography>
            )}

            {pendingMission && (
              <View className="gap-sm rounded-md border border-secondary-200 bg-secondary-100 p-lg">
                <Typography variant="caption" className="text-secondary-500">
                  바꿀 미션
                </Typography>
                <Typography variant="h3" className="text-gray-800">
                  {pendingMission}
                </Typography>
                <Typography variant="body3" className="text-gray-500">
                  방어 사진을 다시 찍어야 적용돼요
                </Typography>
              </View>
            )}

            <TerritoryStats
              landPrice={territory.land_price}
              toll={territory.toll}
              className="rounded-md bg-white"
            />

            <Typography variant="caption" className="text-gray-400">
              하루 넘게 활동이 없으면 방어 점수가 매일 1점씩 내려가요(60점까지).
            </Typography>

            {canEdit && (
              <View className="gap-sm">
                {needsSetup ? (
                  <BattleButton
                    content="땅 세팅하기"
                    onclick={() =>
                      router.push({
                        pathname: '/map/territory/mission',
                        params: { dongCode: String(dongCode), mode: 'setup' },
                      })
                    }
                  />
                ) : (
                  <>
                    {pendingMission && (
                      <BattleButton
                        content="새 미션으로 사진 찍기"
                        onclick={() => goToCamera('retake')}
                      />
                    )}
                    <View className="flex-row gap-sm">
                      <Button
                        content="미션 바꾸기"
                        variant="light"
                        className="flex-1"
                        onclick={() =>
                          router.push({
                            pathname: '/map/territory/mission',
                            params: { dongCode: String(dongCode), mode: 'change' },
                          })
                        }
                      />
                      <Button
                        content="사진 다시 찍기"
                        variant="light"
                        className="flex-1"
                        onclick={() => goToCamera('retake')}
                      />
                    </View>
                    <Typography variant="caption" className="text-center text-gray-400">
                      다시 찍으면 점수가 지금보다 낮아도 방어 점수가 바뀌어요
                    </Typography>
                  </>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
