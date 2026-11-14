import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/error';
import Topic from '@/components/camera/Topic';
import BattleButton from '@/components/territory/battle/BattleButton';
import BattleTag from '@/components/territory/battle/BattleTag';
import VersusPhotos from '@/components/territory/battle/VersusPhotos';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useBlockLeaveWhilePending } from '@/hooks/navigation/useBlockLeaveWhilePending';
import { useViewUrl } from '@/hooks/storage/useViewUrl';
import { useChallengeTerritory } from '@/hooks/territory/useChallengeTerritory';
import { useTerritory } from '@/hooks/territory/useTerritory';

export default function ChallengeConfirmScreen() {
  const params = useLocalSearchParams<{
    dongCode: string;
    uri: string;
    lat: string;
    lng: string;
  }>();
  const dongCode = Number(params.dongCode);
  const { showToast } = useToast();

  const { data: territory } = useTerritory(dongCode);
  const { mutate: challenge, isPending } = useChallengeTerritory();
  const defenderPhoto = useViewUrl(territory?.blocked ? undefined : territory?.defense_photo);
  // 같은 요청이 두 번 가면 서버가 409로 거절하지만, 응답 전에 다시 누르지 못하게 앞에서 막는다.
  const submittingRef = useRef(false);

  // 채점 중에 나가면 결과를 놓치므로(통행료는 이미 빠짐) 뒤로 가기를 막는다.
  useBlockLeaveWhilePending(isPending);

  const handleSubmit = () => {
    if (submittingRef.current || !territory || !params.uri) return;
    submittingRef.current = true;

    // 차지하면 상세 캐시가 새 주인으로 바뀌므로, 결과 화면에 보여 줄 상대 정보는 도전 전에 남겨 둔다.
    // 팀은 이름이 아니라 id로 넘긴다. 동네 목록을 아직 못 받았어도 결과 화면이 받은 뒤 이름을 찾는다.
    const hasDefender = territory.owner_id !== undefined;
    const defender = {
      hasDefender: hasDefender ? '1' : '0',
      defenderName: !hasDefender
        ? ''
        : territory.blocked
          ? '차단한 사용자'
          : (territory.owner_name ?? '알 수 없는 사용자'),
      defenderLocationId: String(territory.owner_location_id ?? ''),
      defenderPhoto: territory.blocked ? '' : (territory.defense_photo ?? ''),
      guLocationId: String(territory.location_id),
      myPhoto: params.uri,
    };

    challenge(
      {
        dongCode,
        imageUri: params.uri,
        lat: Number(params.lat),
        lng: Number(params.lng),
      },
      {
        onSuccess: (result) => {
          router.dismissAll();
          router.push({
            pathname: '/map/challenge-result',
            params: { challengeId: result.challenge_id, ...defender },
          });
        },
        onError: (error) => {
          submittingRef.current = false;
          showToast(getApiErrorMessage(error, '도전하지 못했어요. 다시 시도해주세요.'));
        },
      },
    );
  };

  const hasDefender = territory?.owner_id !== undefined;
  const defenderName = !territory
    ? ''
    : !hasDefender
      ? '주인 없는 땅'
      : territory.blocked
        ? '차단한 사용자'
        : (territory.owner_name ?? '지키는 대표');

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="grow gap-2xl px-xl py-2xl">
        <BackButton title={territory?.dong_name ?? '도전하기'} disabled={isPending} />
        <View className="gap-md">
          <BattleTag label="도전!" />
          <Topic title={territory?.mission ?? ''} />
        </View>

        <VersusPhotos
          me={{ uri: params.uri, name: '나', score: '?' }}
          rival={{ uri: defenderPhoto.uri, name: defenderName, score: territory?.defense_score }}
        />

        <View className="gap-sm">
          {territory && (
            <Typography variant="caption" className="text-center text-gray-400">
              {`AI가 채점한 점수로 방어 점수 ${territory.defense_score}점과 겨뤄요 · 결과와 관계없이 통행료 ${territory.toll.toLocaleString()} P를 내요`}
            </Typography>
          )}
          <BattleButton
            content={isPending ? 'AI가 채점하고 있어요...' : '콕! 도전하기'}
            disabled={!territory}
            onclick={handleSubmit}
          />
          {!isPending && (
            // 바로 뒤는 편집 화면이라, 편집까지 닫아 카메라로 돌아간다.
            <Button content="다시 찍기" variant="light" onclick={() => router.dismiss(2)} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
