import { Image } from 'expo-image';
import { useState } from 'react';
import { Image as RNImage, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/error';
import Gotcha from '@/components/market/gotcha/Gotcha';
import MyPointBadge from '@/components/market/MyPointBadge';
import PullButton from '@/components/market/gotcha/PullButton';
import ShopTabs from '@/components/market/ShopTabs';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Header from '@/components/ui/Header';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { GASHAPON_OPTIONS, toGotchaPull, type GotchaPull } from '@/constants/market';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';
import { useDrawGashapon } from '@/hooks/product/useDrawGashapon';
import { useProducts } from '@/hooks/product/useProducts';

const MACHINE = require('@/assets/icons/gotcha.webp');
const { width, height } = RNImage.resolveAssetSource(MACHINE);
const MACHINE_ASPECT_RATIO = width / height;

export default function GachaScreen() {
  // 뽑기 결과 큐. 탭할 때마다 하나씩 소비한다.
  const [results, setResults] = useState<GotchaPull[]>([]);
  const [index, setIndex] = useState(0);

  const current = results[index];

  const { data: products, isError, refetch } = useProducts();
  const { config: myConfig } = useCharacterConfig();
  const { mutate: draw, isPending } = useDrawGashapon();
  const { showToast } = useToast();

  const handlePull = (productId: string) => {
    if (isPending) return;
    draw(
      { product_id: productId },
      {
        onSuccess: (items) => {
          setResults(items.map((item) => toGotchaPull(item, myConfig)));
          setIndex(0);
        },
        onError: (error) =>
          showToast(getApiErrorMessage(error, '뽑기에 실패했어요. 다시 시도해주세요.')),
      },
    );
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
          <MyPointBadge />
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

          {isError ? (
            <ErrorRetry message="가챠 정보를 불러오지 못했어요." onRetry={refetch} />
          ) : (
            <View className="flex-row justify-center gap-lg pb-2xl">
              {GASHAPON_OPTIONS.map((option) => (
                <PullButton
                  key={option.productId}
                  label={option.label}
                  cost={
                    products?.find((product) => product.product_id === option.productId)?.price ??
                    option.fallbackCost
                  }
                  disabled={isPending}
                  onPress={() => handlePull(option.productId)}
                />
              ))}
            </View>
          )}
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
