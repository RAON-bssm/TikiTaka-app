import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/error';
import Topic from '@/components/camera/Topic';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/feedback/ConfirmDialog';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import TextInput from '@/components/ui/input/TextInput';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { ADJECTIVE_SUGGESTIONS, NOUN_SUGGESTIONS } from '@/constants/territory/mission';
import { useConfirmLeave } from '@/hooks/navigation/useConfirmLeave';
import { useTerritory } from '@/hooks/territory/useTerritory';
import { useUpdateMission } from '@/hooks/territory/useUpdateMission';
import type { TerritoryDetail } from '@/types/territory';

type Mode = 'setup' | 'change';

const COPY: Record<Mode, { title: string; heading: string; submit: string }> = {
  setup: {
    title: '땅 세팅',
    heading: '도전자가 찍어야 할\n미션을 정해 주세요',
    submit: '방어 사진 찍으러 가기',
  },
  change: {
    title: '미션 바꾸기',
    heading: '새 미션을 정해 주세요',
    submit: '저장하고 사진 찍기',
  },
};

export default function MissionFormScreen() {
  const params = useLocalSearchParams<{ dongCode: string; mode?: string }>();
  const dongCode = Number(params.dongCode);
  const mode: Mode = params.mode === 'change' ? 'change' : 'setup';
  const { data: territory, isLoading, isError, refetch } = useTerritory(dongCode);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {isLoading ? (
        <View className="gap-lg px-xl pt-2xl">
          <BackButton title={COPY[mode].title} />
          <Skeleton className="h-[200px] w-full rounded-md" />
        </View>
      ) : isError || !territory ? (
        <View className="px-xl pt-2xl">
          <BackButton title={COPY[mode].title} />
          <ErrorRetry message="땅 정보를 불러오지 못했어요." onRetry={() => void refetch()} />
        </View>
      ) : (
        <MissionForm territory={territory} mode={mode} />
      )}
    </SafeAreaView>
  );
}

function MissionForm({ territory, mode }: { territory: TerritoryDetail; mode: Mode }) {
  const copy = COPY[mode];
  const { showToast } = useToast();
  const { mutate: updateMission, isPending } = useUpdateMission();

  // 바꾸는 중이던 대기 미션이 있으면 그것부터 이어서 고치게 한다.
  const [initial] = useState(() =>
    mode === 'change'
      ? {
          adjective: territory.pending_adjective ?? territory.mission_adjective ?? '',
          noun: territory.pending_noun ?? territory.mission_noun ?? '',
          criteria: territory.pending_criteria ?? territory.scoring_criteria ?? '',
        }
      : { adjective: '', noun: '', criteria: '' },
  );
  const [adjective, setAdjective] = useState(initial.adjective);
  const [noun, setNoun] = useState(initial.noun);
  const [criteria, setCriteria] = useState(initial.criteria);
  const isDirty =
    adjective !== initial.adjective || noun !== initial.noun || criteria !== initial.criteria;
  const { allowLeave, dialog: leaveDialog } = useConfirmLeave(isDirty);

  const trimmed = {
    adjective: adjective.trim(),
    noun: noun.trim(),
    criteria: criteria.trim(),
  };
  const preview = [trimmed.adjective, trimmed.noun].filter(Boolean).join(' ');
  const isValid = !!trimmed.adjective && !!trimmed.noun;

  const handleSubmit = () => {
    if (!isValid || isPending) return;
    const dongCode = String(territory.dong_code);

    // 세팅은 미션과 사진을 한 요청으로 보내므로, 입력값을 들고 카메라로 간다.
    if (mode === 'setup') {
      allowLeave();
      router.push({
        pathname: '/map/challenge-camera',
        params: {
          dongCode,
          purpose: 'setup',
          adjective: trimmed.adjective,
          noun: trimmed.noun,
          ...(trimmed.criteria && { criteria: trimmed.criteria }),
        },
      });
      return;
    }

    updateMission(
      {
        dongCode: territory.dong_code,
        adjective: trimmed.adjective,
        noun: trimmed.noun,
        ...(trimmed.criteria && { scoring_criteria: trimmed.criteria }),
      },
      {
        onSuccess: () => {
          allowLeave();
          router.replace({
            pathname: '/map/challenge-camera',
            params: { dongCode, purpose: 'retake' },
          });
        },
        onError: (error) => showToast(getApiErrorMessage(error, '미션을 바꾸지 못했어요')),
      },
    );
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      contentContainerClassName="grow"
      showsVerticalScrollIndicator={false}
      bottomOffset={16}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Pressable
        onPress={Keyboard.dismiss}
        accessible={false}
        className="grow gap-2xl px-xl py-2xl"
      >
        <BackButton title={`${copy.title} · ${territory.dong_name}`} />

        <View className="gap-sm">
          <Typography variant="h1" className="text-gray-800">
            {copy.heading}
          </Typography>
          <Typography variant="body3" className="text-gray-400">
            {mode === 'setup'
              ? '미션에 맞춰 방어 사진을 찍으면 AI가 채점한 점수가 방어 점수가 돼요. 도전자는 이 점수를 넘어야 땅을 빼앗아요.'
              : '새 미션은 바로 적용되지 않아요. 새 미션으로 방어 사진을 다시 찍어야 바뀌고, 그 점수가 새 방어 점수가 돼요.'}
          </Typography>
        </View>

        <Topic title={preview || '미션 미리보기'} />

        <View className="gap-sm">
          <View className="flex-row items-end gap-sm">
            <View className="flex-1">
              <TextInput
                label="형용사"
                placeholder="노을 지는"
                value={adjective}
                onChangeText={setAdjective}
                returnKeyType="next"
              />
            </View>
            <Typography variant="h2" className="pb-md text-gray-300">
              +
            </Typography>
            <View className="flex-1">
              <TextInput
                label="명사"
                placeholder="바다"
                value={noun}
                onChangeText={setNoun}
                returnKeyType="next"
              />
            </View>
          </View>
          <View className="flex-row gap-sm">
            <Suggestions
              words={ADJECTIVE_SUGGESTIONS}
              selected={adjective}
              onSelect={setAdjective}
            />
            <View className="w-[16px]" />
            <Suggestions words={NOUN_SUGGESTIONS} selected={noun} onSelect={setNoun} />
          </View>
        </View>

        <TextInput
          label="채점 기준 (선택)"
          placeholder="예: 하늘이 주황빛이고 수평선이 보여야 해요"
          value={criteria}
          onChangeText={setCriteria}
          returnKeyType="done"
        />

        <View className="grow" />
        <Button
          content={isPending ? '저장하는 중...' : copy.submit}
          disabled={!isValid || isPending}
          onclick={handleSubmit}
        />
      </Pressable>
      <ConfirmDialog
        {...leaveDialog}
        title="저장하지 않고 나갈까요?"
        description="입력한 미션이 저장되지 않아요."
        confirmLabel="나가기"
        cancelLabel="계속 쓰기"
      />
    </KeyboardAwareScrollView>
  );
}

function Suggestions({
  words,
  selected,
  onSelect,
}: {
  words: readonly string[];
  selected: string;
  onSelect: (word: string) => void;
}) {
  return (
    <View className="flex-1 flex-row flex-wrap gap-xs">
      {words.map((word) => {
        const active = word === selected.trim();
        return (
          <Pressable
            key={word}
            onPress={() => onSelect(word)}
            className={`rounded-full border px-sm py-xs ${
              active ? 'border-primary-600 bg-primary-100' : 'border-gray-200 bg-white'
            }`}
          >
            <Typography variant="caption" className={active ? 'text-primary-600' : 'text-gray-500'}>
              {word}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
