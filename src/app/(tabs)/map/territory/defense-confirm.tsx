import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/error';
import CapturedPhoto from '@/components/camera/CapturedPhoto';
import Topic from '@/components/camera/Topic';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { getPendingMission } from '@/constants/territory/mission';
import { useBlockLeaveWhilePending } from '@/hooks/navigation/useBlockLeaveWhilePending';
import { useRetakeDefensePhoto } from '@/hooks/territory/useRetakeDefensePhoto';
import { useSetupTerritory } from '@/hooks/territory/useSetupTerritory';
import { useTerritory } from '@/hooks/territory/useTerritory';
import type { DefensePhotoResult } from '@/types/territory';

type Params = {
  dongCode: string;
  purpose: 'setup' | 'retake';
  uri: string;
  adjective?: string;
  noun?: string;
  criteria?: string;
};

export default function DefenseConfirmScreen() {
  const params = useLocalSearchParams<Params>();
  const dongCode = Number(params.dongCode);
  const isSetup = params.purpose === 'setup';
  const { showToast } = useToast();

  const { data: territory } = useTerritory(dongCode);
  const setup = useSetupTerritory();
  const retake = useRetakeDefensePhoto();
  const isPending = setup.isPending || retake.isPending;
  const submittingRef = useRef(false);

  const pendingMission = territory && getPendingMission(territory);
  const mission = isSetup
    ? [params.adjective, params.noun].filter(Boolean).join(' ')
    : (pendingMission ?? territory?.mission ?? '');

  // 채점 중에 나가면 결과를 놓치므로 뒤로 가기를 막는다.
  useBlockLeaveWhilePending(isPending);

  const handleSuccess = (result: DefensePhotoResult) => {
    // 세팅은 허브나 내 땅 화면 어디서든 시작해 스택에 manage가 없을 수 있다. dismissTo는 그때 되돌아가지 않고
    // 현재 화면만 바꿔 세팅 카메라가 스택에 남으므로, 이 흐름이 쌓은 화면 수만큼 닫고 시작한 화면으로 돌아간다.
    // 세팅: 미션 입력 → 카메라 → 확인(3), 재촬영: 카메라 → 확인(2. 미션 바꾸기는 미션 입력을 카메라로 replace한다).
    router.dismiss(isSetup ? 3 : 2);
    router.push({
      pathname: '/map/territory/defense-result',
      params: {
        dongCode: params.dongCode,
        purpose: params.purpose,
        uri: params.uri,
        mission: result.mission,
        score: String(result.defense_score),
        previousScore: territory && !isSetup ? String(territory.defense_score) : '',
        review: result.review ?? '',
      },
    });
  };

  const handleError = (error: unknown) => {
    submittingRef.current = false;
    showToast(getApiErrorMessage(error, '방어 사진을 올리지 못했어요. 다시 시도해주세요.'));
  };

  const handleSubmit = () => {
    if (submittingRef.current || !params.uri) return;
    if (isSetup && (!params.adjective || !params.noun)) return;
    submittingRef.current = true;

    if (isSetup && params.adjective && params.noun) {
      setup.mutate(
        {
          dongCode,
          adjective: params.adjective,
          noun: params.noun,
          ...(params.criteria && { scoringCriteria: params.criteria }),
          imageUri: params.uri,
        },
        { onSuccess: handleSuccess, onError: handleError },
      );
      return;
    }
    retake.mutate(
      { dongCode, imageUri: params.uri },
      { onSuccess: handleSuccess, onError: handleError },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="grow gap-2xl px-xl py-2xl">
        <BackButton
          title={territory?.dong_name ?? (isSetup ? '땅 세팅' : '방어 사진')}
          disabled={isPending}
        />
        <Topic title={mission} />

        <CapturedPhoto uri={params.uri} />

        <View className="gap-xs">
          <Typography variant="caption" className="text-center text-gray-400">
            {isSetup
              ? 'AI가 채점한 점수가 이 땅의 방어 점수가 돼요'
              : '점수가 지금보다 낮아도 방어 점수가 그대로 바뀌어요'}
          </Typography>
          <Button
            content={isPending ? 'AI가 사진을 채점하고 있어요...' : '이 사진으로 정하기'}
            disabled={isSetup && !mission}
            onclick={handleSubmit}
          />
          {!isPending && (
            <Button content="다시 찍기" variant="light" onclick={() => router.back()} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
