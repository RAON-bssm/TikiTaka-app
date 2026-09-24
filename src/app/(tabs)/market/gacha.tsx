import { Image } from 'expo-image';
import { useState } from 'react';
import { Image as RNImage, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Gotcha from '@/components/market/gotcha/Gotcha';
import PullButton from '@/components/market/gotcha/PullButton';
import ShopTabs from '@/components/market/ShopTabs';
import Header from '@/components/ui/Header';
import PointBadge from '@/components/ui/PointBadge';
import Typography from '@/components/ui/Typography';
import { GOTCHA_COSTS, pullGotcha, USER_POINT, type GotchaPull } from '@/constants/market';

const MACHINE = require('@/assets/icons/gotcha.webp');
const { width, height } = RNImage.resolveAssetSource(MACHINE);
const MACHINE_ASPECT_RATIO = width / height;

export default function GachaScreen() {
  // 뽑기 결과 큐. 탭할 때마다 하나씩 소비한다.
  const [results, setResults] = useState<GotchaPull[]>([]);
  const [index, setIndex] = useState(0);

  const current = results[index];

  const handlePull = (count: 1 | 5) => {
    // TODO: 포인트 차감 API 응답의 아이템으로 교체하고, 포인트 부족 시 토스트를 띄운다.
    setResults(pullGotcha(count));
    setIndex(0);
  };

  const handleDismiss = () => {
    if (index < results.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      setResults([]);
      setIndex(0);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex flex-1 flex-col gap-2xl px-xl pt-lg">
        <Header />

        <View className="w-full flex-row items-center justify-between">
          <ShopTabs />
          <PointBadge point={USER_POINT} />
        </View>

        <View className="flex-1">
          <View className="items-center gap-xs">
            <Typography variant="h2" className="text-primary-600">
              행운의 가챠
            </Typography>
            <Typography variant="body1" className="text-gray-400">
              무엇이 나올까요? 두근두근...
            </Typography>
          </View>

          <View className="flex-1 items-center justify-center">
            <Image
              source={MACHINE}
              contentFit="contain"
              style={{ width: '70%', aspectRatio: MACHINE_ASPECT_RATIO }}
            />
          </View>

          <View className="flex-row justify-center gap-lg pb-2xl">
            <PullButton label="1회 뽑기" cost={GOTCHA_COSTS.single} onPress={() => handlePull(1)} />
            <PullButton label="5회 뽑기" cost={GOTCHA_COSTS.multi} onPress={() => handlePull(5)} />
          </View>
        </View>
      </View>

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
