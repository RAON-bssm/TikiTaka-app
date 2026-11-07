import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/error';
import ArrowUpIcon from '@/assets/icons/arrow-up.svg';
import CloseIcon from '@/assets/icons/close.svg';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { findDong, getDongsInGu } from '@/constants/territory/region';
import { useDongPreferences, useUpdateDongPreferences } from '@/hooks/territory/useDongPreferences';
import { useMyInfo } from '@/hooks/user/useMyInfo';

const MAX_PREFERENCES = 3;

export default function DongPreferencesScreen() {
  const myInfo = useMyInfo();
  const preferences = useDongPreferences();
  const gu = myInfo.data?.main_location.location_name;

  const isLoading = myInfo.isLoading || preferences.isLoading;
  const isError = myInfo.isError || preferences.isError;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <View className="px-xl pt-2xl">
        <BackButton title="희망 동 고르기" />
      </View>
      {isLoading ? (
        <View className="gap-lg px-xl pt-2xl">
          <Skeleton className="h-[160px] w-full rounded-md" />
          <Skeleton className="h-[240px] w-full rounded-md" />
        </View>
      ) : isError || !gu || !preferences.data ? (
        <ErrorRetry
          message="희망 동을 불러오지 못했어요."
          onRetry={() => {
            void myInfo.refetch();
            void preferences.refetch();
          }}
        />
      ) : (
        <PreferenceForm
          gu={gu}
          initialCodes={[...preferences.data]
            .sort((a, b) => a.priority - b.priority)
            .map((preference) => preference.dong_code)}
        />
      )}
    </SafeAreaView>
  );
}

function PreferenceForm({ gu, initialCodes }: { gu: string; initialCodes: number[] }) {
  const { showToast } = useToast();
  const { mutate: save, isPending } = useUpdateDongPreferences();
  const [codes, setCodes] = useState(initialCodes);
  const dongs = getDongsInGu(gu);
  const changed = codes.join() !== initialCodes.join();

  const toggle = (code: number) => {
    if (codes.includes(code)) {
      setCodes(codes.filter((item) => item !== code));
      return;
    }
    if (codes.length >= MAX_PREFERENCES) {
      showToast(`희망 동은 ${MAX_PREFERENCES}개까지 고를 수 있어요`);
      return;
    }
    setCodes([...codes, code]);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...codes];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setCodes(next);
  };

  const handleSave = () => {
    if (isPending) return;
    save(codes, {
      onSuccess: () => {
        showToast(codes.length === 0 ? '희망 동을 모두 지웠어요' : '희망 동을 저장했어요');
        router.back();
      },
      onError: (error) => showToast(getApiErrorMessage(error, '희망 동을 저장하지 못했어요')),
    });
  };

  return (
    <>
      <ScrollView contentContainerClassName="gap-2xl px-xl pb-2xl pt-2xl">
        <View className="gap-sm">
          <Typography variant="h1" className="text-gray-800">
            {`${gu}에서 대표가 되고 싶은\n동을 골라 주세요`}
          </Typography>
          <Typography variant="body3" className="text-gray-400">
            포인트 순위가 높은 사람부터 1지망 → 2지망 → 3지망 순서로 배정돼요. 원하는 동이 모두
            찼거나 고르지 않으면 남은 동 중에서 무작위로 정해져요.
          </Typography>
        </View>

        <View className="gap-sm">
          <View className="flex-row items-center justify-between">
            <Typography variant="h3" className="text-gray-700">
              {`내 희망 동 ${codes.length}/${MAX_PREFERENCES}`}
            </Typography>
            {codes.length > 0 && (
              <Pressable onPress={() => setCodes([])} hitSlop={8}>
                <Typography variant="body3" className="text-gray-400">
                  전체 삭제
                </Typography>
              </Pressable>
            )}
          </View>
          {Array.from({ length: MAX_PREFERENCES }, (_, index) => {
            const code = codes[index];
            const dong = code === undefined ? undefined : findDong(code);
            return (
              <View
                key={index}
                className={`flex-row items-center gap-md rounded-sm border px-lg py-md ${
                  dong ? 'border-primary-300 bg-white' : 'border-gray-200 bg-gray-100'
                }`}
              >
                <Typography variant="h4" className={dong ? 'text-primary-600' : 'text-gray-400'}>
                  {`${index + 1}지망`}
                </Typography>
                <Typography
                  variant="body2"
                  className={`flex-1 ${dong ? 'text-gray-700' : 'text-gray-400'}`}
                >
                  {dong?.name ?? '아래에서 동을 골라 주세요'}
                </Typography>
                {dong && index > 0 && (
                  <Pressable
                    onPress={() => moveUp(index)}
                    hitSlop={8}
                    accessibilityLabel={`${dong.name} 순위 올리기`}
                  >
                    <ArrowUpIcon width={20} height={20} color={palette.gray[500]} />
                  </Pressable>
                )}
                {dong && (
                  <Pressable
                    onPress={() => toggle(dong.code)}
                    hitSlop={8}
                    accessibilityLabel={`${dong.name} 빼기`}
                  >
                    <CloseIcon width={20} height={20} />
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <View className="gap-sm">
          <Typography variant="h3" className="text-gray-700">
            {`${gu}의 동 ${dongs.length}곳`}
          </Typography>
          <View className="flex-row flex-wrap gap-sm">
            {dongs.map((dong) => {
              const priority = codes.indexOf(dong.code);
              const selected = priority >= 0;
              return (
                <Pressable
                  key={dong.code}
                  onPress={() => toggle(dong.code)}
                  className={`rounded-full border px-md py-sm ${
                    selected ? 'border-primary-600 bg-primary-100' : 'border-gray-200 bg-white'
                  }`}
                >
                  <Typography
                    variant={selected ? 'h4' : 'body3'}
                    className={selected ? 'text-primary-600' : 'text-gray-600'}
                  >
                    {selected ? `${priority + 1} · ${dong.name}` : dong.name}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-gray-100 bg-gray-50 px-xl pb-lg pt-md">
        <Button
          content={isPending ? '저장하는 중...' : '저장하기'}
          disabled={!changed || isPending}
          onclick={handleSave}
        />
      </View>
    </>
  );
}
