import { useState } from 'react';

import {
  CATEGORY_TO_PRODUCT_TYPE,
  SHOP_CATEGORIES,
  toMarketItem,
  type ShopCategory,
} from '@/constants/market';
import { useProducts } from '@/hooks/product/useProducts';

/**
 * 미리보기는 "기본 캐릭터에 아이템 하나만 얹은" 기준이라 선택이 누적되지 않고,
 * 카테고리를 바꾸면 그 카테고리의 첫 아이템으로 초기화한다.
 */
export function useShop() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const [category, setCategory] = useState<ShopCategory>(SHOP_CATEGORIES[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const productType = CATEGORY_TO_PRODUCT_TYPE[category];
  const items = (products ?? [])
    .filter((product) => product.product_type === productType)
    .map(toMarketItem);

  const selectedItem = items.find((item) => item.id === selectedId) ?? items[0];

  const selectCategory = (next: ShopCategory) => {
    setCategory(next);
    setSelectedId(null);
  };

  return {
    category,
    items,
    selectedId: selectedItem?.id ?? null,
    selectedItem,
    selectCategory,
    selectItem: setSelectedId,
    isLoading,
    isError,
    refetch,
  };
}
