import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FeaturedItem from '@/components/market/FeaturedItem';
import ItemGrid from '@/components/market/ItemGrid';
import ShopTabs from '@/components/market/ShopTabs';
import CategoryTabs from '@/components/ui/CategoryTabs';
import Header from '@/components/ui/header';
import PointBadge from '@/components/ui/PointBadge';
import {
  getShopItems,
  SHOP_CATEGORIES,
  SHOP_SECTIONS,
  USER_POINT,
  type ShopCategory,
  type ShopSection,
} from '@/constants/market';

export default function MarketScreen() {
  const [section, setSection] = useState<ShopSection>('상점');
  const [category, setCategory] = useState<ShopCategory>('머리');
  const items = useMemo(() => getShopItems(category), [category]);

  // 선택된 아이템 하나만 기본 캐릭터 위에 얹어 미리본다 (커스터마이저처럼 수정사항을 누적하지 않음)
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '');
  const selectedItem = items.find((item) => item.id === selectedId) ?? items[0];

  // 카테고리를 바꾸면 해당 카테고리의 첫 아이템으로 선택을 초기화한다
  const handleSelectCategory = (next: ShopCategory) => {
    setCategory(next);
    setSelectedId(getShopItems(next)[0]?.id ?? '');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex flex-1 flex-col gap-2xl px-lg pt-lg">
        <Header />

        <View className="w-full flex-row items-center justify-between">
          <ShopTabs tabs={SHOP_SECTIONS} selected={section} onSelect={setSection} />
          <PointBadge point={USER_POINT} />
        </View>

        <FeaturedItem
          character={selectedItem.character}
          name={selectedItem.name}
          description={selectedItem.description}
          price={selectedItem.price}
        />

        <View className="flex-1">
          <CategoryTabs
            tabs={SHOP_CATEGORIES}
            selected={category}
            onSelect={handleSelectCategory}
          />

          {/* 알약형 탭과 이어지는 전체 폭 테두리 카드 (캐릭터 꾸미기와 동일한 형태) */}
          <View className="-mx-lg flex-1 rounded-t-md border-2 border-b-0 border-primary-600 bg-gray-50 p-lg">
            <ItemGrid items={items} selectedId={selectedId} onSelect={setSelectedId} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
