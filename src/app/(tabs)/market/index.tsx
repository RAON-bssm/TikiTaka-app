import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FeaturedItem from '@/components/market/FeaturedItem';
import ItemGrid from '@/components/market/ItemGrid';
import ShopTabs from '@/components/market/ShopTabs';
import CategoryTabs from '@/components/ui/CategoryTabs';
import Header from '@/components/ui/header';
import PointBadge from '@/components/ui/PointBadge';
import {
  FEATURED_ITEM,
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
  const items = getShopItems(category);

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex flex-1 flex-col gap-2xl px-lg pt-lg">
        <Header />

        <View className="w-full flex-row items-center justify-between">
          <ShopTabs tabs={SHOP_SECTIONS} selected={section} onSelect={setSection} />
          <PointBadge point={USER_POINT} />
        </View>

        <FeaturedItem
          character={FEATURED_ITEM.character}
          name={FEATURED_ITEM.name}
          description={FEATURED_ITEM.description}
          price={FEATURED_ITEM.price}
        />

        <View className="flex-1">
          <CategoryTabs tabs={SHOP_CATEGORIES} selected={category} onSelect={setCategory} />

          {/* 알약형 탭과 이어지는 전체 폭 테두리 카드 (캐릭터 꾸미기와 동일한 형태) */}
          <View className="-mx-lg flex-1 rounded-t-md border-2 border-b-0 border-primary-600 bg-gray-50 p-lg">
            {/* 카테고리 전환 시 선택 상태를 초기화하기 위해 key로 리마운트 */}
            <ItemGrid key={category} items={items} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
