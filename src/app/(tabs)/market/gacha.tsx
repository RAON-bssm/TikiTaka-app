import { Image } from 'expo-image';
import { useState } from 'react';
import { Image as RNImage, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Gotcha from '@/components/market/gotcha/Gotcha';
import PullButton from '@/components/market/gotcha/PullButton';
import ShopTabs from '@/components/market/ShopTabs';
import Header from '@/components/ui/header';
import PointBadge from '@/components/ui/PointBadge';
import Typography from '@/components/ui/Typography';
import { GOTCHA_COSTS, pullGotcha, USER_POINT, type GotchaPull } from '@/constants/market';

// 원본 비율을 읽어 aspectRatio로 그린다 (Topic 컴포넌트와 동일한 패턴).
const MACHINE = require('@/assets/icons/gotcha.webp');
const { width, height } = RNImage.resolveAssetSource(MACHINE);
const MACHINE_ASPECT_RATIO = width / height;

export default function GachaScreen() {
  // 뽑기 결과 큐. 1회면 1개, 5회면 5개가 쌓이고 탭할 때마다 하나씩 소비한다.
  const [results, setResults] = useState<GotchaPull[]>([]);
  const [index, setIndex] = useState(0);

  const current = results[index];

  const handlePull = (count: 1 | 5) => {
    // TODO: 서버 연동 시 포인트 차감 API 호출 → 성공 응답의 아이템 목록으로 교체.
    // 포인트 부족 시 Toast("포인트가 부족해요") 노출 예정.
    setResults(pullGotcha(count));
    setIndex(0);
  };

  const handleDismiss = () => {
    if (index < results.length - 1) {
      setIndex((prev) => prev + 1); // 5회 뽑기: 다음 결과로
    } else {
      setResults([]); // 마지막 결과에서 탭하면 닫기
      setIndex(0);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex flex-1 flex-col gap-2xl px-lg pt-lg">
        <Header />

        <View className="w-full flex-row items-center justify-between">
          <ShopTabs />
          <PointBadge point={USER_POINT} />
        </View>

        {/* 가챠 본문 */}
        <View className="flex-1">
          {/* 타이틀 */}
          <View className="items-center gap-xs">
            <Typography variant="h2" className="text-primary-600">
              행운의 가챠
            </Typography>
            <Typography variant="body1" className="text-gray-300">
              무엇이 나올까요? 두근두근...
            </Typography>
          </View>

          {/* 뽑기 기계 */}
          <View className="flex-1 items-center justify-center">
            <Image
              source={MACHINE}
              contentFit="contain"
              style={{ width: '70%', aspectRatio: MACHINE_ASPECT_RATIO }}
            />
          </View>

          {/* 뽑기 버튼 */}
          <View className="flex-row justify-center gap-lg pb-2xl">
            <PullButton label="1회 뽑기" cost={GOTCHA_COSTS.single} onPress={() => handlePull(1)} />
            <PullButton label="5회 뽑기" cost={GOTCHA_COSTS.multi} onPress={() => handlePull(5)} />
          </View>
        </View>
      </View>

      {/* 결과 오버레이 — 화면 전체를 덮고, 공백 탭으로 닫힘 */}
      {current ? (
        <Gotcha
          result={current}
          progress={results.length > 1 ? { current: index + 1, total: results.length } : undefined}
          onDismiss={handleDismiss}
        />
      ) : null}
    </SafeAreaView>
  );
}
