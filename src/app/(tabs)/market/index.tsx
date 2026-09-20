import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/error';
import FeaturedItem from '@/components/market/FeaturedItem';
import ItemGrid from '@/components/market/ItemGrid';
import PurchaseModal from '@/components/market/PurchaseModal';
import ShopTabs from '@/components/market/ShopTabs';
import CategoryTabs from '@/components/ui/CategoryTabs';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import Header from '@/components/ui/Header';
import PointBadge from '@/components/ui/PointBadge';
import { useToast } from '@/components/ui/Toast';
import { SHOP_CATEGORIES, USER_POINT } from '@/constants/market';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';
import { useShop } from '@/hooks/market/useShop';
import { usePurchaseProduct } from '@/hooks/product/usePurchaseProduct';

const GRID_SKELETON_COUNT = 6;

export default function MarketScreen() {
  const {
    category,
    items,
    selectedId,
    selectedItem,
    selectCategory,
    selectItem,
    isLoading,
    isError,
    refetch,
  } = useShop();
  const { config, setConfig, isLoaded } = useCharacterConfig();
  const { mutate: purchaseProduct, isPending } = usePurchaseProduct();
  const { showToast } = useToast();
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  // 현재 내 캐릭터에 선택된 아이템의 파츠 하나만 얹은 전신 미리보기.
  const previewConfig = selectedItem
    ? { ...config, [selectedItem.group]: selectedItem.name }
    : config;

  const handleConfirmPurchase = () => {
    if (!selectedItem || isPending) return;

    purchaseProduct(
      { product_id: Number(selectedItem.id) },
      {
        onSuccess: () => {
          showToast('구매가 완료됐어요');
          // 구매한 아이템을 현재 캐릭터에 착용시켜 저장한다(마이페이지·꾸미기에 즉시 반영).
          // 저장된 캐릭터를 불러오기 전에 저장하면 기본 config로 저장본을 덮어쓴다.
          if (isLoaded) {
            setConfig({ ...config, [selectedItem.group]: selectedItem.name });
          }
          setPurchaseOpen(false);
        },
        onError: (error) =>
          showToast(getApiErrorMessage(error, '구매에 실패했어요. 다시 시도해주세요.')),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex flex-1 flex-col gap-2xl pt-lg">
        {/* 상단 요소는 다른 페이지와 동일하게 좌우 여백(px-xl)을 준다 */}
        <View className="gap-2xl px-xl">
          <Header />

          <View className="w-full flex-row items-center justify-between">
            <ShopTabs />
            <PointBadge point={USER_POINT} />
          </View>

          <FeaturedItem
            item={selectedItem}
            previewConfig={previewConfig}
            onBuy={() => isLoaded && setPurchaseOpen(true)}
            onCustomize={() => router.push('/profile/character')}
          />
        </View>

        <View className="flex-1 px-lg">
          <CategoryTabs tabs={SHOP_CATEGORIES} selected={category} onSelect={selectCategory} />

          {/* 알약형 탭과 이어지는 전체 폭 테두리 카드 (캐릭터 꾸미기와 동일한 형태) */}
          <View className="-mx-lg flex-1 rounded-t-md border-2 border-b-0 border-primary-600 bg-white p-lg">
            {isLoading ? (
              <View className="flex-row flex-wrap gap-sm">
                {Array.from({ length: GRID_SKELETON_COUNT }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square w-[30%] rounded-lg" />
                ))}
              </View>
            ) : isError ? (
              <ErrorRetry message="상점 목록을 불러오지 못했어요." onRetry={refetch} />
            ) : (
              <ItemGrid items={items} selectedId={selectedId} onSelect={selectItem} />
            )}
          </View>
        </View>
      </View>

      <PurchaseModal
        visible={purchaseOpen}
        item={selectedItem}
        previewConfig={previewConfig}
        onClose={() => setPurchaseOpen(false)}
        onConfirm={handleConfirmPurchase}
      />
    </SafeAreaView>
  );
}
