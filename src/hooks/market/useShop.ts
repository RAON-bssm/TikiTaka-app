import { useMemo, useState } from 'react';

import { getShopItems, SHOP_CATEGORIES, type ShopCategory } from '@/constants/market';

/**
 * 상점 카탈로그 상태(카테고리 · 아이템 목록 · 선택)를 담는 훅.
 *
 * 화면은 이 훅이 주는 값을 레이아웃에 꽂기만 하면 된다.
 * 선택은 "기본 캐릭터에 아이템 하나만 얹은" 미리보기 기준이라, 카테고리를 바꾸면
 * 해당 카테고리의 첫 아이템으로 초기화한다. (수정사항 누적 X)
 */
export function useShop() {
  const [category, setCategory] = useState<ShopCategory>(SHOP_CATEGORIES[0]);
  const items = useMemo(() => getShopItems(category), [category]);

  const [selectedId, setSelectedId] = useState<string>(items[0]?.id ?? '');
  const selectedItem = items.find((item) => item.id === selectedId) ?? items[0];

  /** 카테고리 전환 — 그 카테고리의 첫 아이템으로 선택을 초기화한다. */
  const selectCategory = (next: ShopCategory) => {
    setCategory(next);
    setSelectedId(getShopItems(next)[0]?.id ?? '');
  };

  return {
    category,
    items,
    selectedId,
    selectedItem,
    selectCategory,
    selectItem: setSelectedId,
  };
}
