import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TerritoryStats from '@/components/territory/TerritoryStats';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Typography from '@/components/ui/Typography';
import { getPendingMission } from '@/constants/territory/mission';
import { useViewUrl } from '@/hooks/storage/useViewUrl';
import { useTeamName } from '@/hooks/territory/useTeamName';
import { useTerritory } from '@/hooks/territory/useTerritory';
import { useTerritoryPhase } from '@/hooks/territory/useTerritoryPhase';

export default function ManageTerritoryScreen() {
  const { dongCode: dongCodeParam } = useLocalSearchParams<{ dongCode: string }>();
  const dongCode = Number(dongCodeParam);
  const { data: territory, isLoading, isError, refetch } = useTerritory(dongCode);
  const { phase } = useTerritoryPhase();
  const teamName = useTeamName();
  const photo = useViewUrl(territory?.defense_photo);

  const needsSetup = !!territory && !territory.defense_photo;
  const pendingMission = territory && getPendingMission(territory);
  const canEdit = phase === 'setup' || phase === 'battle';

  const goToCamera = (purpose: 'retake') =>
    router.push({
      pathname: '/map/challenge-camera',
      params: { dongCode: String(dongCode), purpose },
    });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="gap-2xl px-xl pb-3xl pt-2xl">
        <BackButton title="내 땅" />

        {isLoading ? (
          <View className="gap-lg">
            <Skeleton className="h-[28px] w-[160px] rounded-xs" />
            <Skeleton className="h-[232px] w-full rounded-md" />
            <Skeleton className="h-[66px] w-full rounded-sm" />
          </View>
        ) : isError || !territory ? (
          <ErrorRetry message="땅 정보를 불러오지 못했어요." onRetry={() => void refetch()} />
        ) : (
          <>
            <Typography variant="display" className="text-gray-800">
              {[teamName(territory.location_id), territory.dong_name].filter(Boolean).join(' ')}
            </Typography>

            <View className="h-[232px] w-full items-center justify-center overflow-hidden rounded-md bg-gray-100">
              {photo.uri ? (
                <Image source={{ uri: photo.uri }} resizeMode="cover" className="h-full w-full" />
              ) : (
                <Typography variant="body3" className="text-gray-400">
                  {needsSetup ? '아직 방어 사진이 없어요' : ''}
                </Typography>
              )}
            </View>

            <Card label="지금 미션">
              <Typography variant="h3" className="text-gray-700">
                {territory.mission ?? '아직 미션이 없어요'}
              </Typography>
              {territory.scoring_criteria && (
                <Typography variant="caption" className="text-gray-400">
                  {territory.scoring_criteria}
                </Typography>
              )}
            </Card>

            {pendingMission && (
              <Card label="바꿀 미션 (사진을 다시 찍어야 적용돼요)">
                <Typography variant="h3" className="text-primary-700">
                  {pendingMission}
                </Typography>
                {territory.pending_criteria && (
                  <Typography variant="caption" className="text-gray-400">
                    {territory.pending_criteria}
                  </Typography>
                )}
              </Card>
            )}

            <TerritoryStats
              defenseScore={territory.defense_score}
              landPrice={territory.land_price}
              toll={territory.toll}
            />

            <Typography variant="caption" className="text-gray-400">
              하루 넘게 활동이 없으면 방어 점수가 매일 1점씩 내려가요(60점까지).
            </Typography>

            {canEdit && (
              <View className="gap-sm">
                {needsSetup ? (
                  <Button
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
                      <Button
                        content="새 미션으로 사진 찍기"
                        onclick={() => goToCamera('retake')}
                      />
                    )}
                    <Button
                      content="미션 바꾸기"
                      variant={pendingMission ? 'light' : 'primary'}
                      onclick={() =>
                        router.push({
                          pathname: '/map/territory/mission',
                          params: { dongCode: String(dongCode), mode: 'change' },
                        })
                      }
                    />
                    <Button
                      content="방어 사진 다시 찍기"
                      variant="light"
                      onclick={() => goToCamera('retake')}
                    />
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

function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-xs rounded-sm border border-gray-200 bg-white p-md">
      <Typography variant="caption" className="text-primary-600">
        {label}
      </Typography>
      {children}
    </View>
  );
}
