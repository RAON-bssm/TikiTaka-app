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
import { useSetSubLocation } from '@/hooks/user/useSetSubLocation';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditRegion() {
  const { showToast } = useToast();
  const locationsQuery = useLocations();
  // 동네를 고르는 화면이라 이름만 주는 프로필이 아니라 id를 주는 내 정보를 쓴다.
  const myInfoQuery = useMyInfo();
  const { mutate: setSubLocation, isPending } = useSetSubLocation();

  const [selectedId, setSelectedId] = useState<number>();

  const isLoading = locationsQuery.isLoading || myInfoQuery.isLoading;
  const isError = locationsQuery.isError || myInfoQuery.isError;
  const retry = () => {
    locationsQuery.refetch();
    myInfoQuery.refetch();
  };

  // 메인 동네를 고르면 서버가 400으로 거절하므로 애초에 선택지에서 뺀다.
  const options = (locationsQuery.data ?? []).filter(
    (location) => location.location_id !== myInfoQuery.data?.main_location.location_id,
  );

  const handleSubmit = () => {
    if (isPending) return;

    if (!selectedId) {
      showToast('동네를 선택해주세요');
      return;
    }

    setSubLocation(selectedId, {
      onSuccess: () => {
        showToast('동네를 등록했어요');
        router.back();
      },
      // 실패는 전부 400이고 사유(없는 동네·메인과 동일)가 message로만 구분된다.
      onError: (error) => showToast(getApiErrorMessage(error, '동네 등록에 실패했어요')),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex flex-1 flex-col items-start justify-between gap-4xl p-lg">
        <View className="flex flex-col items-center gap-2xl w-full">
          <Header />
          <View className="flex flex-col items-start gap-3xl w-full">
            <BackButton title="동네 수정" />
            <Typography variant="display" className="text-gray-600">
              동네 정보 입력
            </Typography>
            {isLoading ? (
              // 라벨 19 + gap-xs 4 + 선택칸 42(p-md 24 + text-sm 16 + border 2)
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
            content={isPending ? '등록 중...' : '등록하기'}
            onclick={handleSubmit}
            className={isPending ? 'opacity-50' : ''}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
