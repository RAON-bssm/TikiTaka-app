import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BattleButton from '@/components/territory/battle/BattleButton';
import BattlePhotoCard from '@/components/territory/battle/BattlePhotoCard';
import JudgeComment from '@/components/territory/battle/JudgeComment';
import BattleHero from '@/components/territory/battle/BattleHero';
import Header from '@/components/ui/Header';
import ResultRow from '@/components/territory/ResultRow';
import Typography from '@/components/ui/Typography';
import { findDong } from '@/constants/territory/region';

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
  const dong = findDong(Number(params.dongCode));
  const score = Number(params.score);
  const previous = params.previousScore ? Number(params.previousScore) : undefined;
  const isSetup = params.purpose === 'setup';

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="gap-3xl px-xl pb-2xl pt-2xl">
        <Header />

        <BattleHero
          tone="me"
          tag={isSetup ? '땅 세팅 완료!' : '방어 사진 교체!'}
          title={`방어 점수\n${score}점`}
          subtitle={`${dong ? `${dong.gu} ` : ''}${dong?.name ?? '내 땅'}을 이 사진으로 지켜요`}
        />

        <BattlePhotoCard uri={params.uri} name="내 방어 사진" tone="me" tilt="left" width="60%" />

        <View className="gap-sm rounded-sm border border-gray-200 bg-white p-md">
          <ResultRow label="미션">
            <Typography variant="body3" className="text-gray-400">
              {params.mission}
            </Typography>
          </ResultRow>
          {previous !== undefined ? (
            <ResultRow label="방어 점수">
              <View className="flex-row items-center gap-xs">
                <Typography variant="body3" className="text-gray-400">
                  {previous}
                </Typography>
                <Typography variant="body3" className="text-gray-400">
                  →
                </Typography>
                <Typography
                  variant="body3"
                  className={score >= previous ? 'text-primary-600' : 'text-secondary-500'}
                >
                  {score}
                </Typography>
              </View>
            </ResultRow>
          ) : (
            <ResultRow label="방어 점수">
              <Typography variant="body3" className="text-primary-600">
                {score}
              </Typography>
            </ResultRow>
          )}
        </View>

        {!!params.review && <JudgeComment review={params.review} />}

        <BattleButton content="내 땅으로 돌아가기" onclick={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}
