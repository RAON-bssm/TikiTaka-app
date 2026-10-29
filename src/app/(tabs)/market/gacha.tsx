import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/error';
import CapsuleReveal from '@/components/market/gotcha/CapsuleReveal';
import GachaMachine, {
  MACHINE_ASPECT_RATIO,
  MACHINE_EXIT,
} from '@/components/market/gotcha/GachaMachine';
import Gotcha from '@/components/market/gotcha/Gotcha';
import PullButton from '@/components/market/gotcha/PullButton';
import MyPointBadge from '@/components/market/MyPointBadge';
import ShopTabs from '@/components/market/ShopTabs';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Header from '@/components/ui/Header';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { GASHAPON_OPTIONS, toGotchaPull, type GotchaPull } from '@/constants/market';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';
import { useDrawGashapon } from '@/hooks/product/useDrawGashapon';
import { useProducts } from '@/hooks/product/useProducts';

export default function GachaScreen() {
  // 뽑기 결과 큐. 탭할 때마다 하나씩 소비한다.
  const [results, setResults] = useState<GotchaPull[]>([]);
  const [index, setIndex] = useState(0);

  const current = results[index];

  const { data: products, isError, refetch } = useProducts();
  const { config: myConfig, isLoaded: isCharacterConfigLoaded } = useCharacterConfig();
  const { mutate: draw, isPending } = useDrawGashapon();
  const { showToast } = useToast();

  const pullingRef = useRef(false);
  const machineRef = useRef<View>(null);
  const reduceMotion = useReducedMotion();
  // cranking: 손잡이를 돌리며 응답을 기다림 → revealing: 캡슐이 나와 열리길 기다림 → 결과(results) 표시
  const [phase, setPhase] = useState<'idle' | 'cranking' | 'revealing'>('idle');
  /** 응답은 왔지만 연출이 끝나지 않아 아직 보여 주지 않은 결과 */
  const [pendingResults, setPendingResults] = useState<GotchaPull[] | null>(null);
  const [revealFrom, setRevealFrom] = useState<{ x: number; y: number } | null>(null);

  const showResults = (pulls: GotchaPull[]) => {
    setResults(pulls);
    setIndex(0);
  };

  const handlePull = (productId: string) => {
    if (pullingRef.current || isPending || !isCharacterConfigLoaded || phase !== 'idle') return;
    pullingRef.current = true;
    if (!reduceMotion) setPhase('cranking');
    draw(
      { product_id: productId },
      {
        onSuccess: (items) => {
          const pulls = items.map((item) => toGotchaPull(item, myConfig));
          if (reduceMotion) showResults(pulls);
          else setPendingResults(pulls);
        },
        onError: (error) => {
          setPhase('idle');
          showToast(getApiErrorMessage(error, '뽑기에 실패했어요. 다시 시도해주세요.'));
        },
        onSettled: () => {
          pullingRef.current = false;
        },
      },
    );
  };

  // 응답이 빨라도 손잡이가 한 바퀴는 돌고, 늦으면 올 때까지 계속 돈다.
  const handleTurnEnd = () => {
    if (!pendingResults) return;
    setPhase('revealing');
    machineRef.current?.measureInWindow((x, y, width, height) =>
      setRevealFrom({ x: x + width * MACHINE_EXIT.x, y: y + height * MACHINE_EXIT.y }),
    );
  };

  const handleOpened = () => {
    if (pendingResults) showResults(pendingResults);
    setPendingResults(null);
    setRevealFrom(null);
    setPhase('idle');
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
            {/* Android가 이 View를 최적화로 없애면 measureInWindow 콜백이 오지 않아 캡슐 연출에서 멈춘다. */}
            <View
              ref={machineRef}
              collapsable={false}
              style={{ width: '70%', aspectRatio: MACHINE_ASPECT_RATIO }}
            >
              <GachaMachine cranking={phase === 'cranking'} onTurnEnd={handleTurnEnd} />
            </View>
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
                  disabled={isPending || !isCharacterConfigLoaded || phase !== 'idle'}
                  onPress={() => handlePull(option.productId)}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {phase === 'revealing' && revealFrom ? (
        <CapsuleReveal from={revealFrom} onOpened={handleOpened} />
      ) : null}

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
