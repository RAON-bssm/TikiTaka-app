import { getApiErrorMessage } from '@/api/error';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Header from '@/components/ui/Header';
import RegionSelect from '@/components/ui/input/RegionSelect';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useLocations } from '@/hooks/location/useLocations';
import { useMyInfo } from '@/hooks/user/useMyInfo';
import { useReserveLocationChange } from '@/hooks/user/useLocationChange';
import { useMoveCurrentLocation } from '@/hooks/user/useMoveCurrentLocation';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COPY = {
  current: {
    title: '현재 지역 이동',
    submit: '이동하기',
    success: '현재 지역을 옮겼어요',
    failure: '현재 지역을 옮기지 못했어요',
    notice: '지금 있는 동네로 바로 옮겨요. 본진이 아니면 동네 점수는 쌓이지 않아요.',
  },
  main: {
    title: '본진 변경',
    submit: '예약하기',
    success: '다음 라운드부터 본진이 바뀌어요',
    failure: '본진 변경을 예약하지 못했어요',
    notice: '다음 라운드가 시작되면 바뀌어요. 그 전에는 취소할 수 있어요.',
  },
} as const;

export default function EditRegion() {
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const mode = modeParam === 'main' ? 'main' : 'current';
  const copy = COPY[mode];

  const { showToast } = useToast();
  const locationsQuery = useLocations();
  const myInfoQuery = useMyInfo();
  const moveCurrent = useMoveCurrentLocation();
  const reserveChange = useReserveLocationChange();
  const { mutate: submit, isPending } = mode === 'main' ? reserveChange : moveCurrent;

  const [selectedId, setSelectedId] = useState<number>();

  const isLoading = locationsQuery.isLoading || myInfoQuery.isLoading;
  const isError = locationsQuery.isError || myInfoQuery.isError;
  const retry = () => {
    locationsQuery.refetch();
    myInfoQuery.refetch();
  };

  // 본진 변경은 지금 본진을 고르면 서버가 400으로 거절하고, 이동은 지금 있는 곳으로 옮겨도 의미가 없어 뺀다.
  const excludedId =
    mode === 'main'
      ? myInfoQuery.data?.main_location.location_id
      : myInfoQuery.data?.current_location.location_id;
  const options = (locationsQuery.data ?? []).filter(
    (location) => location.location_id !== excludedId,
  );

  const handleSubmit = () => {
    if (isPending) return;

    if (!selectedId) {
      showToast('동네를 선택해주세요');
      return;
    }

    submit(selectedId, {
      onSuccess: () => {
        showToast(copy.success);
        router.back();
      },
      onError: (error) => showToast(getApiErrorMessage(error, copy.failure)),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex flex-1 flex-col items-start justify-between gap-4xl p-lg">
        <View className="flex flex-col items-center gap-2xl w-full">
          <Header />
          <View className="flex flex-col items-start gap-3xl w-full">
            <BackButton title={copy.title} />
            <View className="flex flex-col gap-sm">
              <Typography variant="display" className="text-gray-600">
                동네 정보 입력
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                {copy.notice}
              </Typography>
            </View>
            {isLoading ? (
              <Skeleton className="h-[65px] w-full rounded-sm" />
            ) : isError ? (
              <ErrorRetry message="동네 목록을 불러오지 못했어요." onRetry={retry} />
            ) : (
              <RegionSelect locations={options} value={selectedId} onChange={setSelectedId} />
            )}
          </View>
        </View>
        <View className="w-full">
          <Button
            content={isPending ? '처리 중...' : copy.submit}
            onclick={handleSubmit}
            className={isPending ? 'opacity-50' : ''}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
