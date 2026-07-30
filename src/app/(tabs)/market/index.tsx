import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FeaturedItem from '@/components/market/FeaturedItem';
import ItemGrid from '@/components/market/ItemGrid';
import PurchaseModal from '@/components/market/PurchaseModal';
import ShopTabs from '@/components/market/ShopTabs';
import CategoryTabs from '@/components/ui/CategoryTabs';
import Header from '@/components/ui/Header';
import PointBadge from '@/components/ui/PointBadge';
import { SHOP_CATEGORIES, USER_POINT } from '@/constants/market';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';
import { useShop } from '@/hooks/market/useShop';

export default function MarketScreen() {
  const { category, items, selectedId, selectedItem, selectCategory, selectItem } = useShop();
  const { config, setConfig } = useCharacterConfig();
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const handleConfirmPurchase = () => {
    // TODO: 서버 연동 시 구매 요청(useMutation) 후 포인트/보유 목록 갱신
    // 구매한 아이템을 현재 캐릭터에 착용시켜 저장한다(마이페이지·꾸미기에 즉시 반영).
    if (selectedItem) {
      setConfig({ ...config, [selectedItem.group]: selectedItem.id });
    }
    setPurchaseOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex flex-1 flex-col gap-2xl px-lg pt-lg">
        <Header />

        <View className="w-full flex-row items-center justify-between">
          <ShopTabs />
          <PointBadge point={USER_POINT} />
        </View>

        <FeaturedItem
          item={selectedItem}
          onBuy={() => setPurchaseOpen(true)}
          onCustomize={() => router.push('/profile/character')}
        />

        <View className="flex-1">
          <CategoryTabs tabs={SHOP_CATEGORIES} selected={category} onSelect={selectCategory} />

          {/* 알약형 탭과 이어지는 전체 폭 테두리 카드 (캐릭터 꾸미기와 동일한 형태) */}
          <View className="-mx-lg flex-1 rounded-t-md border-2 border-b-0 border-primary-600 bg-white p-lg">
            <ItemGrid items={items} selectedId={selectedId} onSelect={selectItem} />
          </View>
        </View>
      </View>

      <PurchaseModal
        visible={purchaseOpen}
        item={selectedItem}
        onClose={() => setPurchaseOpen(false)}
        onConfirm={handleConfirmPurchase}
      />
    </SafeAreaView>
  );
}
