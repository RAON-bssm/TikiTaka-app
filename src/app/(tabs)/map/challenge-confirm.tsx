import { isAxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { BackHandler, Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/error';
import Topic from '@/components/camera/Topic';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import useImageRatio from '@/hooks/useImageRatio';
import { useChallengeTerritory } from '@/hooks/territory/useChallengeTerritory';
import { useTeamName } from '@/hooks/territory/useTeamName';
import { useTerritory } from '@/hooks/territory/useTerritory';

export default function ChallengeConfirmScreen() {
  const params = useLocalSearchParams<{
    dongCode: string;
    uri: string;
    lat: string;
    lng: string;
  }>();
  const dongCode = Number(params.dongCode);
  const photoRatio = useImageRatio(params.uri);
  const { showToast } = useToast();
  const teamName = useTeamName();

  const { data: territory } = useTerritory(dongCode);
  const { mutate: challenge, isPending } = useChallengeTerritory();
  // 같은 요청이 두 번 가면 서버가 409로 거절하지만, 응답 전에 다시 누르지 못하게 앞에서 막는다.
  const submittingRef = useRef(false);

  // 채점 중에 나가면 결과를 놓치므로(통행료는 이미 빠짐) 뒤로 가기를 막는다.
  useEffect(() => {
    if (!isPending) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [isPending]);

  const handleSubmit = () => {
    if (submittingRef.current || !territory || !params.uri) return;
    submittingRef.current = true;

    // 차지하면 상세 캐시가 새 주인으로 바뀌므로, 결과 화면에 보여 줄 상대 정보는 도전 전에 남겨 둔다.
    const defender = {
      defenderName: territory.blocked ? '차단한 사용자' : (territory.owner_name ?? ''),
      defenderTeam: teamName(territory.owner_location_id) ?? '',
      defenderPhoto: territory.blocked ? '' : (territory.defense_photo ?? ''),
      guName: teamName(territory.location_id) ?? '',
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
          // 이미 쓴 사진은 다시 낼 수 없어 새로 찍게 한다.
          if (isAxiosError(error) && error.response?.status === 400) router.back();
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="grow gap-2xl px-xl py-2xl">
        <BackButton title={territory?.dong_name ?? '도전하기'} />
        <Topic title={territory?.mission ?? ''} />

        {params.uri && photoRatio ? (
          <Image
            source={{ uri: params.uri }}
            resizeMode="cover"
            className="w-full overflow-hidden rounded-md bg-gray-100"
            style={{ aspectRatio: photoRatio }}
          />
        ) : (
          <View className="h-[232px] w-full overflow-hidden rounded-md bg-gray-100" />
        )}

        <View className="gap-xs">
          {territory && (
            <Typography variant="caption" className="text-center text-gray-400">
              {`도전하면 결과와 관계없이 통행료 ${territory.toll.toLocaleString()} P를 내요`}
            </Typography>
          )}
          <Button
            content={isPending ? 'AI가 사진을 채점하고 있어요...' : '이 사진으로 도전하기'}
            disabled={!territory}
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
