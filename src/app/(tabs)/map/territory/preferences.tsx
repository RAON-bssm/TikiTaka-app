import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/error';
import RadioSelectedIcon from '@/assets/icons/radio-selected.svg';
import RadioIcon from '@/assets/icons/radio.svg';
import BattleButton from '@/components/territory/battle/BattleButton';
import PreferenceMap from '@/components/territory/PreferenceMap';
import BattleTag from '@/components/territory/battle/BattleTag';
import { TILT } from '@/components/territory/battle/tilt';
import BackButton from '@/components/ui/BackButton';
import ConfirmDialog from '@/components/ui/feedback/ConfirmDialog';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import TextInput from '@/components/ui/input/TextInput';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { findDong, getDongsInTeam } from '@/constants/territory/region';
import { useConfirmLeave } from '@/hooks/navigation/useConfirmLeave';
import { useDongPreferences, useUpdateDongPreferences } from '@/hooks/territory/useDongPreferences';
import { useMyTeam } from '@/hooks/territory/useMyTeam';
import type { Location } from '@/types/location';

const MAX_PREFERENCES = 3;

export default function DongPreferencesScreen() {
  const myTeam = useMyTeam();
  const preferences = useDongPreferences();
  const team = myTeam.team;

  const isLoading = myTeam.isLoading || preferences.isLoading;
  const isError = myTeam.isError || preferences.isError;

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
      ) : isError || !team || !preferences.data ? (
        <ErrorRetry
          message="희망 동을 불러오지 못했어요."
          onRetry={() => {
            myTeam.refetch();
            void preferences.refetch();
          }}
        />
      ) : (
        <PreferenceForm
          team={team}
          initialCodes={[...preferences.data]
            .sort((a, b) => a.priority - b.priority)
            .map((preference) => preference.dong_code)}
        />
      )}
    </SafeAreaView>
  );
}

function PreferenceForm({ team, initialCodes }: { team: Location; initialCodes: number[] }) {
  const gu = team.location_name;
  const { showToast } = useToast();
  const { mutate: save, isPending } = useUpdateDongPreferences();
  // 편집 중 다시 불러와도 기준이 바뀌지 않게 들어올 때 값으로 고정한다. 저장하면 화면을 나가므로 갱신할 일이 없다.
  const [baselineCodes] = useState(initialCodes);
  const [codes, setCodes] = useState(baselineCodes);
  const [query, setQuery] = useState('');
  const dongs = getDongsInTeam(team);
  const keyword = query.trim();
  const visibleDongs = keyword ? dongs.filter((dong) => dong.name.includes(keyword)) : dongs;
  const changed = codes.join() !== baselineCodes.join();
  const { allowLeave, dialog: leaveDialog } = useConfirmLeave(changed, isPending);

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

  const moveForward = (index: number) => {
    if (index === 0) return;
    const next = [...codes];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setCodes(next);
  };

  const handleSave = () => {
    if (isPending) return;
    save(codes, {
      onSuccess: () => {
        showToast(codes.length === 0 ? '희망 동을 모두 지웠어요' : '희망 동을 저장했어요', {
          type: 'success',
        });
        allowLeave();
        router.back();
      },
      onError: (error) => showToast(getApiErrorMessage(error, '희망 동을 저장하지 못했어요')),
    });
  };

  return (
    <>
      <ScrollView
        contentContainerClassName="gap-2xl px-xl pb-2xl pt-2xl"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="gap-sm">
          <BattleTag label="대표 선발전" />
          <Text className="font-title text-2xl text-gray-800">
            {`${gu}에서\n대표가 되고 싶은 동`}
          </Text>
          <Typography variant="body3" className="text-gray-400">
            포인트 순위가 높은 사람부터 1지망 → 2지망 → 3지망 순서로 배정돼요. 고르지 않으면 남은 동
            중에서 무작위로 정해져요.
          </Typography>
        </View>

        <View className="gap-sm">
          <View className="flex-row gap-sm">
            {Array.from({ length: MAX_PREFERENCES }, (_, index) => (
              <Slot
                key={index}
                priority={index + 1}
                code={codes[index]}
                onRemove={toggle}
                onMoveForward={() => moveForward(index)}
              />
            ))}
          </View>
          <View className="flex-row items-center justify-between">
            <Typography variant="caption" className="text-gray-400">
              눌러서 빼기 · 길게 눌러 한 칸 앞으로
            </Typography>
            {codes.length > 0 && (
              <Pressable onPress={() => setCodes([])} hitSlop={8}>
                <Typography variant="caption" className="text-gray-500 underline">
                  전체 삭제
                </Typography>
              </Pressable>
            )}
          </View>
        </View>

        <View className="gap-sm">
          <PreferenceMap dongs={dongs} codes={codes} onToggle={toggle} />
          <Typography variant="caption" className="text-gray-400">
            지도에서 동을 눌러도 고르거나 뺄 수 있어요
          </Typography>
        </View>

        <View className="gap-md">
          <TextInput
            placeholder={`${gu}의 동 이름 검색`}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          <View className="overflow-hidden rounded-md border border-gray-200 bg-white">
            {visibleDongs.length === 0 ? (
              <Typography variant="body3" className="p-lg text-center text-gray-400">
                {`'${keyword}'와 맞는 동이 없어요`}
              </Typography>
            ) : (
              visibleDongs.map((dong, index) => {
                const priority = codes.indexOf(dong.code);
                const selected = priority >= 0;
                return (
                  <Pressable
                    key={dong.code}
                    onPress={() => toggle(dong.code)}
                    className={`flex-row items-center justify-between px-lg py-md active:bg-gray-50 ${
                      index > 0 ? 'border-t border-gray-100' : ''
                    }`}
                  >
                    <Typography
                      variant={selected ? 'h4' : 'body2'}
                      className={selected ? 'text-gray-800' : 'text-gray-600'}
                    >
                      {dong.name}
                    </Typography>
                    <View className="flex-row items-center gap-sm">
                      {selected && (
                        <Typography variant="caption" className="text-primary-600">
                          {`${priority + 1}지망`}
                        </Typography>
                      )}
                      {selected ? (
                        <RadioSelectedIcon width={22} height={22} />
                      ) : (
                        <RadioIcon width={22} height={22} />
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-gray-100 bg-gray-50 px-xl pb-lg pt-md">
        <BattleButton
          content={isPending ? '저장하는 중...' : '저장하기'}
          disabled={!changed || isPending}
          onclick={handleSave}
        />
      </View>
      <ConfirmDialog
        {...leaveDialog}
        title="저장하지 않고 나갈까요?"
        description="고른 희망 동이 저장되지 않아요."
        confirmLabel="나가기"
        cancelLabel="계속 고르기"
      />
    </>
  );
}

function Slot({
  priority,
  code,
  onRemove,
  onMoveForward,
}: {
  priority: number;
  code: number | undefined;
  onRemove: (code: number) => void;
  onMoveForward: () => void;
}) {
  const dong = code === undefined ? undefined : findDong(code);

  if (!dong) {
    return (
      <View className="h-[84px] flex-1 items-center justify-center gap-xs rounded-md border-2 border-dashed border-gray-300 bg-white">
        <Text className="font-title text-2xl text-gray-300">+</Text>
        <Typography variant="caption" className="text-gray-400">
          {`${priority}지망`}
        </Typography>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => onRemove(dong.code)}
      onLongPress={onMoveForward}
      accessibilityLabel={`${priority}지망 ${dong.name}, 눌러서 빼기`}
      className="h-[84px] flex-1 items-center justify-center gap-xs rounded-md border-2 border-primary-600 bg-primary-100 px-xs active:opacity-80"
    >
      <View className="rounded-sm bg-primary-600 px-sm py-xs" style={TILT.sticker}>
        <Text className="font-title text-sm text-white">{`${priority}지망`}</Text>
      </View>
      <Typography variant="h4" className="text-center text-gray-800" numberOfLines={1}>
        {dong.name}
      </Typography>
    </Pressable>
  );
}
