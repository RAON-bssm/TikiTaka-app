import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CapturedPhoto from '@/components/camera/CapturedPhoto';
import Topic from '@/components/camera/Topic';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';

/** 세팅·재촬영 응답은 다시 조회할 API가 없어, 확인 화면이 응답값을 파라미터로 넘긴다. */
type Params = {
  dongCode: string;
  purpose: 'setup' | 'retake';
  uri: string;
  mission: string;
  score: string;
  /** 재촬영 전 방어 점수. 세팅이면 빈 문자열 */
  previousScore?: string;
  review?: string;
};

export default function DefenseResultScreen() {
  const params = useLocalSearchParams<Params>();
  const score = Number(params.score);
  const previous = params.previousScore ? Number(params.previousScore) : undefined;
  const diff = previous === undefined ? undefined : score - previous;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="grow gap-2xl px-xl py-2xl">
        <View className="items-start gap-sm">
          <View className="rounded-full bg-primary-100 px-md py-xs">
            <Typography variant="caption" className="text-primary-600">
              {params.purpose === 'setup' ? '땅 세팅 완료' : '방어 사진 변경'}
            </Typography>
          </View>
          <Typography variant="display" className="text-gray-800">
            {'방어 점수 '}
            <Typography variant="display" className="text-primary-700">
              {`${score}점`}
            </Typography>
          </Typography>
          {diff !== undefined && diff !== 0 && (
            <Typography
              variant="body3"
              className={diff > 0 ? 'text-primary-600' : 'text-secondary-500'}
            >
              {`이전보다 ${Math.abs(diff)}점 ${diff > 0 ? '올랐어요' : '내려갔어요'}`}
            </Typography>
          )}
        </View>

        <Topic title={params.mission} />

        <CapturedPhoto uri={params.uri} />

        {!!params.review && (
          <View className="gap-xs rounded-sm border border-gray-200 bg-white p-md">
            <Typography variant="caption" className="text-primary-600">
              AI 한마디
            </Typography>
            <Typography variant="body3" className="text-gray-600">
              {params.review}
            </Typography>
          </View>
        )}

        <View className="grow" />
        <Button content="확인" onclick={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}
